import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '@/lib/sms/sms'

// Use the Service Role Key for this backend-only route so we bypass RLS
// Normally you'd store these in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  try {
    // Twilio sends data as form-urlencoded by default
    const text = await req.text()
    const params = new URLSearchParams(text)
    
    const fromNumber = params.get('From')
    const body = params.get('Body')?.trim()

    if (!fromNumber || !body) {
      return NextResponse.json({ error: 'Missing From or Body' }, { status: 400 })
    }

    console.log(`[SMS Webhook] Received from ${fromNumber}: ${body}`)

    // Clean up the fromNumber (Twilio usually sends E.164 e.g. +1234567890)
    // In our DB, phone might be formatted differently, but we assume exact match for now.
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Validate the user exists
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('phone', fromNumber)
      .single()

    if (profileErr || !profile) {
      const msg = "Unregistered number. Please register at our website first to use the Offline SMS Emergency System."
      await logSms(supabase, null, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'unregistered_number' })
    }

    // 2. Parse the command
    // Expected format: HELP <REG_NO> <LAT>,<LNG> <PROBLEM_TYPE>
    // Example: HELP MH01AB1234 19.0760,72.8777 flat_tyre
    const parts = body.split(/\s+/)
    
    if (parts[0].toUpperCase() !== 'HELP') {
      const msg = "Invalid command. Send: HELP <REG_NO> <LAT>,<LNG> <PROBLEM_TYPE>"
      await logSms(supabase, profile.id, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'invalid_command' })
    }

    if (parts.length < 4) {
      const msg = "Incomplete message. Format: HELP <REG_NO> <LAT>,<LNG> <PROBLEM_TYPE>"
      await logSms(supabase, profile.id, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'incomplete_message' })
    }

    const regNo = parts[1]
    const coords = parts[2].split(',')
    const problemType = parts.slice(3).join('_').toLowerCase()

    if (coords.length !== 2) {
      const msg = "Invalid coordinates. Format: <LAT>,<LNG>"
      await logSms(supabase, profile.id, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'invalid_coordinates' })
    }

    const lat = parseFloat(coords[0])
    const lng = parseFloat(coords[1])

    if (isNaN(lat) || isNaN(lng)) {
      const msg = "Invalid coordinates. Must be numbers."
      await logSms(supabase, profile.id, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'invalid_coordinates_nan' })
    }

    // 3. Verify vehicle
    const { data: vehicle, error: vehicleErr } = await supabase
      .from('vehicles')
      .select('id')
      .eq('owner_id', profile.id)
      .eq('registration_number', regNo)
      .single()

    if (vehicleErr || !vehicle) {
      const msg = `Vehicle ${regNo} not found in your account.`
      await logSms(supabase, profile.id, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'vehicle_not_found' })
    }

    // 4. Find nearest mechanic (Auto-assignment)
    let assignedMechanicId = null
    let mechanicName = null
    let mechanicPhone = null

    const { data: mechanics, error: mechErr } = await supabase.rpc('get_nearby_mechanics', {
      p_lat: lat,
      p_lng: lng,
      p_radius_km: 50
    })

    if (!mechErr && mechanics && mechanics.length > 0) {
      // Pick the closest one
      assignedMechanicId = mechanics[0].id
      mechanicName = mechanics[0].shop_name
      mechanicPhone = mechanics[0].phone
    }

    // 5. Create the Breakdown Request
    const { data: newRequest, error: reqErr } = await supabase
      .from('breakdown_requests')
      .insert({
        customer_id: profile.id,
        vehicle_id: vehicle.id,
        mechanic_id: assignedMechanicId,
        problem_type: problemType,
        lat,
        lng,
        status: assignedMechanicId ? 'accepted' : 'pending',
        description: 'Created via Offline SMS'
      })
      .select('id')
      .single()

    if (reqErr || !newRequest) {
      const msg = "Failed to create request due to a system error. Please try again."
      await logSms(supabase, profile.id, fromNumber, body, 'failed', msg)
      await sendSMS(fromNumber, msg)
      return NextResponse.json({ success: false, reason: 'request_creation_failed' })
    }

    // 6. Send success response back to customer
    let successMsg = `Request #${newRequest.id.substring(0, 5)} received.`
    if (assignedMechanicId) {
      successMsg += ` Mechanic assigned: ${mechanicName}. They are en route.`
    } else {
      successMsg += ` Searching for nearby mechanics... We will update you shortly.`
    }

    await logSms(supabase, profile.id, fromNumber, body, 'processed', successMsg)
    await sendSMS(fromNumber, successMsg)
    
    // Optionally text the mechanic if auto-assigned
    if (assignedMechanicId && mechanicPhone) {
      const mechMsg = `URGENT (Offline SMS): New breakdown assigned to you. Customer: ${profile.full_name}, Phone: ${fromNumber}, Issue: ${problemType}, Location: ${lat},${lng}`
      await sendSMS(mechanicPhone, mechMsg)
    }

    // Return TwiML or JSON. Since we're using REST API to send replies, we can just return 200 OK.
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[SMS Webhook Error]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function logSms(
  supabase: any,
  userId: string | null,
  phoneNumber: string,
  messageBody: string,
  status: 'processed' | 'failed',
  errorMessage?: string
) {
  await supabase.from('offline_sms_logs').insert({
    user_id: userId,
    phone_number: phoneNumber,
    message_body: messageBody,
    status,
    error_message: errorMessage
  })
}
