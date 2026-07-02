'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelBreakdownRequest } from '@/app/(dashboard)/customer/request/actions'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export function CancelRequestButton({ requestId, className = "w-full mt-4" }: { requestId: string, className?: string }) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return

    setLoading(true)
    const res = await cancelBreakdownRequest(requestId)
    
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Request cancelled successfully')
      // Let the page revalidate and update the status
    }
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleCancel}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <XCircle className="w-4 h-4 mr-2" />
      )}
      Cancel Request
    </Button>
  )
}
