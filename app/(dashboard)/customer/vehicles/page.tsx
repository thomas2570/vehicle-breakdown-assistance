import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Car, Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addVehicle, deleteVehicle } from './actions'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
          <p className="text-muted-foreground mt-2">Manage your registered vehicles.</p>
        </div>
        
        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new vehicle</DialogTitle>
              <DialogDescription>
                Enter your vehicle details below. This will help mechanics identify your car quickly.
              </DialogDescription>
            </DialogHeader>
            <form action={async (formData) => {
              'use server'
              await addVehicle(formData)
            }} className="space-y-4 pt-4">
              
              <datalist id="car-makes">
                <option value="Toyota" />
                <option value="Honda" />
                <option value="Ford" />
                <option value="Chevrolet" />
                <option value="Nissan" />
                <option value="Hyundai" />
                <option value="Kia" />
                <option value="Mahindra" />
                <option value="Tata" />
                <option value="Maruti Suzuki" />
                <option value="BMW" />
                <option value="Mercedes-Benz" />
                <option value="Audi" />
                <option value="Volkswagen" />
                <option value="Tesla" />
              </datalist>

              <datalist id="car-models">
                <option value="Camry" />
                <option value="Corolla" />
                <option value="Civic" />
                <option value="Accord" />
                <option value="F-150" />
                <option value="Mustang" />
                <option value="Thar" />
                <option value="Scorpio" />
                <option value="XUV700" />
                <option value="Nexon" />
                <option value="Swift" />
                <option value="Model 3" />
                <option value="Model Y" />
              </datalist>

              <datalist id="car-colors">
                <option value="White" />
                <option value="Black" />
                <option value="Silver" />
                <option value="Grey" />
                <option value="Red" />
                <option value="Blue" />
                <option value="Brown" />
              </datalist>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" list="car-makes" placeholder="e.g. Toyota" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" list="car-models" placeholder="e.g. Camry" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" min="1990" max={new Date().getFullYear() + 1} placeholder="e.g. 2020" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" list="car-colors" placeholder="e.g. Silver" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input id="license_plate" name="license_plate" placeholder="e.g. ABC-1234" required className="uppercase" />
              </div>
              <Button type="submit" className="w-full">Save Vehicle</Button>
            </form>
          </DialogContent>
        </Dialog>
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
                    <CardDescription>{vehicle.year} • {vehicle.color}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 text-center font-mono font-bold tracking-widest uppercase">
                  {vehicle.license_plate}
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
