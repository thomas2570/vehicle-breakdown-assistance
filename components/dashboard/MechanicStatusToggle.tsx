'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toggleAvailability } from '@/app/(dashboard)/mechanic/actions'

export function MechanicStatusToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isAvailable, setIsAvailable] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    setIsAvailable(checked)
    startTransition(async () => {
      await toggleAvailability(checked)
    })
  }

  return (
    <div className="flex items-center space-x-3 bg-white dark:bg-zinc-950 border rounded-xl p-4 shadow-sm">
      <Switch 
        id="availability" 
        checked={isAvailable} 
        onCheckedChange={handleToggle} 
        disabled={isPending}
      />
      <div className="flex flex-col">
        <Label htmlFor="availability" className="font-semibold text-base cursor-pointer">
          {isAvailable ? 'Available for Jobs' : 'Offline'}
        </Label>
        <span className="text-xs text-muted-foreground">
          {isAvailable 
            ? 'You are currently visible to nearby stranded drivers.' 
            : 'You will not receive any new breakdown requests.'}
        </span>
      </div>
      
      <div className="ml-auto">
        <div className="relative flex h-4 w-4">
          {isAvailable && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-4 w-4 ${isAvailable ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></span>
        </div>
      </div>
    </div>
  )
}
