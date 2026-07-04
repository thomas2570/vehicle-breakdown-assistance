import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/register')

  if (!user && !isAuthRoute && url.pathname !== '/') {
    // no user, potentially respond by redirecting the user to the login page
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // If user is logged in, check their role in the profiles table
    // We can query the profile to redirect them if they try to access the wrong dashboard
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const profile = data as any;

    if (profile) {
      if (isAuthRoute || url.pathname === '/') {
        url.pathname = `/${profile.role}/dashboard`
        return NextResponse.redirect(url)
      }

      // Protect routes based on role
      if (url.pathname.startsWith('/customer') && profile.role !== 'customer') {
        url.pathname = `/${profile.role}/dashboard`
        return NextResponse.redirect(url)
      }
      if (url.pathname.startsWith('/mechanic') && profile.role !== 'mechanic') {
        url.pathname = `/${profile.role}/dashboard`
        return NextResponse.redirect(url)
      }
      if (url.pathname.startsWith('/admin') && profile.role !== 'admin') {
        url.pathname = `/${profile.role}/dashboard`
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
