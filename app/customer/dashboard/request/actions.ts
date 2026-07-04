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
  const location_lat = parseFloat(formData.get('lat') as string)
  const location_lng = parseFloat(formData.get('lng') as string)

  const target_mechanic_id = formData.get('target_mechanic_id') as string | null

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
    mechanic_id: target_mechanic_id || null,
    status: 'pending'
  }).select().single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/customer/request/${data.id}`)
}

// Helper to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

export async function getNearbyMechanics(lat: number, lng: number) {
  const supabase = await createClient()
  
  // Fetch all available mechanics
  const { data: mechanics, error } = await supabase
    .from('mechanics')
    .select('id, shop_name, current_lat, current_lng')
    .eq('is_available', true)
    .not('current_lat', 'is', null)
    .not('current_lng', 'is', null)

  if (error || !mechanics) {
    return { error: 'Could not fetch mechanics', mechanics: [] }
  }

  // Fetch phone numbers for these mechanics
  const mechanicIds = mechanics.map(m => m.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, phone')
    .in('id', mechanicIds)

  const phoneMap = new Map(profiles?.map(p => [p.id, p.phone]) || [])

  // Calculate distances and filter (e.g., within 50km radius)
  const mechanicsWithDistance = mechanics.map(mechanic => {
    const distance = calculateDistance(lat, lng, mechanic.current_lat!, mechanic.current_lng!);
    return {
      id: mechanic.id,
      shop_name: mechanic.shop_name,
      current_lat: mechanic.current_lat,
      current_lng: mechanic.current_lng,
      phone: phoneMap.get(mechanic.id),
      distance
    }
  }).filter(m => m.distance <= 50)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10); // Return up to 10 nearest mechanics

  return { mechanics: mechanicsWithDistance }
}

export async function cancelBreakdownRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('breakdown_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('customer_id', user.id) // Ensure they own the request
    .in('status', ['pending', 'accepted']) // Only allow cancel if not en route/in progress? Or maybe anytime? Let's say pending/accepted.

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/customer/request/${requestId}`)
  return { success: true }
}
