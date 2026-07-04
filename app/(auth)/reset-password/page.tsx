'use client'

import { useState } from 'react'
import { updatePassword } from '@/features/auth/actions'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    const res = await updatePassword(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Enter New Password</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Please enter your new password below.</p>
        </div>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
        
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">New Password</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              required 
              minLength={6}
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300" 
            />
          </div>
          
          <button 
            type="submit" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-4 py-2 w-full"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
