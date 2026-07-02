import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation, User, Phone } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function RequestTrackingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  if (!user) redirect('/login')

  const { data: request } = await supabase
    .from('breakdown_requests')
    .select('*, mechanics(shop_name, current_lat, current_lng), vehicles(make, model, license_plate)')
    .eq('id', id)
    .single()

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
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize text-primary flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                {request.status.replace('_', ' ')}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {request.status === 'pending' && "Waiting for a nearby mechanic to accept your request..."}
                {request.status === 'accepted' && "A mechanic has accepted your request!"}
                {request.status === 'en_route' && "Mechanic is on their way to your location."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Vehicle</span>
                <p className="font-medium">{request.vehicles?.make} {request.vehicles?.model} ({request.vehicles?.license_plate})</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Issue</span>
                <p className="font-medium capitalize">{request.problem_type.replace('_', ' ')}</p>
              </div>
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
              <div className="w-full h-96 bg-zinc-100 dark:bg-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center border">
                {/* We will integrate Leaflet Map here in Phase 13 */}
                <div className="absolute top-4 left-4 bg-white dark:bg-zinc-900 p-2 rounded-lg shadow text-xs font-mono border">
                  Lat: {request.location_lat.toFixed(4)} <br/>
                  Lng: {request.location_lng.toFixed(4)}
                </div>
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <MapPin className="w-12 h-12 text-zinc-300 mb-2" />
                  <p>Interactive Map (Coming in Phase 13)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
