'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for missing default marker icons in Leaflet with Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapProps {
  center: [number, number]
  zoom?: number
  interactive?: boolean
  onLocationSelect?: (lat: number, lng: number) => void
  markers?: Array<{
    id: string
    position: [number, number]
    title: string
    popup?: string
    icon?: L.Icon
  }>
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export default function Map({ center, zoom = 13, interactive = true, onLocationSelect, markers = [] }: MapProps) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border/50 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="w-full h-full min-h-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onLocationSelect && <MapEvents onLocationSelect={onLocationSelect} />}

        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={marker.icon}
          >
            {(marker.popup || marker.title) && (
              <Popup>
                <div className="font-semibold">{marker.title}</div>
                {marker.popup && <div className="text-sm text-muted-foreground">{marker.popup}</div>}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
