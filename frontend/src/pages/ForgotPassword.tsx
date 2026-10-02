import { useState } from 'react'
import type { FormEvent } from 'react'

type ForgotPasswordProps = {
  onBackLogin: () => void
}

function ForgotPassword({
  onBackLogin,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setMessage('')
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to process your request',
        )
      }

      setMessage(data.message)
      setEmail('')
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
            Forgot Password?
          </h1>

          <p className="mt-2 text-slate-500">
            Enter your email and we'll send you a
            password reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading
              ? 'Sending...'
              : 'Send Reset Link'}
          </button>
        </form>

        <button
          type="button"
          onClick={onBackLogin}
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword