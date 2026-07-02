import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  if (
    !user &&
    (pathname.startsWith('/customer') || pathname.startsWith('/mechanic') || pathname.startsWith('/admin'))
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Redirection logic
  if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    const role = user.user_metadata?.role || 'customer'
    const url = request.nextUrl.clone()
    
    if (role === 'admin') url.pathname = '/admin'
    else if (role === 'mechanic') url.pathname = '/mechanic'
    else url.pathname = '/customer'
    
    if (pathname !== url.pathname) {
       return NextResponse.redirect(url)
    }
  }

  // Prevent accessing other roles' dashboards
  if (user) {
    const role = user.user_metadata?.role || 'customer'
    const url = request.nextUrl.clone()
    let shouldRedirect = false

    if (pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = '/'
      shouldRedirect = true
    } else if (pathname.startsWith('/mechanic') && role !== 'mechanic') {
      url.pathname = '/'
      shouldRedirect = true
    } else if (pathname.startsWith('/customer') && role !== 'customer') {
      url.pathname = '/'
      shouldRedirect = true
    }

    if (shouldRedirect) return NextResponse.redirect(url)
  }

  return supabaseResponse
}
