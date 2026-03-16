import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { DistressSignal } from '../types'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { format, subDays } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Analytics() {
  const [signals, setSignals] = useState<DistressSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSignals()
  }, [])

  const fetchSignals = async () => {
    const { data, error } = await supabase
      .from('distress_signals')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) console.error('Error fetching analytics data:', error)
    else if (data) setSignals(data as DistressSignal[])
    setLoading(false)
  }

  // Calculate stats
  const totalSignals = signals.length
  const activeSignals = signals.filter(s => s.status !== 'resolved').length
  const resolvedSignals = signals.filter(s => s.status === 'resolved').length
  const direSignals = signals.filter(s => s.severity === 'dire').length
  const avgResponseTime = '12m' // Placeholder for calculation logic

  // Chart Data: Signals over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return format(d, 'MMM dd')
  })

  const signalsByDay = last7Days.map(day => {
    return signals.filter(s => format(new Date(s.created_at), 'MMM dd') === day).length
  })

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Daily Distress Signals',
        data: signalsByDay,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  }

  // Chart Data: Severity Distribution
  const severityData = {
    labels: ['Critical (Dire)', 'Standard (Normal)'],
    datasets: [
      {
        data: [
          signals.filter(s => s.severity === 'dire').length,
          signals.filter(s => s.severity === 'normal').length,
        ],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)', // Red for dire
          'rgba(234, 179, 8, 0.8)', // Yellow for normal
        ],
        borderColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(234, 179, 8, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Emergency Analytics Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalSignals}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Active Emergencies</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{activeSignals}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Resolved Cases</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{resolvedSignals}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Critical Rate</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {totalSignals > 0 ? Math.round((direSignals / totalSignals) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Signal Trends (7 Days)</h3>
            <div className="h-64">
              <Line options={{ responsive: true, maintainAspectRatio: false }} data={lineChartData} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
            <div className="h-64 flex justify-center">
              <Doughnut options={{ responsive: true, maintainAspectRatio: false }} data={severityData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
