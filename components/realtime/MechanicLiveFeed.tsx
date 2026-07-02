'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, MapPin, Navigation } from 'lucide-react'

// Define the shape based on the join query in mechanic/page.tsx
type PendingRequest = {
  id: string
  problem_type: string
  location_lat: number
  location_lng: number
  created_at: string
  vehicles: { make: string; model: string } | null
  profiles: { full_name: string } | null
}

export function MechanicLiveFeed({ 
  initialRequests,
  mechanicLat,
  mechanicLng
}: { 
  initialRequests: PendingRequest[] | null,
  mechanicLat?: number,
  mechanicLng?: number 
}) {
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests || [])
  const router = useRouter()
  const supabase = createClient()

  // Calculate distance in kilometers between two lat/lng coordinates (Haversine formula)
  const getDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number) => {
    if (!lat2 || !lon2) return null
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  useEffect(() => {
    // Subscribe to ALL new breakdown requests that are inserted with 'pending' status
    const channel = supabase
      .channel('mechanic_public_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'breakdown_requests',
          filter: "status=eq.pending"
        },
        async (payload) => {
          // Play a sound (optional/browser might block unless interacted with first)
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
            audio.play().catch(() => {})
          } catch(e) {}

          toast.info('Emergency: New Breakdown Request nearby!', {
            description: 'Check the live feed for details.',
            duration: 8000,
          })

          // We only get the base row from the payload, so we need to fetch the joined data (vehicle, profile)
          const { data } = await supabase
            .from('breakdown_requests')
            .select('*, profiles:customer_id(full_name), vehicles(make, model)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setRequests((prev) => [data as unknown as PendingRequest, ...prev])
          } else {
             // Fallback if join fails for some reason
            setRequests((prev) => [payload.new as any, ...prev])
          }
          
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'breakdown_requests',
        },
        (payload) => {
          // If a request is no longer pending (someone else accepted it), remove it from feed
          if (payload.new.status !== 'pending') {
             setRequests((prev) => prev.filter(r => r.id !== payload.new.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  // Sort requests by distance if we have mechanic location
  const sortedRequests = [...requests].sort((a, b) => {
    const distA = getDistance(a.location_lat, a.location_lng, mechanicLat, mechanicLng)
    const distB = getDistance(b.location_lat, b.location_lng, mechanicLat, mechanicLng)
    if (distA !== null && distB !== null) return distA - distB
    return 0
  })

  return (
    <Card className="col-span-4 border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Nearby Pending Requests</CardTitle>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
        <CardDescription>Live feed of stranded drivers looking for help right now.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedRequests && sortedRequests.length > 0 ? (
          <div className="space-y-6">
            {sortedRequests.map((request) => {
              const distance = getDistance(request.location_lat, request.location_lng, mechanicLat, mechanicLng)
              return (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center p-4 border rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors gap-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full shrink-0 self-start sm:self-center">
                    <Clock className="h-6 w-6 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-lg capitalize">{request.problem_type.replace('_', ' ')}</p>
                      <span className="text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-2 py-1 rounded-full animate-pulse">
                        URGENT
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Vehicle: </span>
                      {request.vehicles?.make} {request.vehicles?.model}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium text-blue-600 dark:text-blue-400">
                      <MapPin className="w-4 h-4" /> 
                      {distance !== null ? `${distance.toFixed(1)} km away` : `Lat: ${request.location_lat.toFixed(4)}, Lng: ${request.location_lng.toFixed(4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reported {new Date(request.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="shrink-0 mt-4 sm:mt-0">
                    <Link href="/mechanic/requests">
                      <Button>Review & Accept</Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
            <Navigation className="w-12 h-12 mx-auto text-zinc-300 mb-4 opacity-50" />
            <p className="text-lg font-medium">No pending requests right now.</p>
            <p className="text-sm mt-1">Stay online. New requests will appear here instantly.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
