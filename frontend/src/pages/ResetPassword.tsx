import { useState } from 'react'
import type { FormEvent } from 'react'

type ResetPasswordProps = {
  onBackLogin: () => void
}

function ResetPassword({
  onBackLogin,
}: ResetPasswordProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const token = new URLSearchParams(
    window.location.search,
  ).get('token')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setSuccess('')
    setError('')

    if (!token) {
      setError(
        'This password reset link is invalid or incomplete.',
      )
      return
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields')
      return
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters long',
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to reset your password',
        )
      }

      setSuccess(data.message)

      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
          'Something went wrong. Please try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
            M
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Reset Password
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new password for your MediFlow
            account.
          </p>
        </div>

        {!token ? (
          <>
            <div className="rounded-xl bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              This password reset link is invalid or
              incomplete.
            </div>

            <button
              type="button"
              onClick={onBackLogin}
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Re-enter your new password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading
                  ? 'Resetting Password...'
                  : 'Reset Password'}
              </button>
            </form>

            {success && (
              <button
                type="button"
                onClick={onBackLogin}
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to Login
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPassword