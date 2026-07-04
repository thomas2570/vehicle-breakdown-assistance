'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import the Map component with SSR disabled
const DynamicMap = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl relative overflow-hidden">
      <Skeleton className="w-full h-full absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-10 font-medium bg-background/20 backdrop-blur-sm">
        Loading Map...
      </div>
    </div>
  )
})

export default DynamicMap
