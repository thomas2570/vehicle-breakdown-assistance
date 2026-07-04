'use client'

import { useState } from 'react'
import { resetPassword } from '@/features/auth/actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const res = await resetPassword(formData)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Reset Password</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Enter your email to receive a password reset link</p>
        </div>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
        
        {success ? (
          <div className="space-y-4">
            <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-950/50 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-900">
              Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 h-10 px-4 py-2 w-full text-zinc-500 border border-zinc-200 dark:border-zinc-800"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
              <input 
                id="email"
                name="email" 
                type="email" 
                required 
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300" 
                placeholder="m@example.com"
              />
            </div>
            
            <button 
              type="submit" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-4 py-2 w-full"
            >
              Send Reset Link
            </button>
            <Link
              href="/login"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 h-10 px-4 py-2 w-full text-zinc-500"
            >
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
