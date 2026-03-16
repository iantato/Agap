import { DistressSignal } from '../types'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, Clock, Activity, ShieldAlert, Mic } from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
  signals: DistressSignal[]
  onSignalClick: (signal: DistressSignal) => void
  activeSignalId?: string
  onClose?: () => void
}

export default function Sidebar({ signals, onSignalClick, activeSignalId }: SidebarProps) {

  return (
    <div className="h-full bg-aura-dark/95 backdrop-blur-sm border-l border-gray-800 flex flex-col w-full md:w-[450px] z-20 relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-aura-dark sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-aura-primary" />
                Live Triage Feed
            </h2>
            <div className="px-3 py-1 bg-green-900/30 border border-green-800 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-400 tracking-wider">AGENT ACTIVE</span>
            </div>
        </div>
        <p className="text-sm text-gray-400">Real-time distress analysis</p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 space-y-4">
            <div className="bg-gray-800 p-4 rounded-full">
                <Activity className="h-8 w-8 text-gray-600" />
            </div>
            <p className="font-medium">System Idle</p>
            <p className="text-xs text-gray-600">Waiting for distress signals...</p>
          </div>
        ) : (
            signals.map((signal) => (
              <div
                key={signal.id}
                onClick={() => onSignalClick(signal)}
                className={clsx(
                    "group relative p-5 cursor-pointer rounded-xl border transition-all duration-200",
                    activeSignalId === signal.id
                        ? 'bg-aura-card border-aura-primary ring-1 ring-aura-primary shadow-lg shadow-blue-900/20'
                        : 'bg-aura-card border-gray-800 hover:border-gray-700',
                )}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className={clsx(
                        "p-2 rounded-lg",
                        signal.severity === 'dire' ? "bg-red-900/20" : "bg-amber-900/20"
                    )}>
                        {signal.severity === 'dire' ? (
                            <ShieldAlert className={clsx("h-6 w-6", signal.severity === 'dire' ? "text-red-500" : "text-amber-500")} />
                        ) : (
                            <AlertTriangle className={clsx("h-6 w-6", "text-amber-500")} />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={clsx(
                                "font-bold text-lg leading-tight mb-1",
                                signal.severity === 'dire' ? "text-red-400" : "text-amber-400"
                            )}>
                                {signal.severity === 'dire' ? 'Immediate Rescue Needed' : 'Stranded but Safe'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <Clock className="h-3 w-3" />
                            {format(new Date(signal.created_at), 'HH:mm').toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {signal.severity === 'dire'
                        ? "Critical situation detected. High water levels reported with potential medical emergency."
                        : "Individual reports being stranded. Currently stable but requires evacuation."}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {signal.severity === 'dire' ? (
                        <>
                            <span className="px-2 py-1 bg-red-900/30 border border-red-900/50 rounded text-[10px] font-bold text-red-400 tracking-wide uppercase">
                                High Distress Detected
                            </span>
                            <span className="px-2 py-1 bg-red-900/30 border border-red-900/50 rounded text-[10px] font-bold text-red-400 tracking-wide uppercase">
                                Multiple Persons ({signal.people_count || 1})
                            </span>
                        </>
                    ) : (
                        <>
                             <span className="px-2 py-1 bg-amber-900/30 border border-amber-900/50 rounded text-[10px] font-bold text-amber-400 tracking-wide uppercase">
                                Calm Voice Detected
                            </span>
                            <span className="px-2 py-1 bg-amber-900/30 border border-amber-900/50 rounded text-[10px] font-bold text-amber-400 tracking-wide uppercase">
                                Roof Location
                            </span>
                        </>
                    )}
                </div>

                {/* Transcript Box */}
                <div className="bg-aura-black rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-3 w-3 text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transcript</span>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-3 line-clamp-2">
                        "{signal.voice_transcript || 'Audio transcript processing...'}"
                    </p>
                    <div className="flex justify-end">
                        <span className="text-xs font-medium text-aura-primary flex items-center gap-1 hover:text-blue-400 transition-colors">
                            Full Audio & Log &gt;
                        </span>
                    </div>
                </div>

                {/* Status Footer */}
                <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className={clsx(
                        "text-xs font-bold uppercase flex items-center gap-2",
                        signal.status === 'resolved' ? "text-green-500" : "text-gray-500"
                    )}>
                        {signal.status === 'resolved' && <CheckCircle className="h-4 w-4" />}
                        {signal.status}
                    </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
