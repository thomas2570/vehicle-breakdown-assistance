'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVehicle(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const vehicle_type = formData.get('vehicle_type') as string || 'car'
  const registration_number = formData.get('registration_number') as string

  const { error } = await supabase.from('vehicles').insert({
    owner_id: user.id,
    make,
    model,
    vehicle_type,
    registration_number
  } as any)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customer/vehicles')
  return { success: true }
}

export async function deleteVehicle(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('vehicles').delete().eq('id', id)
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/customer/vehicles')
  return { success: true }
}
