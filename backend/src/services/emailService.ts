import nodemailer from 'nodemailer'

const emailUser = process.env.EMAIL_USER
const emailPassword = process.env.EMAIL_PASSWORD

if (!emailUser || !emailPassword) {
  console.warn(
    'Email service is not configured. EMAIL_USER or EMAIL_PASSWORD is missing.',
  )
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
})

// --------------------------------------------------
// Login Success Email
// --------------------------------------------------

type LoginSuccessEmailProps = {
  name: string
  email: string
  role: 'PATIENT' | 'DOCTOR'
}

export async function sendLoginSuccessEmail({
  name,
  email,
  role,
}: LoginSuccessEmailProps) {
  if (!emailUser || !emailPassword) {
    console.warn(
      'Login success email skipped because email credentials are not configured.',
    )

    return
  }

  const accountType =
    role === 'DOCTOR' ? 'Doctor' : 'Patient'

  await transporter.sendMail({
    from: `"MediFlow Healthcare" <${emailUser}>`,
    to: email,
    subject: 'Successful Login to MediFlow',

    text: `Hello ${name},

You have successfully logged in to your MediFlow ${accountType} account.

Login time: ${new Date().toLocaleString()}

If you did not perform this login, please secure your account immediately.

Regards,
MediFlow Healthcare`,

    html: `
      <div style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 32px; border-radius: 16px;">

          <h1 style="color: #2563eb; margin-bottom: 8px;">
            MediFlow Healthcare
          </h1>

          <h2 style="color: #1e293b;">
            Successful Login
          </h2>

          <p style="color: #475569; font-size: 16px;">
            Hello <strong>${name}</strong>,
          </p>

          <p style="color: #475569; font-size: 16px;">
            You have successfully logged in to your
            <strong>${accountType}</strong> account.
          </p>

          <div style="background: #eff6ff; padding: 16px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0; color: #1e40af;">
              Login time:
              <strong>${new Date().toLocaleString()}</strong>
            </p>
          </div>

          <p style="color: #64748b;">
            If you did not perform this login, please secure
            your account immediately.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <p style="color: #94a3b8; font-size: 13px;">
            This is an automated security notification from MediFlow Healthcare.
          </p>

        </div>
      </div>
    `,
  })
}

// --------------------------------------------------
// Password Reset Email
// --------------------------------------------------

type PasswordResetEmailProps = {
  name: string
  email: string
  resetUrl: string
}

export async function sendPasswordResetEmail({
  name,
  email,
  resetUrl,
}: PasswordResetEmailProps) {
  if (!emailUser || !emailPassword) {
    console.warn(
      'Password reset email skipped because email credentials are not configured.',
    )

    return
  }

  await transporter.sendMail({
    from: `"MediFlow Healthcare" <${emailUser}>`,
    to: email,
    subject: 'Reset Your MediFlow Password',

    text: `Hello ${name},

We received a request to reset your MediFlow password.

Use the following link to create a new password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
MediFlow Healthcare`,

    html: `
      <div style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 32px; border-radius: 16px;">

          <h1 style="color: #2563eb; margin-bottom: 8px;">
            MediFlow Healthcare
          </h1>

          <h2 style="color: #1e293b;">
            Reset Your Password
          </h2>

          <p style="color: #475569; font-size: 16px;">
            Hello <strong>${name}</strong>,
          </p>

          <p style="color: #475569; font-size: 16px;">
            We received a request to reset your MediFlow password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 14px 24px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </div>

          <div style="background: #fff7ed; padding: 16px; border-radius: 12px;">
            <p style="margin: 0; color: #9a3412;">
              This password reset link expires in
              <strong>15 minutes</strong>.
            </p>
          </div>

          <p style="color: #64748b; margin-top: 24px;">
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <p style="color: #94a3b8; font-size: 13px;">
            This is an automated security notification from MediFlow Healthcare.
          </p>

        </div>
      </div>
    `,
  })
}