'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, MapPin, CheckCircle2, Navigation, AlertTriangle, Truck } from 'lucide-react'

type RequestStatus = 'pending' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'

export function LiveTracker({ 
  initialRequest 
}: { 
  initialRequest: {
    id: string
    status: RequestStatus
    problem_type: string
    created_at: string
    mechanics?: { shop_name: string }
  } 
}) {
  const [status, setStatus] = useState<RequestStatus>(initialRequest.status)
  const [mechanicName, setMechanicName] = useState(initialRequest.mechanics?.shop_name)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to realtime changes on this specific request
    const channel = supabase
      .channel(`request_${initialRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'breakdown_requests',
          filter: `id=eq.${initialRequest.id}`
        },
        async (payload) => {
          const newStatus = payload.new.status as RequestStatus
          
          if (newStatus !== status) {
            setStatus(newStatus)
            
            // Notify user based on new status
            switch (newStatus) {
              case 'accepted':
                toast.success('A mechanic has accepted your request!')
                break
              case 'en_route':
                toast.info('Your mechanic is on the way!')
                break
              case 'in_progress':
                toast.info('Mechanic has arrived and started working.')
                break
              case 'completed':
                toast.success('Request resolved successfully!')
                break
              case 'cancelled':
                toast.error('This request has been cancelled.')
                break
            }

            // We need to fetch the mechanic name if it just got assigned
            if (newStatus === 'accepted' && payload.new.mechanic_id && !mechanicName) {
              const { data } = await supabase
                .from('mechanics')
                .select('shop_name')
                .eq('id', payload.new.mechanic_id)
                .single()
              
              if (data) setMechanicName(data.shop_name)
            }

            // Tell Next.js router to refresh server state behind the scenes
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialRequest.id, status, mechanicName, router, supabase])

  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-12 h-12 text-amber-500 animate-pulse" />,
          title: 'Searching for nearby mechanics...',
          desc: 'Please wait while we connect you with the closest available service provider.',
          color: 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10'
        }
      case 'accepted':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-blue-500" />,
          title: 'Mechanic Assigned!',
          desc: `${mechanicName || 'A mechanic'} has accepted your job and is preparing to head your way.`,
          color: 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10'
        }
      case 'en_route':
        return {
          icon: <Truck className="w-12 h-12 text-blue-500 animate-bounce" />,
          title: 'Mechanic is En Route!',
          desc: 'Help is on the way. Please stay with your vehicle in a safe location.',
          color: 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10'
        }
      case 'in_progress':
        return {
          icon: <Navigation className="w-12 h-12 text-purple-500" />,
          title: 'Service in Progress',
          desc: 'The mechanic has arrived and is currently working on your vehicle.',
          color: 'border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/10'
        }
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          title: 'Request Resolved',
          desc: 'Your vehicle has been serviced. You can now process payment.',
          color: 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10'
        }
      case 'cancelled':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          title: 'Request Cancelled',
          desc: 'This service request was cancelled.',
          color: 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10'
        }
    }
  }

  const display = getStatusDisplay()

  return (
    <Card className={`overflow-hidden transition-colors duration-500 ${display.color}`}>
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="mb-6 p-4 bg-white/50 dark:bg-black/20 rounded-full shadow-sm">
          {display.icon}
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{display.title}</h2>
        <p className="text-muted-foreground max-w-md">{display.desc}</p>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium">
          <span className="relative flex h-3 w-3">
            {(status === 'pending' || status === 'en_route') && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'completed' || status === 'cancelled' ? 'bg-zinc-400' : 'bg-primary'}`}></span>
          </span>
          Live Connection Active
        </div>
      </CardContent>
    </Card>
  )
}
