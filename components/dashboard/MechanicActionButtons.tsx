'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { acceptRequest, updateRequestStatus } from '@/app/mechanic/dashboard/actions'
import { toast } from 'sonner'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function AcceptJobButton({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    const result = await acceptRequest(requestId)
    if (result.error) {
      toast.error('Failed to accept job: ' + result.error)
    } else {
      toast.success('Job accepted successfully!')
    }
    setIsLoading(false)
  }

  return (
    <Button 
      className="w-full text-lg h-12 bg-green-600 hover:bg-green-700 text-white" 
      onClick={handleAccept}
      disabled={isLoading}
    >
      {isLoading ? 'Accepting...' : 'Accept Job'}
    </Button>
  )
}

export function UpdateStatusButton({ 
  requestId, 
  status, 
  label, 
  variant = 'default',
  icon: Icon
}: { 
  requestId: string, 
  status: string, 
  label: string, 
  variant?: 'default' | 'amber' | 'green',
  icon?: React.ElementType
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    const result = await updateRequestStatus(requestId, status)
    if (result.error) {
      toast.error('Failed to update status: ' + result.error)
    } else {
      toast.success('Status updated to ' + label)
    }
    setIsLoading(false)
  }

  let className = "w-full"
  if (variant === 'amber') className += " bg-amber-600 hover:bg-amber-700 text-white"
  if (variant === 'green') className += " bg-green-600 hover:bg-green-700 text-white"

  return (
    <Button 
      className={className}
      onClick={handleUpdate}
      disabled={isLoading}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {isLoading ? 'Updating...' : label}
      {!Icon && <ArrowRight className="w-4 h-4 ml-2" />}
    </Button>
  )
}
