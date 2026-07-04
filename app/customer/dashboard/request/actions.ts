'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitBreakdownRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const problem_type = formData.get('problem_type') as string
  const vehicle_id = formData.get('vehicle_id') as string
  const description = formData.get('description') as string
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)

  const target_mechanic_id = formData.get('target_mechanic_id') as string | null

  if (!lat || !lng) {
     return { error: 'Location is required. Please allow GPS access.' }
  }

  const { data, error } = await supabase.from('breakdown_requests').insert({
    customer_id: user.id,
    vehicle_id,
    problem_type,
    description,
    lat,
    lng,
    mechanic_id: target_mechanic_id || null,
    status: 'pending'
  } as any).select().single()

  if (error) {
    return { error: error.message }
  }
  redirect(`/customer/request/${(data as any)?.id}`)
}

export async function getNearbyMechanics(lat: number, lng: number) {
  const supabase = await createClient()
  
  const { data: mechanics, error } = await supabase.rpc('get_nearby_mechanics', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: 50
  } as any)

  if (error || !mechanics) {
    return { error: 'Could not fetch mechanics', mechanics: [] }
  }

  return { mechanics }
}

export async function cancelBreakdownRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('breakdown_requests')
    .update({ status: 'cancelled' } as never)
    .eq('id', requestId)
    .eq('customer_id', user.id) // Ensure they own the request
    .in('status', ['pending', 'accepted']) // Only allow cancel if not en route/in progress? Or maybe anytime? Let's say pending/accepted.

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/customer/request/${requestId}`)
  return { success: true }
}
