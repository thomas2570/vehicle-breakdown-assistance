import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { verifyMechanic } from '../actions'

export default async function AdminMechanicsPage() {
  const supabase = await createClient()

  // Fetch mechanics and their user profiles
  const { data } = await supabase
    .from('mechanics')
    .select('*, profiles:id(full_name, phone)')
    .order('is_verified', { ascending: false }) // Show pending first usually, but we sort alphabetically here
    
  const mechanics = data as any[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mechanic Verification</h1>
        <p className="text-muted-foreground mt-2">Approve or reject mechanic applications to ensure platform quality.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Mechanics</CardTitle>
          <CardDescription>All mechanics registered on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mechanics && mechanics.length > 0 ? (
                mechanics.map((mechanic) => (
                  <TableRow key={mechanic.id}>
                    <TableCell className="font-medium">
                      {mechanic.shop_name || 'N/A'}
                      <div className="text-xs text-muted-foreground">Joined {new Date(mechanic.users?.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{mechanic.profiles?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{mechanic.users?.email}</div>
                      <div className="text-xs text-muted-foreground">{mechanic.profiles?.phone || 'No phone'}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit ${
                        mechanic.is_verified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {mechanic.is_verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {mechanic.is_verified ? 'VERIFIED' : 'PENDING'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!mechanic.is_verified ? (
                        <div className="flex justify-end gap-2">
                          <form action={async () => {
                            'use server'
                            await verifyMechanic(mechanic.id, 'verified')
                          }}>
                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                          </form>
                          <form action={async () => {
                            'use server'
                            await verifyMechanic(mechanic.id, 'rejected')
                          }}>
                            <Button size="sm" variant="destructive">Reject</Button>
                          </form>
                        </div>
                      ) : (
                        <form action={async () => {
                          'use server'
                          await verifyMechanic(mechanic.id, 'rejected')
                        }}>
                          <Button size="sm" variant="outline">
                            Revoke
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No mechanics registered yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
