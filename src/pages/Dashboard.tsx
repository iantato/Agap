import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { DistressSignal } from '../types'
import Map from '../components/Map'
import Sidebar from '../components/Sidebar'
import { voiceSystem } from '../utils/VoiceAlertSystem'
import { Volume2, VolumeX, Radio, Menu, ShieldAlert, Activity, Phone } from 'lucide-react'
import SignalDetailsModal from '../components/SignalDetailsModal'
import { clsx } from 'clsx'

export default function Dashboard() {
  const [signals, setSignals] = useState<DistressSignal[]>([])
  const [totalSignalCount, setTotalSignalCount] = useState(0)
  const [activeSignal, setActiveSignal] = useState<DistressSignal | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    fetchSignals()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('distress_signals_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'distress_signals' },
        (payload) => {
          console.log('Realtime update:', payload)
          if (payload.eventType === 'INSERT') {
            const newSignal = payload.new as DistressSignal
            setSignals(prev => [newSignal, ...prev])
            setTotalSignalCount(prev => prev + 1)
            // Voice alert for new dire signals
            if (newSignal.severity === 'dire') {
              voiceSystem.announceAlert(newSignal)
            }
          } else if (payload.eventType === 'UPDATE') {
            setSignals(prev => prev.map(s => s.id === payload.new.id ? payload.new as DistressSignal : s))

            // Update active signal if it's currently open
            if (activeSignal?.id === payload.new.id) {
                setActiveSignal(payload.new as DistressSignal)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeSignal])

  useEffect(() => {
    voiceSystem.setEnabled(soundEnabled)
  }, [soundEnabled])

  const fetchSignals = async () => {
    const { data, error, count } = await supabase
      .from('distress_signals')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching signals:', error)
    else {
        setSignals(data as DistressSignal[])
        if (count !== null) setTotalSignalCount(count)
    }
  }

  const handleSignalClick = (signal: DistressSignal) => {
    setActiveSignal(signal)
    setMapCenter([signal.latitude, signal.longitude])
    setIsModalOpen(true)
  }

  const simulateSignal = async () => {
    const lat = 14.5995 + (Math.random() - 0.5) * 0.1
    const lng = 120.9842 + (Math.random() - 0.5) * 0.1
    const severity = Math.random() > 0.5 ? 'dire' : 'normal'

    await supabase.from('distress_signals').insert({
        user_id: crypto.randomUUID(),
        latitude: lat,
        longitude: lng,
        severity: severity,
        status: 'pending',
        people_count: Math.floor(Math.random() * 5) + 1,
        voice_transcript: 'Help! The water is rising fast!',
        created_at: new Date().toISOString()
    })
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-aura-black text-white">
      {/* Header */}
      <div className="h-16 bg-aura-black border-b border-gray-800 flex items-center justify-between px-6 z-30 shadow-lg">
        <div className="flex items-center gap-4">
            <div className="bg-aura-primary p-2 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold leading-none">Aura Rescue Command</h1>
                <p className="text-xs text-gray-400 mt-1">Powered by Agora ConvoAI</p>
            </div>
        </div>

        <div className="flex items-center gap-6">
             {/* Stats */}
             <div className="flex gap-4">
                <div className="bg-aura-card border border-gray-700 px-4 py-1.5 rounded-lg flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total Calls</p>
                        <p className="text-lg font-bold leading-none">{totalSignalCount.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-aura-card border border-gray-700 px-4 py-1.5 rounded-lg flex items-center gap-3">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Critical</p>
                        <p className="text-lg font-bold leading-none text-red-500">{signals.filter(s => s.severity === 'dire').length}</p>
                    </div>
                </div>
                <div className="bg-aura-card border border-gray-700 px-4 py-1.5 rounded-lg flex items-center gap-3">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Active Rescues</p>
                        <p className="text-lg font-bold leading-none text-blue-400">{signals.filter(s => s.status === 'in-progress').length}</p>
                    </div>
                </div>
             </div>

             <div className="h-8 w-[1px] bg-gray-700"></div>

             {/* AI Dispatcher Toggle */}
             <div className="flex items-center gap-3 bg-green-900/20 border border-green-900 px-3 py-1.5 rounded-full">
                <Volume2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">AI Dispatcher</span>
                <div className="w-8 h-4 bg-green-500 rounded-full relative cursor-pointer" onClick={() => setSoundEnabled(!soundEnabled)}>
                    <div className={clsx(
                        "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                        soundEnabled ? "right-0.5" : "left-0.5 bg-gray-400"
                    )}></div>
                </div>
             </div>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative bg-aura-black">
            {/* Network Status Badge */}
            <div className="absolute top-6 left-6 z-[1000] bg-aura-card/90 backdrop-blur border border-gray-700 px-4 py-2 rounded-lg shadow-xl flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Network Status</p>
                    <p className="text-sm font-bold text-white">SD-RTN™ Online</p>
                </div>
            </div>

            {/* Latency Badge */}
            <div className="absolute top-6 right-6 z-[1000] bg-aura-card/90 backdrop-blur border border-gray-700 px-4 py-2 rounded-lg shadow-xl text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Agent Studio Latency</p>
                <p className="text-sm font-bold text-green-400 flex items-center justify-end gap-1">
                    <Activity className="h-3 w-3" />
                    ~120ms
                </p>
            </div>

            <Map
            signals={signals}
            onMarkerClick={handleSignalClick}
            center={mapCenter}
            />

            {/* Sim Button (Hidden in production ideally) */}
             <div className="absolute bottom-6 left-6 z-[1000]">
                <button
                onClick={simulateSignal}
                className="group flex items-center justify-center p-3 rounded-full shadow-lg bg-gray-800 text-white hover:bg-gray-700 transition-all border border-gray-600"
                title="Simulate Distress Signal"
                >
                <Radio className="h-5 w-5 group-hover:animate-pulse text-gray-400 group-hover:text-white" />
                </button>
            </div>
        </div>

        {/* Sidebar */}
        <div className={clsx(
            "w-[450px] border-l border-gray-800 z-20 bg-aura-dark transition-all duration-300 absolute right-0 top-0 bottom-0 md:relative",
            !isSidebarOpen && "translate-x-full md:translate-x-0 md:hidden"
        )}>
            <Sidebar
            signals={signals}
            onSignalClick={handleSignalClick}
            activeSignalId={activeSignal?.id}
            onClose={() => setIsSidebarOpen(false)}
            />
        </div>
      </div>

      <SignalDetailsModal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          signal={activeSignal}
      />
    </div>
  )
}
