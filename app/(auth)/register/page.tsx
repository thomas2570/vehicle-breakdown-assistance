'use client'

import { useState } from 'react'
import { signup } from '../actions'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'customer' | 'mechanic'>('customer')

  const handleSubmit = async (formData: FormData) => {
    formData.append('role', role)
    const res = await signup(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Create an account</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Enter your information to get started</p>
        </div>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
        
        <form action={handleSubmit} className="space-y-4">
          <div className="flex rounded-md bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                role === 'customer' ? 'bg-white text-zinc-950 shadow dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('mechanic')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                role === 'mechanic' ? 'bg-white text-zinc-950 shadow dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Mechanic
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="full_name">Full Name</label>
            <input 
              id="full_name" name="full_name" type="text" required 
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300" 
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input 
              id="email" name="email" type="email" required 
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300" 
              placeholder="m@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="phone">Phone Number</label>
            <input 
              id="phone" name="phone" type="tel" required 
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300" 
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {role === 'mechanic' && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="shop_name">Shop Name</label>
              <input 
                id="shop_name" name="shop_name" type="text" required 
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300" 
                placeholder="Joe's Auto Repair"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input 
              id="password" name="password" type="password" required 
              className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300"
            />
          </div>

          <button 
            type="submit" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-4 py-2 w-full mt-2"
          >
            Sign Up
          </button>
        </form>
        
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
