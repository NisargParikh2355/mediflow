import 'dotenv/config'
import express, {
  Request,
  Response,
  NextFunction,
} from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import {
  sendLoginSuccessEmail,
  sendPasswordResetEmail,
} from './services/emailService'

const app = express()

const PORT = 5000

const connectionString = process.env.DATABASE_URL
const jwtSecret = process.env.JWT_SECRET
const frontendUrl =
  process.env.FRONTEND_URL || 'http://localhost:5174'

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined')
}

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({
  adapter,
})

app.use(cors())
app.use(express.json())

// --------------------------------------------------
// Types
// --------------------------------------------------

type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'

type AuthenticatedRequest = Request & {
  user?: {
    userId: number
    role: UserRole
  }
}

// --------------------------------------------------
// JWT Authentication Middleware
// --------------------------------------------------

function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization header is required',
    })
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Invalid authorization format',
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret as string,
    ) as JwtPayload

    if (
      typeof decoded.userId !== 'number' ||
      typeof decoded.role !== 'string'
    ) {
      return res.status(401).json({
        message: 'Invalid token payload',
      })
    }

    if (
      decoded.role !== 'PATIENT' &&
      decoded.role !== 'DOCTOR' &&
      decoded.role !== 'ADMIN'
    ) {
      return res.status(401).json({
        message: 'Invalid user role',
      })
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role as UserRole,
    }

    next()
  } catch (error) {
    console.error('JWT verification error:', error)

    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}

// --------------------------------------------------
// Role Authorization Middleware
// --------------------------------------------------

function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'User is not authenticated',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          'You do not have permission to access this resource',
      })
    }

    next()
  }
}

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediFlow backend is running',
  })
})

// --------------------------------------------------
// Doctor API
// --------------------------------------------------

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        id: 'asc',
      },
    })

    res.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)

    res.status(500).json({
      message: 'Failed to fetch doctors',
    })
  }
})

// --------------------------------------------------
// User Registration
// --------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      accountType,
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          'Name, email and password are required',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long',
      })
    }

    if (
      accountType &&
      accountType !== 'PATIENT' &&
      accountType !== 'DOCTOR'
    ) {
      return res.status(400).json({
        message: 'Invalid account type',
      })
    }

    const role: UserRole =
      accountType === 'DOCTOR'
        ? 'DOCTOR'
        : 'PATIENT'

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered',
      })
    }

    const passwordHash = await bcrypt.hash(
      password,
      10,
    )

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        doctorVerificationStatus:
          role === 'DOCTOR'
            ? 'PENDING'
            : 'NOT_APPLICABLE',
      },
    })

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      jwtSecret as string,
      {
        expiresIn: '1d',
      },
    )

    res.status(201).json({
      message:
        role === 'DOCTOR'
          ? 'Doctor account created and is awaiting verification'
          : 'Patient account created successfully',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorVerificationStatus:
          user.doctorVerificationStatus,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)

    res.status(500).json({
      message: 'Failed to register user',
    })
  }
})

// --------------------------------------------------
// Forgot Password
// --------------------------------------------------

app.post(
  '/api/auth/forgot-password',
  async (req, res) => {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({
          message: 'Email is required',
        })
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase()

      const genericMessage =
        'If an account exists with this email, a password reset link has been sent.'

      const user =
        await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

      // Do not reveal whether an account exists.
      if (!user) {
        return res.json({
          message: genericMessage,
        })
      }

      // Generate a secure random token.
      const resetToken =
        crypto.randomBytes(32).toString('hex')

      // Store only the hash of the token.
      const resetTokenHash =
        crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex')

      // Token expires after 15 minutes.
      const resetTokenExpiresAt =
        new Date(
          Date.now() + 15 * 60 * 1000,
        )

      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          resetPasswordTokenHash:
            resetTokenHash,

          resetPasswordTokenExpiresAt:
            resetTokenExpiresAt,
        },
      })

      const resetUrl =
        `${frontendUrl}/reset-password?token=${resetToken}`

      try {
        await sendPasswordResetEmail({
          name: user.name,
          email: user.email,
          resetUrl,
        })

        console.log(
          `Password reset email sent to ${user.email}`,
        )
      } catch (emailError) {
        console.error(
          'Password reset email failed:',
          emailError,
        )

        // Remove the reset token if the email
        // could not be sent.
        await prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            resetPasswordTokenHash: null,
            resetPasswordTokenExpiresAt: null,
          },
        })
      }

      return res.json({
        message: genericMessage,
      })
    } catch (error) {
      console.error(
        'Forgot password error:',
        error,
      )

      return res.status(500).json({
        message:
          'Unable to process password reset request',
      })
    }
  },
)

