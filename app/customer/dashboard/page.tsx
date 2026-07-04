import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, PenTool, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch recent requests
  const { data } = await supabase
    .from('breakdown_requests')
    .select('*, mechanics(shop_name)')
    .eq('customer_id', (user?.id as string))
    .order('created_at', { ascending: false })
    .limit(3)
    
  const requests = data as any[]

  // Fetch vehicles count
  const { count: vehiclesCount } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', (user?.id as string))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">Here is what is happening with your vehicles and requests.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Request</CardTitle>
            <PenTool className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Need Help?</div>
            <Link href="/customer/request">
              <Button className="w-full">Request Assistance</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{vehiclesCount || 0}</div>
            <Link href="/customer/vehicles">
              <Button variant="outline" className="w-full">Manage Vehicles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your most recent breakdown assistance requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {requests && requests.length > 0 ? (
              <div className="space-y-8">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full mr-4">
                      {request.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none capitalize">{request.problem_type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Lat: {request.lat?.toFixed(4)}, Lng: {request.lng?.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{request.status.replace('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No requests found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
