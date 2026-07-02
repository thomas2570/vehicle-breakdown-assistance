'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface RadarMechanic {
  id: string
  shop_name: string
  distance: number // km
  current_lat: number
  current_lng: number
  phone?: string
  // Using an arbitrary angle for UI placement
  angle?: number
}

interface MechanicRadarProps {
  mechanics: RadarMechanic[]
  selectedMechanicId?: string | null
  onSelect?: (mechanic: RadarMechanic) => void
}

export function MechanicRadar({ mechanics: initialMechanics, selectedMechanicId, onSelect }: MechanicRadarProps) {
  const [mechanics, setMechanics] = useState<RadarMechanic[]>([])

  useEffect(() => {
    // Assign random angles for UI distribution around the center
    // We would ideally calculate true bearing if we needed exact directions,
    // but random angles give a good "scattered nearby" radar feel.
    const mapped = initialMechanics.map((m, i) => ({
      ...m,
      angle: (360 / (initialMechanics.length || 1)) * i + Math.random() * 30
    }))
    setMechanics(mapped)
  }, [initialMechanics])

  // Map distance (0-50km) to percentage radius (20% to 100%)
  const getRadius = (distance: number) => {
    const minR = 20
    const maxR = 90
    const maxDist = 50 // km max search radius
    const percentage = Math.min(distance / maxDist, 1)
    return minR + (maxR - minR) * percentage
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center">
      
      {/* Radar Background Circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[30%] h-[30%] rounded-full border border-zinc-800/50" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-zinc-800/50" />
        <div className="absolute w-[90%] h-[90%] rounded-full border border-zinc-800/50" />
        
        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-zinc-800/30" />
        <div className="absolute h-full w-[1px] bg-zinc-800/30" />
      </div>

      {/* Sweeping Radar Line */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[50%] h-[1px] bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-400 origin-left"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ zIndex: 10 }}
      >
        {/* Radar trailing glow effect */}
        <div 
          className="absolute right-0 top-0 w-full h-[100px] bg-gradient-to-b from-green-500/20 to-transparent origin-top-right transform -translate-y-full rounded-tr-full blur-md"
          style={{ transform: 'skewY(-45deg)' }}
        />
      </motion.div>

      {/* Center User Pin */}
      <div className="absolute z-20 flex flex-col items-center justify-center">
        <div className="relative">
          <motion.div 
            className="absolute inset-0 rounded-full bg-blue-500/40 blur-md"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10" />
        </div>
        <span className="text-[10px] text-blue-400 mt-1 font-semibold bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800">You</span>
      </div>

      {/* Mechanics Pins */}
      {mechanics.map((mechanic) => {
        const radius = getRadius(mechanic.distance)
        const angleRad = (mechanic.angle! * Math.PI) / 180

        // Calculate position relative to center (50% is center)
        const left = 50 + radius * Math.cos(angleRad)
        const top = 50 + radius * Math.sin(angleRad)

        return (
          <motion.div
            key={mechanic.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + Math.random(), duration: 0.5 }}
            className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div 
              className={`relative group cursor-pointer ${selectedMechanicId === mechanic.id ? 'z-40' : ''}`}
              onClick={() => onSelect && onSelect(mechanic)}
            >
              <motion.div 
                className={`absolute inset-0 rounded-full ${selectedMechanicId === mechanic.id ? 'bg-amber-500/60 blur-md' : 'bg-green-500/40 blur-sm'}`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
              <MapPin className={`w-6 h-6 relative z-10 ${selectedMechanicId === mechanic.id ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,1)] scale-125 transition-transform' : 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'}`} />
              
              {/* Tooltip / Details */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max transition-opacity z-30 ${selectedMechanicId === mechanic.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none'}`}>
                <div className={`text-white text-xs px-3 py-2 rounded shadow-xl flex flex-col items-center border ${selectedMechanicId === mechanic.id ? 'bg-zinc-900 border-amber-500/50' : 'bg-zinc-800 border-zinc-700'}`}>
                  <span className={`font-semibold ${selectedMechanicId === mechanic.id ? 'text-amber-400' : 'text-green-400'}`}>{mechanic.shop_name}</span>
                  <span className="text-zinc-400 text-[10px] mt-0.5">{mechanic.distance.toFixed(1)} km away</span>
                  {selectedMechanicId === mechanic.id && mechanic.phone && (
                    <span className="text-zinc-300 font-mono mt-1 pt-1 border-t border-zinc-700/50 w-full text-center">{mechanic.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-zinc-300 font-medium">{mechanics.length} Active Mechanics</span>
        </div>
        <p className="text-zinc-500">Scanning 50km radius...</p>
      </div>

    </div>
  )
}