// --------------------------------------------------
// Reset Password
// --------------------------------------------------

app.post(
  '/api/auth/reset-password',
  async (req, res) => {
    try {
      const {
        token,
        newPassword,
      } = req.body

      if (!token || !newPassword) {
        return res.status(400).json({
          message:
            'Reset token and new password are required',
        })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message:
            'Password must be at least 8 characters long',
        })
      }

      // Hash the token received from the frontend.
      const tokenHash =
        crypto
          .createHash('sha256')
          .update(token)
          .digest('hex')

      const user =
        await prisma.user.findFirst({
          where: {
            resetPasswordTokenHash:
              tokenHash,

            resetPasswordTokenExpiresAt: {
              gt: new Date(),
            },
          },
        })

      if (!user) {
        return res.status(400).json({
          message:
            'Invalid or expired password reset link',
        })
      }

      const passwordHash =
        await bcrypt.hash(
          newPassword,
          10,
        )

      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          passwordHash,

          // Invalidate the reset token.
          resetPasswordTokenHash: null,

          resetPasswordTokenExpiresAt: null,
        },
      })

      return res.json({
        message:
          'Password reset successfully. You can now sign in with your new password.',
      })
    } catch (error) {
      console.error(
        'Reset password error:',
        error,
      )

      return res.status(500).json({
        message:
          'Unable to reset password',
      })
    }
  },
)

// --------------------------------------------------
// User Login
// --------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required',
      })
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash,
      )

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      jwtSecret as string,
      {
        expiresIn: '1d',
      },
    )

    // Send login-success email.
    // Email failure must not prevent login.
    if (
      user.role === 'PATIENT' ||
      user.role === 'DOCTOR'
    ) {
      try {
        await sendLoginSuccessEmail({
          name: user.name,
          email: user.email,
          role: user.role,
        })

        console.log(
          `Login success email sent to ${user.email}`,
        )
      } catch (emailError) {
        console.error(
          'Login success email failed:',
          emailError,
        )
      }
    }

    res.json({
      message: 'Login successful',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorVerificationStatus:
          user.doctorVerificationStatus,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      message: 'Failed to login',
    })
  }
})

// --------------------------------------------------
// Current User
// --------------------------------------------------

app.get(
  '/api/auth/me',
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'User is not authenticated',
        })
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          doctorVerificationStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      res.json({
        user,
      })
    } catch (error) {
      console.error(
        'Get current user error:',
        error,
      )

      res.status(500).json({
        message:
          'Failed to get current user',
      })
    }
  },
)

// --------------------------------------------------
// Patient Protected Route
// --------------------------------------------------

app.get(
  '/api/patient/dashboard',
  authenticateToken,
  requireRole('PATIENT'),
  (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    res.json({
      message:
        'Welcome to the patient dashboard',
      userId: req.user?.userId,
      role: req.user?.role,
    })
  },
)

// --------------------------------------------------
// Doctor Protected Route
// --------------------------------------------------

app.get(
  '/api/doctor/dashboard',
  authenticateToken,
  requireRole('DOCTOR'),
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            'User is not authenticated',
        })
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          doctorVerificationStatus: true,
        },
      })

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      if (
        user.doctorVerificationStatus !==
        'APPROVED'
      ) {
        return res.status(403).json({
          message:
            'Your doctor account is awaiting verification',

          verificationStatus:
            user.doctorVerificationStatus,
        })
      }

      res.json({
        message:
          'Welcome to the doctor dashboard',

        userId: user.id,

        role: user.role,

        name: user.name,

        doctorVerificationStatus:
          user.doctorVerificationStatus,
      })
    } catch (error) {
      console.error(
        'Doctor dashboard error:',
        error,
      )

      res.status(500).json({
        message:
          'Failed to load doctor dashboard',
      })
    }
  },
)

// --------------------------------------------------
// Admin Protected Route
// --------------------------------------------------

app.get(
  '/api/admin/dashboard',
  authenticateToken,
  requireRole('ADMIN'),
  (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    res.json({
      message:
        'Welcome to the admin dashboard',

      userId: req.user?.userId,

      role: req.user?.role,
    })
  },
)

// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `MediFlow backend running on http://localhost:${PORT}`,
  )
})