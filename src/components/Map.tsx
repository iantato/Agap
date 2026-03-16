import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'
import { DistressSignal } from '../types'
import { useEffect } from 'react'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

// Custom DivIcons for glowing effect
const createPulseIcon = (color: string) => {
  return new DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 4px ${color}40, 0 0 0 8px ${color}20;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const redPulseIcon = createPulseIcon('#EF4444');
const orangePulseIcon = createPulseIcon('#F59E0B');
const greenPulseIcon = createPulseIcon('#10B981');

interface MapProps {
  signals: DistressSignal[]
  onMarkerClick: (signal: DistressSignal) => void
  center?: [number, number]
}

function MapUpdater({ center }: { center?: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, {
        duration: 2,
        easeLinearity: 0.25
      })
    }
  }, [center, map])
  return null
}

export default function Map({ signals, onMarkerClick, center }: MapProps) {
  const defaultCenter: [number, number] = [12.8797, 121.7740] // Center of Philippines
  const maxBounds: [[number, number], [number, number]] = [
    [4.5, 116.0], // Southwest coordinates (tighter)
    [21.5, 127.0] // Northeast coordinates (tighter)
  ]

  const getIcon = (signal: DistressSignal) => {
    if (signal.status === 'resolved') return greenPulseIcon
    if (signal.severity === 'dire') return redPulseIcon
    return orangePulseIcon
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      minZoom={6}
      maxZoom={18}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      bounceAtZoomLimits={true}
      style={{ height: '100%', width: '100%' }}
      className="z-0 bg-gray-100 dark:bg-aura-black transition-colors duration-300"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        className="block dark:hidden"
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        className="hidden dark:block"
      />
      {center && <MapUpdater center={center} />}
      {signals.map((signal) => (
        <Marker
          key={signal.id}
          position={[signal.latitude, signal.longitude]}
          icon={getIcon(signal)}
          eventHandlers={{
            click: () => onMarkerClick(signal),
          }}
        >
          <Popup className="custom-popup" closeButton={false}>
            <div className="p-1 min-w-[200px] bg-aura-card text-white border border-gray-700 rounded-lg">
              <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-700`}>
                {signal.severity === 'dire' ? (
                    <AlertTriangle className="h-5 w-5 text-aura-danger" />
                ) : (
                    <Info className="h-5 w-5 text-aura-warning" />
                )}
                <h3 className={`font-bold text-base m-0 ${
                    signal.severity === 'dire' ? 'text-aura-danger' : 'text-aura-warning'
                }`}>
                  {signal.severity === 'dire' ? 'Critical Alert' : 'Distress Signal'}
                </h3>
              </div>

              <div className="mb-3 space-y-1">
                <p className="text-sm text-gray-300 m-0">
                  Status: <span className={`uppercase font-bold text-xs px-1.5 py-0.5 rounded ${
                      signal.status === 'resolved' ? 'bg-green-900/30 text-green-400 border border-green-800' :
                      signal.status === 'in-progress' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' :
                      'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>{signal.status}</span>
                </p>
                <p className="text-xs text-gray-400 m-0 italic line-clamp-2">
                    "{signal.voice_transcript}"
                </p>
              </div>

              <button
                onClick={() => onMarkerClick(signal)}
                className="w-full bg-aura-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
