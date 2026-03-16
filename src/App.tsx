import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Analytics from './pages/Analytics'

// Placeholder for Login and Analytics until implemented
const LoginPlaceholder = () => <div className="p-8">Login Page (Coming Soon)</div>
const AnalyticsPlaceholder = () => <div className="p-8">Analytics Page (Coming Soon)</div>

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPlaceholder />} />
        <Route path="/analytics" element={<AnalyticsPlaceholder />} />
      </Routes>
    </Router>
  )
}

export default App
