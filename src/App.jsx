import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { PERMISSIONS } from './constants/roles'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Wallets from './pages/Wallets'
import Games from './pages/Games'
import Deposits from './pages/Deposits'
import Withdrawals from './pages/Withdrawals'
import Transactions from './pages/Transactions'
import Bonuses from './pages/Bonuses'
import Referrals from './pages/Referrals'
import RiskFraud from './pages/RiskFraud'
import Reports from './pages/Reports'
import CMS from './pages/CMS'
import Support from './pages/Support'
import Notifications from './pages/Notifications'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import SubAdminManagement from './pages/SubAdminManagement'
import UserDetails from './pages/UserDetails'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-900">
          <div className="max-w-md rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-teal-600">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-500">{this.state.error?.message}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_DASHBOARD}><Dashboard /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_USERS}><Users /></ProtectedRoute>} />
                <Route path="users/:userId" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_USERS}><UserDetails /></ProtectedRoute>} />
                <Route path="sub-admins" element={<ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_ROLES}><SubAdminManagement /></ProtectedRoute>} />
                <Route path="wallets" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_WALLETS}><Wallets /></ProtectedRoute>} />
                <Route path="games" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_GAMES}><Games /></ProtectedRoute>} />
                <Route path="deposits" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_DEPOSITS}><Deposits /></ProtectedRoute>} />
                <Route path="withdrawals" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_WITHDRAWALS}><Withdrawals /></ProtectedRoute>} />
                <Route path="transactions" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_TRANSACTIONS}><Transactions /></ProtectedRoute>} />
                <Route path="bonuses" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_BONUSES}><Bonuses /></ProtectedRoute>} />
                <Route path="referrals" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_REFERRALS}><Referrals /></ProtectedRoute>} />
                <Route path="risk-fraud" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_RISK}><RiskFraud /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_REPORTS}><Reports /></ProtectedRoute>} />
                <Route path="cms" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_CMS}><CMS /></ProtectedRoute>} />
                <Route path="support" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_TICKETS}><Support /></ProtectedRoute>} />
                <Route path="notifications" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_NOTIFICATIONS}><Notifications /></ProtectedRoute>} />
                <Route path="audit-logs" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_AUDIT_LOG}><AuditLogs /></ProtectedRoute>} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<ProtectedRoute requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
