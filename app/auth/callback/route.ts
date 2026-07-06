import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      if (next && next !== '/') {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }

      // Get the user's role to redirect them properly
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'customer'
      
      let redirectUrl = requestUrl.origin
      if (role === 'admin') redirectUrl += '/admin'
      else if (role === 'mechanic') redirectUrl += '/mechanic'
      else redirectUrl += '/customer'

      return NextResponse.redirect(redirectUrl)
    }
  }

  // If there's an error or no code, redirect to login with an error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Invalid+or+expired+magic+link`)
}
