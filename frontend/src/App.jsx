import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import AnalyzePdf from './pages/AnalyzePdf'
import AnalyzeWeb3 from './pages/AnalyzeWeb3'
import AnalyzeTyposquatting from './pages/AnalyzeTyposquatting'
import AnalyzeDns from './pages/AnalyzeDns'
import AnalyzeSecurity from './pages/AnalyzeSecurity'
import ThreatMap from './pages/ThreatMap'
import AdminUsers from './pages/AdminUsers'
import AdminReportes from './pages/AdminReportes'
import Enlaces from './pages/Enlaces'
import ExtensionInstall from './pages/ExtensionInstall'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/extension" element={<ExtensionInstall />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze"
        element={
          <ProtectedRoute>
            <Analyze />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/pdf"
        element={
          <ProtectedRoute>
            <AnalyzePdf />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/web3"
        element={
          <ProtectedRoute>
            <AnalyzeWeb3 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/typosquatting"
        element={
          <ProtectedRoute>
            <AnalyzeTyposquatting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/dns"
        element={
          <ProtectedRoute>
            <AnalyzeDns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze/security"
        element={
          <ProtectedRoute>
            <AnalyzeSecurity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enlaces"
        element={
          <ProtectedRoute>
            <Enlaces />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/threat-map"
        element={
          <ProtectedRoute>
            <ThreatMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reportes"
        element={
          <AdminRoute>
            <AdminReportes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
