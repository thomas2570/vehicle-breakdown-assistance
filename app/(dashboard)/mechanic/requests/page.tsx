import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, User, Car, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { acceptRequest, updateRequestStatus } from '../actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MechanicRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all pending unassigned requests or requests assigned specifically to this mechanic
  const { data: pendingData } = await supabase
    .from('breakdown_requests')
    .select('*, vehicles(make, model, license_plate)')
    .eq('status', 'pending')
    .or(`mechanic_id.is.null,mechanic_id.eq.${user?.id}`)
    .order('created_at', { ascending: false })

  // Fetch active requests assigned to this mechanic
  const { data: activeData } = await supabase
    .from('breakdown_requests')
    .select('*, vehicles(make, model, license_plate)')
    .eq('mechanic_id', user?.id)
    .in('status', ['accepted', 'en_route', 'in_progress'])
    .order('created_at', { ascending: false })

  // Extract all customer IDs to fetch their profiles
  const customerIds = new Set([
    ...(pendingData || []).map(r => r.customer_id),
    ...(activeData || []).map(r => r.customer_id)
  ])

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', Array.from(customerIds))

  const profileMap = new Map(profilesData?.map(p => [p.id, p]) || [])

  const pendingRequests = (pendingData || []).map(r => ({
    ...r,
    profiles: profileMap.get(r.customer_id)
  }))

  const activeRequests = (activeData || []).map(r => ({
    ...r,
    profiles: profileMap.get(r.customer_id)
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
        <p className="text-muted-foreground mt-2">Accept new jobs and update the status of your active requests.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Jobs ({activeRequests?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">New Requests ({pendingRequests?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {activeRequests && activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <Card key={request.id} className="border-primary/20 shadow-md">
                  <CardHeader className="bg-primary/5 pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl capitalize">{request.problem_type.replace('_', ' ')}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1 text-primary font-medium">
                          <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Status: {request.status.replace('_', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3"/> Customer</span>
                        <p className="font-medium">{request.profiles?.full_name || 'Unknown'}</p>
                        {request.profiles?.phone && <p className="text-muted-foreground">{request.profiles.phone}</p>}
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1"><Car className="w-3 h-3"/> Vehicle</span>
                        <p className="font-medium">{request.vehicles?.make} {request.vehicles?.model}</p>
                        <p className="text-muted-foreground font-mono">{request.vehicles?.license_plate}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 w-full h-48 bg-zinc-200 dark:bg-zinc-950/50 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-300 dark:border-zinc-800">
                      <div className="absolute top-2 left-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-2 rounded shadow-sm text-xs font-mono border border-zinc-200 dark:border-zinc-800">
                        <span className="text-muted-foreground">Customer Location</span><br/>
                        Lat: {request.location_lat.toFixed(5)} <br/>
                        Lng: {request.location_lng.toFixed(5)}
                      </div>
                      <div className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-500">
                        <MapPin className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs font-medium">Interactive Map (Coming in Phase 13)</p>
                      </div>
                    </div>

                    {request.description && (
                      <div>
                        <span className="text-sm text-muted-foreground">Notes:</span>
                        <p className="text-sm bg-zinc-50 dark:bg-zinc-900 p-2 rounded border mt-1">{request.description}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-zinc-50/50 dark:bg-zinc-900/20 pt-4 flex gap-2 flex-wrap">
                    {request.status === 'accepted' && (
                      <form action={async () => {
                        'use server'
                        await updateRequestStatus(request.id, 'en_route')
                      }} className="w-full">
                        <Button className="w-full">Mark as En Route <ArrowRight className="w-4 h-4 ml-2" /></Button>
                      </form>
                    )}
                    {request.status === 'en_route' && (
                      <form action={async () => {
                        'use server'
                        await updateRequestStatus(request.id, 'in_progress')
                      }} className="w-full">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">Arrived - Start Work <ArrowRight className="w-4 h-4 ml-2" /></Button>
                      </form>
                    )}
                    {request.status === 'in_progress' && (
                      <form action={async () => {
                        'use server'
                        await updateRequestStatus(request.id, 'completed')
                      }} className="w-full">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed</Button>
                      </form>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                <CheckCircle2 className="w-12 h-12 mx-auto text-zinc-300 mb-4 opacity-50" />
                <p className="text-lg font-medium">You have no active jobs.</p>
                <p className="text-sm mt-1">Check the New Requests tab to find people who need help.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {pendingRequests && pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl capitalize">{request.problem_type.replace('_', ' ')}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Requested {new Date(request.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3"/> Customer</span>
                        <p className="font-medium">{request.profiles?.full_name || 'Unknown'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1"><Car className="w-3 h-3"/> Vehicle</span>
                        <p className="font-medium">{request.vehicles?.make} {request.vehicles?.model}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-md">
                      <span className="text-sm text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-3 h-3"/> Location</span>
                      <p className="text-sm font-medium">Lat: {request.location_lat.toFixed(5)}, Lng: {request.location_lng.toFixed(5)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <form action={async () => {
                      'use server'
                      await acceptRequest(request.id)
                    }} className="w-full">
                      <Button className="w-full text-lg h-12 bg-green-600 hover:bg-green-700 text-white">Accept Job</Button>
                    </form>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                <MapPin className="w-12 h-12 mx-auto text-zinc-300 mb-4 opacity-50" />
                <p className="text-lg font-medium">No new requests in your area.</p>
                <p className="text-sm mt-1">We will notify you when a stranded driver needs assistance.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
