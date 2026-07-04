'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyMechanic(mechanicId: string, status: 'verified' | 'rejected') {
  const supabase = await createClient()
  
  // Verify the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (userData?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  // Update mechanic verification status
  const { error } = await supabase
    .from('mechanics')
    .update({ verification_status: status })
    .eq('id', mechanicId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/mechanics')
  return { success: true }
}
