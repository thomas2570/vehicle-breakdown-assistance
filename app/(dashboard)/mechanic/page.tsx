import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { MechanicStatusToggle } from '@/components/dashboard/MechanicStatusToggle'

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
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Nearby Pending Requests</CardTitle>
            <CardDescription>Stranded drivers looking for help right now.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests && pendingRequests.length > 0 ? (
              <div className="space-y-6">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-center p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full shrink-0 self-start sm:self-center">
                      <Clock className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-lg capitalize">{request.problem_type.replace('_', ' ')}</p>
                        <span className="text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-2 py-1 rounded-full">
                          URGENT
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Vehicle: </span>
                        {request.vehicles?.make} {request.vehicles?.model}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" /> Lat: {request.location_lat.toFixed(4)}, Lng: {request.location_lng.toFixed(4)}
                      </p>
                    </div>
                    <div className="shrink-0 mt-4 sm:mt-0">
                      <Link href="/mechanic/requests">
                        <Button>Review & Accept</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                <Navigation className="w-12 h-12 mx-auto text-zinc-300 mb-4 opacity-50" />
                <p className="text-lg font-medium">No pending requests right now.</p>
                <p className="text-sm mt-1">Stay online to receive notifications when drivers need help.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
