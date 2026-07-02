import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'

export default async function MechanicSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: mechanic } = await supabase
    .from('mechanics')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mechanic Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your shop details and account preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop Profile</CardTitle>
          <CardDescription>Update your public mechanic information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Shop Name / Business Name</Label>
            <Input defaultValue={mechanic?.shop_name || user?.user_metadata?.full_name} disabled />
          </div>
          <div className="space-y-2">
            <Label>Verification Status</Label>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 rounded-md font-medium capitalize border border-amber-200 dark:border-amber-900">
              {mechanic?.verification_status || 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground">Admin verification is required to access premium features.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue={user?.user_metadata?.full_name || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input defaultValue={user?.email || ''} disabled />
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            *Profile updates will be fully implemented in a later phase.
          </p>
          <Button disabled>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
