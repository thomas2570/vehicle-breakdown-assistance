'use client'

import { useState } from 'react'
import { login } from '@/features/auth/actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Welcome back</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Enter your email and password to sign in</p>
        </div>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
        
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-sm font-medium underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50 text-zinc-500">
                Forgot password?
              </Link>
            </div>
            <input 
              id="password"
              name="password" 
              type="password" 
              required 
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300"
            />
          </div>
          <button 
            type="submit" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-4 py-2 w-full"
          >
            Sign In
          </button>
        </form>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
