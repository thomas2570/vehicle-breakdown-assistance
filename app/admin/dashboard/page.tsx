import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Wrench, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts
  const { count: customersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')

  const { count: mechanicsCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mechanic')

  const { count: activeJobsCount } = await supabase
    .from('breakdown_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'accepted', 'en_route', 'in_progress'])

  const { count: completedJobsCount } = await supabase
    .from('breakdown_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  // Fetch recent requests globally
  const { data: recentRequests } = await supabase
    .from('breakdown_requests')
    .select('*, profiles:customer_id(full_name), mechanics:mechanic_id(shop_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Headquarters</h1>
        <p className="text-muted-foreground mt-2">Platform overview and global statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered drivers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Mechanics</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mechanicsCount || 0}</div>
            <Link href="/admin/mechanics" className="text-xs text-primary hover:underline mt-1 inline-block">
              Manage Mechanics →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requests in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully resolved</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Latest breakdown requests across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{request.problem_type.replace('_', ' ')}</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>Customer: {request.profiles?.full_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>Mechanic: {request.mechanics?.shop_name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      request.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
