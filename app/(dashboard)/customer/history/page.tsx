import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Clock, MapPin, CheckCircle2 } from 'lucide-react'
import { CancelRequestButton } from '@/components/dashboard/CancelRequestButton'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests } = await supabase
    .from('breakdown_requests')
    .select('*, mechanics(shop_name), vehicles(make, model)')
    .eq('customer_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
        <p className="text-muted-foreground mt-2">A record of all your past breakdown requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>View your full history of assistance requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-8">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full mr-4">
                    {request.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Clock className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold capitalize">{request.problem_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Vehicle: {request.vehicles?.make} {request.vehicles?.model}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Lat: {request.location_lat.toFixed(4)}, Lng: {request.location_lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium capitalize px-2 py-1 rounded-full inline-block ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                    {(request.status === 'pending' || request.status === 'accepted') && (
                      <CancelRequestButton requestId={request.id} className="mt-4 text-xs h-8 px-3 w-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
              <p>No service history found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
