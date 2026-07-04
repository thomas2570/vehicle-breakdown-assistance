import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation, User, Phone } from 'lucide-react'
import { redirect } from 'next/navigation'
import { LiveTracker } from '@/components/realtime/LiveTracker'
import { CancelRequestButton } from '@/components/dashboard/CancelRequestButton'
import DynamicMap from '@/components/realtime/DynamicMap'

export default async function RequestTrackingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('breakdown_requests')
    .select('*, mechanics(shop_name, current_lat, current_lng), vehicles(make, model, registration_number)')
    .eq('id', id)
    .single()
    
  const request = data as any

  if (!request) {
    return <div>Request not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Tracking</h1>
        <p className="text-muted-foreground mt-2">Track the status of your assistance request in real-time.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <LiveTracker initialRequest={request} />

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Vehicle</span>
                <p className="font-medium">{request.vehicles?.make} {request.vehicles?.model} ({request.vehicles?.registration_number})</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Issue</span>
                <p className="font-medium capitalize">{request.problem_type.replace('_', ' ')}</p>
              </div>
              
              {(request.status === 'pending' || request.status === 'accepted') && (
                <CancelRequestButton requestId={request.id} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
              <CardDescription>Your location and the mechanic's location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 rounded-xl relative overflow-hidden border">
                <DynamicMap 
                  center={[request.lat, request.lng]} 
                  zoom={15} 
                  interactive={false} 
                  markers={[
                    { id: 'customer', position: [request.lat, request.lng], title: 'Your Location' },
                    ...(request.mechanics?.current_lat && request.mechanics?.current_lng ? [{
                      id: 'mechanic',
                      position: [request.mechanics.current_lat, request.mechanics.current_lng] as [number, number],
                      title: request.mechanics.shop_name || 'Mechanic'
                    }] : [])
                  ]} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
