'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cancelBreakdownRequest } from '@/app/customer/dashboard/request/actions'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CancelRequestButton({ requestId, className = "w-full mt-4" }: { requestId: string, className?: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    const res = await cancelBreakdownRequest(requestId)
    
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Request cancelled successfully')
      setOpen(false)
      // Let the page revalidate and update the status
    }
  }

  return (
    <>
      <Button 
        variant="destructive" 
        className={className}
        onClick={() => setOpen(true)}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Cancel Request
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Breakdown Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this request? If a mechanic is already on their way, they will be notified of the cancellation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end mt-4">
          <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)}>
            Keep Request
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Yes, Cancel It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

