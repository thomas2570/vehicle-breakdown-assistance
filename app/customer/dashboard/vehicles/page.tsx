import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Car } from 'lucide-react'
import { deleteVehicle } from './actions'
import { AddVehicleForm } from '@/components/dashboard/AddVehicleForm'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner_id', (user?.id as string))
    .order('created_at', { ascending: false })
    
  const vehicles = data as any[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
          <p className="text-muted-foreground mt-2">Manage your registered vehicles.</p>
        </div>
        
        <AddVehicleForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                    <CardDescription className="capitalize">{vehicle.vehicle_type}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 text-center font-mono font-bold tracking-widest uppercase">
                  {vehicle.registration_number}
                </div>
                <div className="mt-4 flex gap-2">
                  <form action={async () => {
                    'use server'
                    await deleteVehicle(vehicle.id)
                  }} className="w-full">
                    <Button variant="destructive" size="sm" className="w-full">Delete</Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed">
            <Car className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-bold">No vehicles found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">You haven't added any vehicles yet. Add your vehicle to request assistance faster.</p>
          </div>
        )}
      </div>
    </div>
  )
}
