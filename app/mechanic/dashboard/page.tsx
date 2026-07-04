import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { MechanicStatusToggle } from '@/components/dashboard/MechanicStatusToggle'
import { MechanicLiveFeed } from '@/components/realtime/MechanicLiveFeed'
import DynamicMap from '@/components/realtime/DynamicMap'

export default async function MechanicDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch mechanic status
  const { data } = await supabase
    .from('mechanics')
    .select('*')
    .eq('id', (user?.id as string))
    .single()
    
  const mechanic = data as any

  // Fetch metrics (Active Jobs vs Completed)
  const { count: activeJobsCount } = await supabase
    .from('breakdown_requests')
    .select('*', { count: 'exact', head: true })
    .eq('mechanic_id', (user?.id as string))
    .in('status', ['accepted', 'en_route', 'in_progress'])

  const { count: completedJobsCount } = await supabase
    .from('breakdown_requests')
    .select('*', { count: 'exact', head: true })
    .eq('mechanic_id', (user?.id as string))
    .eq('status', 'completed')

  // Fetch pending unassigned jobs or jobs assigned directly to this mechanic
  const { data: reqData } = await supabase
    .from('breakdown_requests')
    .select('*, profiles:customer_id(full_name), vehicles(make, model)')
    .eq('status', 'pending')
    .or(`mechanic_id.is.null,mechanic_id.eq.${(user?.id as string)}`)
    .order('created_at', { ascending: false })
    .limit(5)
    
  const pendingRequests = reqData as any[]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mechanic Hub</h1>
          <p className="text-muted-foreground mt-2">Manage your availability and accept new breakdown requests.</p>
        </div>
        
        <MechanicStatusToggle initialStatus={mechanic?.is_available || false} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{activeJobsCount || 0}</div>
            <Link href="/mechanic/requests">
              <Button className="w-full">View Active Jobs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{completedJobsCount || 0}</div>
            <Link href="/mechanic/history">
              <Button variant="outline" className="w-full">View History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <MechanicLiveFeed 
          initialRequests={pendingRequests as any} 
          mechanicLat={mechanic?.current_lat} 
          mechanicLng={mechanic?.current_lng} 
          currentMechanicId={mechanic?.id}
        />
        
        <div className="col-span-3 h-full min-h-[400px] border border-primary/20 rounded-xl overflow-hidden shadow-lg shadow-primary/5">
          <DynamicMap 
            center={mechanic?.current_lat && mechanic?.current_lng ? [mechanic.current_lat, mechanic.current_lng] : [20.5937, 78.9629]} // Default to India if no location
            zoom={mechanic?.current_lat ? 12 : 5}
            interactive={true}
            markers={[
              ...(mechanic?.current_lat ? [{
                id: 'mechanic',
                position: [mechanic.current_lat, mechanic.current_lng] as [number, number],
                title: 'You are here',
                popup: 'Your current location'
              }] : []),
              ...pendingRequests.map(req => ({
                id: req.id,
                position: [req.lat || 0, req.lng || 0] as [number, number],
                title: 'Breakdown',
                popup: `${req.profiles?.full_name} - ${req.problem_type}`
              }))
            ]}
          />
        </div>
      </div>
    </div>
  )
}
