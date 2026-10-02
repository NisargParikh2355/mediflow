import { useEffect, useState } from 'react'

import DoctorList from './components/DoctorList'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'

import './App.css'

type Doctor = {
  name: string
  specialization: string
}

type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'

type DoctorVerificationStatus =
  | 'NOT_APPLICABLE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

type User = {
  id: number
  name: string
  email: string
  role: UserRole
  doctorVerificationStatus: DoctorVerificationStatus
}

function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] =
    useState(false)

  const [user, setUser] = useState<User | null>(null)

  const isResetPasswordPage =
    window.location.pathname === '/reset-password'

  useEffect(() => {
    const savedToken = localStorage.getItem(
      'mediflow_token',
    )

    if (!savedToken) {
      setLoading(false)
      return
    }

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/me',
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          },
        )

        if (!response.ok) {
          localStorage.removeItem(
            'mediflow_token',
          )

          setUser(null)
          return
        }

        const data = await response.json()

        setUser(data.user)
      } catch {
        setError(
          'Unable to restore your session',
        )
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setError('')

        const response = await fetch(
          'http://localhost:5000/api/doctors',
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch doctors',
          )
        }

        const doctorData: Doctor[] =
          await response.json()

        setDoctors(doctorData)
      } catch {
        setError('Unable to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const handleLogin = async (token: string) => {
    localStorage.setItem(
      'mediflow_token',
      token,
    )

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(
          'Unable to load account information',
        )
      }

      const data = await response.json()

      setUser(data.user)
      setShowLogin(false)
      setShowForgotPassword(false)
    } catch {
      localStorage.removeItem(
        'mediflow_token',
      )

      setError(
        'Login succeeded, but account information could not be loaded',
      )
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(
      'mediflow_token',
    )

    setUser(null)
    setShowLogin(false)
    setShowRegister(false)
    setShowForgotPassword(false)
  }

  const handleBackToLogin = () => {
    window.history.pushState(
      {},
      '',
      '/',
    )

    setShowForgotPassword(false)
    setShowLogin(true)
  }

  if (isResetPasswordPage) {
    return (
      <ResetPassword
        onBackLogin={handleBackToLogin}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-lg">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="font-medium text-slate-700">
            Loading MediFlow...
          </p>
        </div>
      </div>
    )
  }

  if (showRegister) {
    return (
      <Register
        onBackHome={() =>
          setShowRegister(false)
        }
      />
    )
  }

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBackLogin={handleBackToLogin}
      />
    )
  }

  if (showLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onBackHome={() =>
          setShowLogin(false)
        }
        onForgotPassword={() => {
          setShowLogin(false)
          setShowForgotPassword(true)
        }}
      />
    )
  }

  if (user) {
    if (user.role === 'PATIENT') {
      return (
        <PatientDashboard
          name={user.name}
          onLogout={handleLogout}
        />
      )
    }

    if (user.role === 'DOCTOR') {
      if (
        user.doctorVerificationStatus ===
        'PENDING'
      ) {
        return (
          <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div>
                  <h1 className="text-2xl font-bold text-blue-700">
                    MediFlow
                  </h1>

                  <p className="text-sm text-slate-500">
                    Doctor Portal
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </header>

            <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl items-center justify-center px-6 py-10">
              <div className="w-full rounded-2xl bg-white p-10 text-center shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl">
                  !
                </div>

                <h2 className="mt-6 text-3xl font-bold text-slate-800">
                  Doctor Account Verification
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-slate-600">
                  Hello, Dr. {user.name}. Your doctor
                  account has been created successfully
                  and is currently awaiting administrator
                  verification.
                </p>

                <div className="mx-auto mt-6 max-w-sm rounded-xl bg-amber-50 px-5 py-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Verification Status
                  </p>

                  <p className="mt-1 text-lg font-bold text-amber-900">
                    PENDING
                  </p>
                </div>

                <p className="mt-6 text-sm text-slate-500">
                  You will be able to access doctor
                  features after your account has been
                  approved.
                </p>
              </div>
            </main>
          </div>
        )
      }

      if (
        user.doctorVerificationStatus ===
        'REJECTED'
      ) {
        return (
          <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div>
                  <h1 className="text-2xl font-bold text-blue-700">
                    MediFlow
                  </h1>

                  <p className="text-sm text-slate-500">
                    Doctor Portal
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </header>

            <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-4xl items-center justify-center px-6 py-10">
              <div className="w-full rounded-2xl bg-white p-10 text-center shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
                  !
                </div>

                <h2 className="mt-6 text-3xl font-bold text-slate-800">
                  Doctor Account Not Approved
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-slate-600">
                  Hello, Dr. {user.name}. Your doctor
                  account was not approved by the
                  administrator.
                </p>

                <div className="mx-auto mt-6 max-w-sm rounded-xl bg-red-50 px-5 py-4">
                  <p className="text-sm font-semibold text-red-800">
                    Verification Status
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-900">
                    REJECTED
                  </p>
                </div>
              </div>
            </main>
          </div>
        )
      }

      if (
        user.doctorVerificationStatus ===
        'APPROVED'
      ) {
        return (
          <DoctorDashboard
            name={user.name}
            onLogout={handleLogout}
          />
        )
      }
    }

    if (user.role === 'ADMIN') {
      return (
        <AdminDashboard
          name={user.name}
          onLogout={handleLogout}
        />
      )
    }
  }

  return (
    <>
      <Navbar
        name="MediFlow Healthcare"
        showLogin={true}
      />

      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600">
            Welcome to MediFlow
          </h1>

          <p className="mt-2 text-gray-600">
            Connected healthcare for patients and
            doctors.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() =>
                setShowRegister(true)
              }
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Create Account
            </button>

            <button
              onClick={() =>
                setShowLogin(true)
              }
              className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 hover:bg-blue-50"
            >
              Sign In
            </button>
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Our Doctors
          </h2>

          {error ? (
            <p className="text-red-600">
              {error}
            </p>
          ) : doctors.length === 0 ? (
            <p className="text-gray-600">
              No doctors available yet.
            </p>
          ) : (
            <DoctorList doctors={doctors} />
          )}
        </section>
      </main>
    </>
  )
}

export default App