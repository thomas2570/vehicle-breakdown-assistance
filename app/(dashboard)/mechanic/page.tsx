import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { MechanicStatusToggle } from '@/components/dashboard/MechanicStatusToggle'
import { MechanicLiveFeed } from '@/components/realtime/MechanicLiveFeed'

export default async function MechanicDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch mechanic status
  const { data: mechanic } = await supabase
    .from('mechanics')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch metrics (Active Jobs vs Completed)
  const { count: activeJobsCount } = await supabase
    .from('breakdown_requests')
    .select('*', { count: 'exact', head: true })
    .eq('mechanic_id', user?.id)
    .in('status', ['accepted', 'en_route', 'in_progress'])

  const { count: completedJobsCount } = await supabase
    .from('breakdown_requests')
    .select('*', { count: 'exact', head: true })
    .eq('mechanic_id', user?.id)
    .eq('status', 'completed')

  // Fetch pending unassigned jobs
  const { data: pendingRequests } = await supabase
    .from('breakdown_requests')
    .select('*, profiles:customer_id(full_name), vehicles(make, model)')
    .eq('status', 'pending')
    .is('mechanic_id', null)
    .order('created_at', { ascending: false })
    .limit(5)

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
        />
      </div>
    </div>
  )
}
