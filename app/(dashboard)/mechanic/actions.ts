'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleAvailability(isAvailable: boolean, lat?: number, lng?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const updateData: any = { is_available: isAvailable }
  if (lat && lng) {
    updateData.current_lat = lat
    updateData.current_lng = lng
  }

  const { error } = await supabase
    .from('mechanics')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/mechanic')
  return { success: true }
}

export async function acceptRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('breakdown_requests')
    .update({ 
      status: 'accepted',
      mechanic_id: user.id
    })
    .eq('id', requestId)
    .eq('status', 'pending') // Only accept if it's still pending

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/mechanic')
  revalidatePath('/mechanic/requests')
  return { success: true }
}

export async function updateRequestStatus(requestId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('breakdown_requests')
    .update({ status: newStatus })
    .eq('id', requestId)
    .eq('mechanic_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/mechanic')
  revalidatePath('/mechanic/requests')
  return { success: true }
}
