'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getNearbyMechanics, submitBreakdownRequest } from './actions'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Navigation, Car, AlertTriangle } from 'lucide-react'
import { MechanicRadar, RadarMechanic } from '@/components/dashboard/MechanicRadar'

const problems = [
  { id: 'flat_tyre', label: 'Flat Tyre' },
  { id: 'battery_dead', label: 'Battery Dead' },
  { id: 'engine_failure', label: 'Engine Failure' },
  { id: 'fuel_empty', label: 'Out of Fuel' },
  { id: 'overheating', label: 'Overheating' },
  { id: 'brake_failure', label: 'Brake Failure' },
  { id: 'accident', label: 'Accident' },
  { id: 'towing_required', label: 'Towing Required' },
  { id: 'electrical_issue', label: 'Electrical Issue' },
  { id: 'other', label: 'Other' },
]

export default function RequestHelpPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nearbyMechanics, setNearbyMechanics] = useState<RadarMechanic[]>([])
  const [radarLoading, setRadarLoading] = useState(false)
  const [selectedMechanic, setSelectedMechanic] = useState<RadarMechanic | null>(null)
  
  useEffect(() => {
    const fetchVehicles = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('vehicles').select('*').eq('user_id', user.id)
        if (data) setVehicles(data)
      }
    }
    fetchVehicles()
  }, [])

  const getLocation = () => {
    setLocationLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          setLocationLoading(false)
          
          setRadarLoading(true)
          const { mechanics } = await getNearbyMechanics(lat, lng)
          if (mechanics) {
            setNearbyMechanics(mechanics as RadarMechanic[])
          }
          setRadarLoading(false)
        },
        (error) => {
          setError("Failed to get location. Please enable location services.")
          setLocationLoading(false)
        }
      )
    } else {
      setError("Geolocation is not supported by your browser.")
      setLocationLoading(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (!location) {
      setError("Please allow location access to continue.")
      return
    }
    formData.append('lat', location.lat.toString())
    formData.append('lng', location.lng.toString())
    
    const res = await submitBreakdownRequest(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500 flex items-center gap-2">
          <AlertTriangle className="w-8 h-8" />
          Request Emergency Help
        </h1>
        <p className="text-muted-foreground mt-2">Fill out the details below. We will find the nearest mechanic to assist you immediately.</p>
      </div>

      <div className={`grid gap-6 ${location ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
        <Card>
        <CardHeader>
          <CardTitle>Breakdown Details</CardTitle>
          <CardDescription>Tell us what happened and where you are.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
          
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="vehicle_id">Select Vehicle</Label>
                <Select name="vehicle_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the vehicle that broke down" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.license_plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehicles.length === 0 && (
                  <p className="text-sm text-amber-600">You don't have any vehicles registered. Please add one first.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem_type">What is the problem?</Label>
                <Select name="problem_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {problems.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe the situation or any specific noises/issues..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Label>Your Location</Label>
                <div className="p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center space-y-4">
                  {location ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
                      <MapPin className="w-5 h-5 animate-bounce" />
                      Location Acquired: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  ) : (
                    <>
                      <div className="text-center text-sm text-muted-foreground">
                        We need your GPS coordinates to dispatch help accurately.
                      </div>
                      <Button type="button" onClick={getLocation} disabled={locationLoading} variant="secondary">
                        <Navigation className={`w-4 h-4 mr-2 ${locationLoading ? 'animate-spin' : ''}`} />
                        {locationLoading ? 'Locating...' : 'Share Live Location'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

            </div>
            {selectedMechanic && (
              <input type="hidden" name="target_mechanic_id" value={selectedMechanic.id} />
            )}
            <Button type="submit" className="w-full text-base sm:text-lg h-auto min-h-[3.5rem] py-3" disabled={!location || vehicles.length === 0}>
              <span className="line-clamp-2 whitespace-normal break-words px-2">
                {selectedMechanic ? `Send Request to ${selectedMechanic.shop_name}` : 'Find Nearest Mechanic'}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {location && (
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Nearby Assistance</CardTitle>
              <CardDescription>Scanning your area for active mechanics...</CardDescription>
            </CardHeader>
            <CardContent>
              {radarLoading ? (
                <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-800">
                  <Navigation className="w-8 h-8 animate-spin text-green-500" />
                </div>
              ) : (
                <MechanicRadar 
                  mechanics={nearbyMechanics} 
                  selectedMechanicId={selectedMechanic?.id}
                  onSelect={(mechanic) => {
                    // Toggle selection
                    setSelectedMechanic(prev => prev?.id === mechanic.id ? null : mechanic)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}
