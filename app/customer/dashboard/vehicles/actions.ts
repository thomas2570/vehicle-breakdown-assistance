'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVehicle(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string) || null
  const license_plate = formData.get('license_plate') as string
  const color = formData.get('color') as string

  const { error } = await supabase.from('vehicles').insert({
    user_id: user.id,
    make,
    model,
    year,
    license_plate,
    color
  })

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
