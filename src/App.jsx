import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
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
import Bets from './pages/Bets'
import CasinoHistory from './pages/CasinoHistory'
import AccountSettlement from './pages/AccountSettlement'
import DepositAccounts from './pages/DepositAccounts'

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
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="users/:userId" element={<UserDetails />} />
                <Route path="sub-admins" element={<SubAdminManagement />} />
                <Route path="wallets" element={<Wallets />} />
                <Route path="games" element={<Games />} />
                <Route path="bets" element={<Bets />} />
                <Route path="casino-history" element={<CasinoHistory />} />
                <Route path="deposits" element={<Deposits />} />
                <Route path="withdrawals" element={<Withdrawals />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="account-settlement" element={<AccountSettlement />} />
                <Route path="bonuses" element={<Bonuses />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="risk-fraud" element={<RiskFraud />} />
                <Route path="reports" element={<Reports />} />
                <Route path="cms" element={<CMS />} />
                <Route path="support" element={<Support />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="deposit-accounts" element={<DepositAccounts />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
