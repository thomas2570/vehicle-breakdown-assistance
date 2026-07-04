'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { addVehicle } from '@/app/customer/dashboard/vehicles/actions'

export function AddVehicleForm() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleAddVehicle(formData: FormData) {
    try {
      await addVehicle(formData)
      toast.success('Vehicle added successfully!')
      setOpen(false)
      formRef.current?.reset()
    } catch (error) {
      toast.error('Failed to add vehicle.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new vehicle</DialogTitle>
          <DialogDescription>
            Enter your vehicle details below. This will help mechanics identify your car quickly.
          </DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} action={handleAddVehicle} className="space-y-4 pt-4">
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
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <select 
                id="vehicle_type" 
                name="vehicle_type" 
                required 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="truck">Truck</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input id="registration_number" name="registration_number" placeholder="e.g. ABC-1234" required className="uppercase" />
            </div>
          </div>
          <Button type="submit" className="w-full">Save Vehicle</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
