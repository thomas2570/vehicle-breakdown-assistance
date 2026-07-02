import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and personal details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
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
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input defaultValue={user?.user_metadata?.phone || ''} disabled />
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
