'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyMechanic(mechanicId: string, status: 'verified' | 'rejected') {
  const supabase = await createClient()
  
  // Verify the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  const userData = data as { role: string } | null;
    
  if (userData?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  // Update mechanic verification status
  const { error } = await supabase
    .from('mechanics')
    // @ts-ignore: TypeScript infers update as never due to complex Supabase generics
    .update({ is_verified: status === 'verified' } as any)
    .eq('id', mechanicId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/mechanics')
  return { success: true }
}
