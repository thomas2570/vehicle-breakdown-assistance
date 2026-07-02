import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { MapPin, CheckCircle2, User, Car } from 'lucide-react'

export default async function MechanicHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests } = await supabase
    .from('breakdown_requests')
    .select('*, profiles:customer_id(full_name), vehicles(make, model)')
    .eq('mechanic_id', user?.id)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job History</h1>
        <p className="text-muted-foreground mt-2">A record of all your completed and cancelled jobs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Jobs</CardTitle>
          <CardDescription>View your full history of handled breakdown requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request.id} className="flex flex-col md:flex-row md:items-center p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full mr-4 self-start md:self-center mb-4 md:mb-0">
                    <CheckCircle2 className={`h-6 w-6 ${request.status === 'completed' ? 'text-green-500' : 'text-zinc-400'}`} />
                  </div>
                  
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold capitalize text-lg">{request.problem_type.replace('_', ' ')}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/> {request.profiles?.full_name}</span>
                      <span className="flex items-center gap-1"><Car className="w-3 h-3"/> {request.vehicles?.make} {request.vehicles?.model}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> Lat: {request.location_lat.toFixed(4)}, Lng: {request.location_lng.toFixed(4)}
                    </p>
                  </div>

                  <div className="text-right mt-4 md:mt-0">
                    <div className={`text-sm font-medium capitalize px-3 py-1 rounded-full inline-block ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {request.status}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-medium">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
              <p>No job history found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
