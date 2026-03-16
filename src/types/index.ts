export interface DistressSignal {
  id: string
  user_id: string
  latitude: number
  longitude: number
  severity: 'dire' | 'normal'
  status: 'pending' | 'in-progress' | 'resolved'
  people_count: number
  voice_transcript: string | null
  responder_notes: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  phone_number: string
  name: string | null
  created_at: string
}

export interface Responder {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface Alert {
  id: string
  message: string
  severity: 'dire' | 'normal'
  timestamp: string
  location: string
  count?: number
}
