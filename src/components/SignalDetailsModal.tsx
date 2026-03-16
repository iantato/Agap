import { Fragment, useState } from 'react'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { X, Check, ChevronDown, MapPin, Mic, Clock, AlertTriangle, Users } from 'lucide-react'
import { DistressSignal } from '../types'
import { supabase } from '../supabase/client'
import { format } from 'date-fns'
import { clsx } from 'clsx'

interface SignalDetailsModalProps {
  isOpen: boolean
  closeModal: () => void
  signal: DistressSignal | null
}

const statusOptions = [
  { name: 'Pending', value: 'pending' },
  { name: 'In Progress', value: 'in-progress' },
  { name: 'Resolved', value: 'resolved' },
]

export default function SignalDetailsModal({ isOpen, closeModal, signal }: SignalDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  if (!signal) return null

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('distress_signals')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', signal.id)

    setLoading(false)
    if (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[2000]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-aura-card border border-gray-700 p-8 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold leading-6 text-white flex items-center gap-2"
                    >
                        {signal.severity === 'dire' && (
                            <AlertTriangle className="h-6 w-6 text-aura-danger" />
                        )}
                        Signal Details
                    </Dialog.Title>
                    <p className="text-sm text-gray-400 mt-1">
                        ID: <span className="font-mono text-aura-primary">{signal.id.slice(0, 8)}</span>
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-full p-1 hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Update Status</label>
                    <Listbox value={signal.status} onChange={handleStatusChange} disabled={loading}>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-aura-black py-3 pl-4 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-700 focus:outline-none focus:ring-2 focus:ring-aura-primary sm:text-sm sm:leading-6">
                          <span className={clsx(
                              "block truncate uppercase font-bold",
                              signal.status === 'resolved' ? 'text-green-500' :
                              signal.status === 'in-progress' ? 'text-blue-500' : 'text-gray-400'
                          )}>{signal.status.replace('-', ' ')}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-aura-card border border-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                            {statusOptions.map((option, personIdx) => (
                              <Listbox.Option
                                key={personIdx}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                    active ? 'bg-gray-800 text-white' : 'text-gray-300'
                                  }`
                                }
                                value={option.value}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {option.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-aura-primary">
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={clsx(
                        "p-4 rounded-xl border",
                        signal.severity === 'dire' ? "bg-red-900/20 border-red-900/50" : "bg-amber-900/20 border-amber-900/50"
                    )}>
                      <p className={clsx(
                          "text-xs font-semibold uppercase tracking-wider mb-1",
                          signal.severity === 'dire' ? "text-red-500" : "text-amber-500"
                      )}>Severity Level</p>
                      <p className={clsx(
                          "text-lg font-bold",
                          signal.severity === 'dire' ? "text-red-400" : "text-amber-400"
                      )}>
                        {signal.severity === 'dire' ? 'CRITICAL' : 'NORMAL'}
                      </p>
                    </div>
                    <div className="bg-aura-black p-4 rounded-xl border border-gray-800">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        People Count
                      </p>
                      <p className="text-lg font-bold text-white">
                        {signal.people_count || 1} Person(s)
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-aura-black p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordinates</p>
                    </div>
                    <p className="font-mono text-base text-gray-300 tracking-tight bg-gray-900 p-2 rounded border border-gray-800 inline-block">
                      {signal.latitude.toFixed(6)}, {signal.longitude.toFixed(6)}
                    </p>
                  </div>

                  {/* Transcript */}
                  <div className="bg-blue-900/20 p-5 rounded-xl border border-blue-900/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-blue-900/50 p-1.5 rounded-full">
                            <Mic className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Voice Transcript</p>
                    </div>
                    <p className="text-base text-gray-300 italic leading-relaxed">
                      "{signal.voice_transcript || 'No transcript available'}"
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-xl border border-transparent bg-aura-primary px-6 py-3 text-sm font-bold text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 w-full transition-colors shadow-lg hover:shadow-xl"
                    onClick={closeModal}
                  >
                    Close Details
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
