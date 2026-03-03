import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiMail, HiLockClosed } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ROLES } from '../constants/roles'

const DEMO_ROLES = [
  { role: ROLES.SUPER_ADMIN, name: 'Master Admin (Super Admin)', email: 'admin@crownbet.com' },
  { role: ROLES.SUB_ADMIN, name: 'Sub Admin (assigned users only)', email: '' },
  { role: ROLES.ADMIN, name: 'Admin', email: 'admin@crownbet.com' },
  { role: ROLES.FINANCE, name: 'Finance', email: 'finance@crownbet.com' },
  { role: ROLES.RISK, name: 'Risk', email: 'risk@crownbet.com' },
  { role: ROLES.SUPPORT, name: 'Support', email: 'support@crownbet.com' },
]

function loadSubAdmins(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (_) {}
  return []
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [demoRole, setDemoRole] = useState(ROLES.SUPER_ADMIN)
  const [selectedSubAdminId, setSelectedSubAdminId] = useState('')
  const { login, isLoggedIn, SUB_ADMINS_KEY } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const subAdmins = useMemo(() => loadSubAdmins(SUB_ADMINS_KEY), [SUB_ADMINS_KEY])
  const activeSubAdmins = useMemo(() => subAdmins.filter((a) => a.status === 'active'), [subAdmins])

  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true })
  }, [isLoggedIn, from, navigate])

  useEffect(() => {
    if (demoRole !== ROLES.SUB_ADMIN) setSelectedSubAdminId('')
  }, [demoRole])

  function handleSubmit(e) {
    e.preventDefault()
    if (demoRole === ROLES.SUB_ADMIN) {
      const subAdmin = activeSubAdmins.find((a) => String(a.id) === String(selectedSubAdminId))
      if (!subAdmin) {
        addToast('Select a sub-admin account or create one as Master Admin first.', 'error')
        return
      }
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        login('ok', {
          id: subAdmin.id,
          email: subAdmin.email,
          name: subAdmin.name,
          role: 'sub_admin',
          roles: subAdmin.roles || [],
          assignedUserIds: subAdmin.assignedUserIds || [],
          maxGameExposure: subAdmin.maxGameExposure ?? 100000,
          canManageUserAccounts: subAdmin.canManageUserAccounts !== false,
          canManagePersonalLimits: subAdmin.canManagePersonalLimits !== false,
          canAdjustWallets: subAdmin.canAdjustWallets !== false,
          maxAdjustAmount: subAdmin.maxAdjustAmount != null && subAdmin.maxAdjustAmount !== '' ? Number(subAdmin.maxAdjustAmount) : null,
        })
        addToast(`Welcome, ${subAdmin.name}. You can only see your assigned users.`, 'success')
        navigate(from, { replace: true })
      }, 400)
      return
    }
    if (!email.trim() || !password) {
      addToast('Please enter email and password', 'error')
      return
    }
    setSubmitting(true)
    const valid = (email.trim().toLowerCase() === 'admin@crownbet.com' && password === 'admin123') || (email.trim() && password.length >= 4)
    const demoUser = DEMO_ROLES.find((r) => r.role === demoRole) || DEMO_ROLES[0]
    setTimeout(() => {
      setSubmitting(false)
      if (valid) {
        login('ok', { id: 1, email: demoUser.email, name: demoUser.name, role: demoUser.role })
        addToast(`Welcome back as ${demoUser.name}!`, 'success')
        navigate(from, { replace: true })
      } else {
        addToast('Invalid email or password', 'error')
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crownbet</h1>
          <p className="text-gray-500 text-sm mt-1">Admin – Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crownbet.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-gray-300 bg-gray-50 text-teal-500 focus:ring-teal-500" />
              <span className="text-gray-600 text-sm">Remember me</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Demo: login as</label>
              <select value={demoRole} onChange={(e) => setDemoRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:outline-none text-sm">
                {DEMO_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>{r.name}</option>
                ))}
              </select>
            </div>
            {demoRole === ROLES.SUB_ADMIN && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub Admin account</label>
                <select
                  value={selectedSubAdminId}
                  onChange={(e) => setSelectedSubAdminId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-teal-500 focus:outline-none text-sm"
                >
                  <option value="">— Select sub-admin —</option>
                  {activeSubAdmins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.email}) — {(a.assignedUserIds || []).length} users
                    </option>
                  ))}
                </select>
                {activeSubAdmins.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No sub-admins yet. Sign in as Master Admin and add one from Sub Admin Management.</p>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Demo: admin@crownbet.com / admin123
        </p>
      </div>
    </div>
  )
}
