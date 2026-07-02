'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitBreakdownRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const problem_type = formData.get('problem_type') as string
  const vehicle_id = formData.get('vehicle_id') as string
  const description = formData.get('description') as string
  const location_lat = parseFloat(formData.get('lat') as string)
  const location_lng = parseFloat(formData.get('lng') as string)

  if (!location_lat || !location_lng) {
     return { error: 'Location is required. Please allow GPS access.' }
  }

  const { data, error } = await supabase.from('breakdown_requests').insert({
    customer_id: user.id,
    vehicle_id,
    problem_type,
    description,
    location_lat,
    location_lng,
    status: 'pending'
  }).select().single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/customer/request/${data.id}`)
}
