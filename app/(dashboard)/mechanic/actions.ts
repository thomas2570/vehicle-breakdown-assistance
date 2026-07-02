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

  console.log(`[DEBUG] acceptRequest called. user.id: ${user.id}, requestId: ${requestId}`)

  // 1. First, check if the request actually exists and what its current state is
  const { data: currentReq, error: fetchErr } = await supabase
    .from('breakdown_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  
  console.log(`[DEBUG] Current request state:`, currentReq, `Fetch error:`, fetchErr)

  // 2. Attempt the update
  const { data, error } = await supabase
    .from('breakdown_requests')
    .update({ 
      status: 'accepted',
      mechanic_id: user.id
    })
    .eq('id', requestId)
    .eq('status', 'pending') // Only accept if it's still pending
    .select()
    .single()

  console.log(`[DEBUG] Update result - data:`, data, `error:`, error)

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { error: 'Failed to update: you might not have permission, or the request was already accepted.' }
  }

  revalidatePath('/mechanic')
  revalidatePath('/mechanic/requests')
  return { success: true }
}

export async function updateRequestStatus(requestId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('breakdown_requests')
    .update({ status: newStatus })
    .eq('id', requestId)
    .eq('mechanic_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { error: 'Failed to update: you might not have permission, or the request was not found.' }
  }

  revalidatePath('/mechanic')
  revalidatePath('/mechanic/requests')
  return { success: true }
}
