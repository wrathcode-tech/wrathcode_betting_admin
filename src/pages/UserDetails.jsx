/**
 * User Details – full page for PlayAdd/BetFury: green banner, left sub-nav (Profile, Wallet, Gaming, Support & Referral),
 * cards: Basic Info, Account, Security, Login Security, Portfolio (INR). No P2P/crypto/trading.
 */
import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  HiChevronRight,
  HiChevronLeft,
  HiUser,
  HiArrowLeft,
  HiIdentification,
  HiCash,
  HiCreditCard,
  HiCollection,
  HiTicket,
  HiUserGroup,
  HiShieldCheck,
  HiLockClosed,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'
import { getTicketsByUser, getReferralByUser } from '../services/api'

/** Normalize API user (e.g. from GET /api/v1/master/users/:userId) to page shape */
function normalizeUserDetail(apiUser) {
  if (!apiUser) return null
  const raw = apiUser.user ?? apiUser
  return {
    ...raw,
    id: raw._id ?? raw.id,
    name: raw.fullName ?? raw.name,
    phone: raw.mobile ? (raw.countryCode ? `${raw.countryCode} ${raw.mobile}` : raw.mobile) : raw.phone,
    status: raw.accountStatus ?? raw.status,
  }
}

function formatDateTime(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${day}/${month}/${year}, ${String(h).padStart(2, '0')}:${m} ${ampm}`
}

const subNavSections = [
  {
    key: 'profile',
    label: 'PROFILE',
    items: [
      { id: 'user-details', label: 'User Details', icon: HiIdentification },
    ],
  },
  {
    key: 'wallet',
    label: 'WALLET',
    items: [
      { id: 'wallet-details', label: 'Wallet Details', icon: HiCash },
      { id: 'deposit-withdrawal', label: 'Deposit / Withdrawal', icon: HiCreditCard },
    ],
  },
  {
    key: 'gaming',
    label: 'GAMING',
    items: [
      { id: 'game-history', label: 'Game History', icon: HiCollection },
    ],
  },
  {
    key: 'support',
    label: 'SUPPORT & REFERRAL',
    items: [
      { id: 'support-tickets', label: 'Support Tickets', icon: HiTicket },
      { id: 'referral', label: 'Referral', icon: HiUserGroup },
    ],
  },
]

function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {Icon && <Icon className="w-5 h-5 text-teal-600" />}
        <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{title}</h3>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm shrink-0">{label}</span>
      <span className="text-gray-900 text-sm text-right font-medium">{value ?? '–'}</span>
    </div>
  )
}

export default function UserDetails() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('user-details')
  const [tickets, setTickets] = useState([])
  const [referralData, setReferralData] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletError, setWalletError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txPagination, setTxPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState(null)
  const [txPage, setTxPage] = useState(1)
  const [txLimit, setTxLimit] = useState(20)
  const [txType, setTxType] = useState('')
  const [gameHistory, setGameHistory] = useState([])
  const [ghPagination, setGhPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [ghLoading, setGhLoading] = useState(false)
  const [ghError, setGhError] = useState(null)
  const [ghPage, setGhPage] = useState(1)
  const [ghLimit, setGhLimit] = useState(20)
  const [ghGameCode, setGhGameCode] = useState('')
  const [ghProviderCode, setGhProviderCode] = useState('')
  const { getAssignedUserIds, hasPermission, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const canManagePersonalLimits = hasPermission(PERMISSIONS.EDIT_USERS) || caps.canManagePersonalLimits
  const [personalLimits, setPersonalLimits] = useState({ maxSingleBet: 10000, dailyLossLimit: 50000 })
  const [limitsEditMode, setLimitsEditMode] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    AuthService.getMasterUserById(userId)
      .then((res) => {
        if (res?.success && res?.data) {
          setUser(normalizeUserDetail(res.data))
        } else {
          setUser(null)
          setError(res?.message || 'User not found')
        }
      })
      .catch(() => {
        setUser(null)
        setError('Failed to load user')
      })
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    const assigned = getAssignedUserIds()
    if (user && assigned && assigned.length > 0 && !assigned.includes(user.id)) {
      navigate('/users', { replace: true })
    }
  }, [user, getAssignedUserIds, navigate])

  useEffect(() => {
    if (user) setPersonalLimits({ maxSingleBet: user.maxSingleBet ?? 10000, dailyLossLimit: user.dailyLossLimit ?? 50000 })
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    getTicketsByUser(user.id).then((r) => setTickets(r.data || []))
    getReferralByUser(user.id).then((r) => setReferralData(r.data || null))
  }, [user?.id])

  useEffect(() => {
    if (activeTab !== 'wallet-details' || !userId) return
    setWalletLoading(true)
    setWalletError(null)
    AuthService.getMasterUserWallet(userId)
      .then((res) => {
        if (res?.success && res?.data?.wallet) {
          setWallet(res.data.wallet)
          setWalletError(null)
        } else {
          setWallet(null)
          setWalletError(res?.message || 'Failed to load wallet')
        }
      })
      .catch(() => {
        setWallet(null)
        setWalletError('Failed to load wallet')
      })
      .finally(() => setWalletLoading(false))
  }, [activeTab, userId])

  useEffect(() => {
    if (activeTab !== 'deposit-withdrawal' || !userId) return
    setTxLoading(true)
    setTxError(null)
    const params = { page: txPage, limit: txLimit }
    if (txType) params.type = txType
    AuthService.getMasterUserTransactions(userId, params)
      .then((res) => {
        if (res?.success && res?.data) {
          setTransactions(res.data.transactions || [])
          setTxPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setTxError(null)
        } else {
          setTransactions([])
          setTxError(res?.message || 'Failed to load transactions')
        }
      })
      .catch(() => {
        setTransactions([])
        setTxError('Failed to load transactions')
      })
      .finally(() => setTxLoading(false))
  }, [activeTab, userId, txPage, txLimit, txType])

  useEffect(() => {
    if (activeTab !== 'game-history' || !userId) return
    setGhLoading(true)
    setGhError(null)
    const params = { page: ghPage, limit: ghLimit }
    if (ghGameCode.trim()) params.gameCode = ghGameCode.trim()
    if (ghProviderCode.trim()) params.providerCode = ghProviderCode.trim()
    AuthService.getMasterUserGameHistory(userId, params)
      .then((res) => {
        if (res?.success && res?.data) {
          setGameHistory(res.data.transactions || [])
          setGhPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setGhError(null)
        } else {
          setGameHistory([])
          setGhError(res?.message || 'Failed to load game history')
        }
      })
      .catch(() => {
        setGameHistory([])
        setGhError('Failed to load game history')
      })
      .finally(() => setGhLoading(false))
  }, [activeTab, userId, ghPage, ghLimit, ghGameCode, ghProviderCode])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading user...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-gray-500">{error || 'User not found'}</p>
        <Link to="/users" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
          Back to User List
        </Link>
      </div>
    )
  }

  const initials = (user.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const extended = {
    registeredBy: 'phone',
    emailVerified: user.emailVerified ?? false,
    phoneVerified: user.phoneVerified ?? !!user.phone,
    twoFaEnabled: user.twoFaEnabled ?? false,
    passkeyEnabled: user.passkeyEnabled ?? false,
    lastLoginAt: user.lastLoginAt || user.createdAt,
    lastLoginIp: user.lastLoginIp || '106.219.69.156',
    failedLoginAttempts: user.failedLoginAttempts ?? 0,
    lastFailedLogin: user.lastFailedLogin || null,
    ...user,
  }
  const mainBalance = user.balanceFiat ?? 0
  const bonusBalance = user.bonusBalance ?? 0
  const totalBalance = mainBalance + bonusBalance

  return (
    <div className="space-y-0">
      <PageBanner
        title={user.name}
        subtitle={`${user.email}${user.phone ? ' • ' + user.phone : ''} – PlayAdd / BetFury`}
        icon={HiUser}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="hover:text-teal-600 transition-colors">Dashboard</Link>
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/users" className="hover:text-teal-600 transition-colors">User List</Link>
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 font-medium truncate">{user.name}</span>
        </nav>
        <Link
          to="/users"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors text-sm font-medium"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to List
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 pt-6">
        {/* Left sub-nav */}
        <nav className="lg:w-56 shrink-0 space-y-4">
          {subNavSections.map((section) => (
            <div key={section.key}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">{section.label}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Right content – cards */}
        <div className="flex-1 min-w-0">
          {activeTab === 'user-details' && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              <Card title="Basic Information" icon={HiIdentification}>
                <Row label="User ID" value={`${user.id}`} />
                <Row label="Full Name" value={user.name} />
                <Row label="Email" value={user.email} />
                <Row label="Mobile" value={user.phone || '–'} />
                <Row label="Registered By" value={extended.registeredBy} />
                <Row label="Country" value={user.country ? (user.country === 'IN' ? 'India' : user.country) : '–'} />
                <Row label="Timezone" value={user.timezone || '–'} />
                <Row label="Language" value={user.language ? (user.language === 'hi' ? 'Hindi' : user.language === 'en' ? 'English' : user.language) : '–'} />
              </Card>
              <Card title="Account" icon={HiUser}>
                <Row label="UUID" value={user.uuid || user.id} />
                <Row label="Referral" value={user.referralCode} />
                <Row label="Status" value={<span className="text-teal-600 font-semibold">{user.status === 'active' ? 'Active' : user.status}</span>} />
                <Row label="KYC Status" value={user.kyc ? user.kyc.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '–'} />
                <Row label="Joined" value={formatDateTime(user.createdAt)} />
                <Row label="Profile last updated" value={formatDateTime(user.updatedAt)} />
                <Row label="Currency" value="INR" />
              </Card>
              <Card title="Security & Verification" icon={HiShieldCheck}>
                <Row label="Email Verified" value={extended.emailVerified ? 'Yes' : 'No'} />
                <Row label="Phone Verified" value={extended.phoneVerified ? 'Yes' : 'No'} />
                <Row label="2FA / TOTP" value={extended.twoFaEnabled ? 'Enabled' : 'Disabled'} />
                <Row label="PASSKEY" value={extended.passkeyEnabled ? 'Enabled' : 'Disabled'} />
                <Row label="Last Login" value={formatDateTime(extended.lastLoginAt)} />
                <Row label="Last Login IP" value={extended.lastLoginIp} />
              </Card>
              <Card title="Login Security" icon={HiLockClosed}>
                <Row label="Password changed at" value={user.passwordChangedAt ? formatDateTime(user.passwordChangedAt) : 'Never'} />
                <Row label="Failed Login Attempts" value={String(extended.failedLoginAttempts)} />
                <Row label="Last Failed Login" value={extended.lastFailedLogin ? formatDateTime(extended.lastFailedLogin) : '–'} />
              </Card>
              <Card title="Personal Limits" icon={HiLockClosed} className="lg:col-span-2">
                {!limitsEditMode ? (
                  <div className="space-y-2">
                    <Row label="Max single bet (₹)" value={personalLimits.maxSingleBet?.toLocaleString() ?? '–'} />
                    <Row label="Daily loss limit (₹)" value={personalLimits.dailyLossLimit?.toLocaleString() ?? '–'} />
                    {canManagePersonalLimits && (
                      <div className="pt-2">
                        <button type="button" onClick={() => setLimitsEditMode(true)} className="text-sm text-teal-600 hover:text-teal-700 font-medium">Edit limits</button>
                      </div>
                    )}
                  </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setLimitsEditMode(false); }} className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Max single bet (₹)</label>
                        <input type="number" min={0} value={personalLimits.maxSingleBet} onChange={(e) => setPersonalLimits((p) => ({ ...p, maxSingleBet: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Daily loss limit (₹)</label>
                        <input type="number" min={0} value={personalLimits.dailyLossLimit} onChange={(e) => setPersonalLimits((p) => ({ ...p, dailyLossLimit: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm font-medium">Save</button>
                        <button type="button" onClick={() => setLimitsEditMode(false)} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-sm">Cancel</button>
                      </div>
                    </form>
                  )}
              </Card>
              <Card title="Portfolio (INR)" icon={HiCash} className="lg:col-span-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="text-lg font-bold text-teal-700">₹{totalBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Main</p>
                    <p className="text-lg font-bold text-gray-900">₹{mainBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-gray-500 uppercase">Bonus</p>
                    <p className="text-lg font-bold text-amber-700">₹{bonusBalance.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'wallet-details' && (
            <Card title="Wallet Details" icon={HiCash}>
              {walletLoading ? (
                <p className="text-sm text-gray-500">Loading wallet…</p>
              ) : walletError ? (
                <p className="text-sm text-red-600">{walletError}</p>
              ) : wallet ? (
                <>
                  <Row label="User ID" value={wallet.userId} />
                  <Row label="Balance" value={wallet.currency === 'INR' ? `₹${Number(wallet.balance ?? 0).toLocaleString()}` : `${wallet.currency} ${Number(wallet.balance ?? 0).toLocaleString()}`} />
                  <Row label="Currency" value={wallet.currency ?? '–'} />
                  <Row label="Bonus Balance" value={wallet.currency === 'INR' ? `₹${Number(wallet.bonusBalance ?? 0).toLocaleString()}` : `${wallet.currency} ${Number(wallet.bonusBalance ?? 0).toLocaleString()}`} />
                  <Row label="Total (Balance + Bonus)" value={wallet.currency === 'INR' ? `₹${(Number(wallet.balance ?? 0) + Number(wallet.bonusBalance ?? 0)).toLocaleString()}` : `${(Number(wallet.balance ?? 0) + Number(wallet.bonusBalance ?? 0)).toLocaleString()}`} />
                  <Row label="Total Deposited" value={wallet.currency === 'INR' ? `₹${Number(wallet.totalDeposited ?? 0).toLocaleString()}` : `${Number(wallet.totalDeposited ?? 0).toLocaleString()}`} />
                  <Row label="Total Withdrawn" value={wallet.currency === 'INR' ? `₹${Number(wallet.totalWithdrawn ?? 0).toLocaleString()}` : `${Number(wallet.totalWithdrawn ?? 0).toLocaleString()}`} />
                  <Row label="Total Bonus Credited" value={wallet.currency === 'INR' ? `₹${Number(wallet.totalBonusCredited ?? 0).toLocaleString()}` : `${Number(wallet.totalBonusCredited ?? 0).toLocaleString()}`} />
                  <Row label="Total Bonus Consumed" value={wallet.currency === 'INR' ? `₹${Number(wallet.totalBonusConsumed ?? 0).toLocaleString()}` : `${Number(wallet.totalBonusConsumed ?? 0).toLocaleString()}`} />
                  <Row label="Last Deposit At" value={formatDateTime(wallet.lastDepositAt)} />
                  <Row label="Last Withdraw At" value={formatDateTime(wallet.lastWithdrawAt)} />
                  <Row label="Created At" value={formatDateTime(wallet.createdAt)} />
                  <Row label="Updated At" value={formatDateTime(wallet.updatedAt)} />
                </>
              ) : (
                <p className="text-sm text-gray-500">No wallet data.</p>
              )}
            </Card>
          )}

          {activeTab === 'deposit-withdrawal' && (
            <div className="space-y-4">
              <Card title="Deposit / Withdrawal History" icon={HiCreditCard}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <select
                    value={txType}
                    onChange={(e) => { setTxType(e.target.value); setTxPage(1); }}
                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                  <select
                    value={txLimit}
                    onChange={(e) => { setTxLimit(Number(e.target.value)); setTxPage(1); }}
                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>
                {txLoading ? (
                  <p className="text-sm text-gray-500">Loading transactions…</p>
                ) : txError ? (
                  <p className="text-sm text-red-600">{txError}</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-gray-500">No transactions yet.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-gray-500">
                            <th className="py-2 pr-4">Type</th>
                            <th className="py-2 pr-4">Amount</th>
                            <th className="py-2 pr-4">Credit</th>
                            <th className="py-2 pr-4">Debit</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Balance Before</th>
                            <th className="py-2 pr-4">Balance After</th>
                            <th className="py-2 pr-4">Remarks</th>
                            <th className="py-2">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((t) => (
                            <tr key={t._id} className="border-b border-gray-100">
                              <td className="py-2.5 pr-4">
                                <Badge variant={t.type === 'deposit' ? 'success' : 'warning'}>{t.type || '–'}</Badge>
                              </td>
                              <td className="py-2.5 pr-4 font-medium">₹{Number(t.amount ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 pr-4 text-teal-600">₹{Number(t.credit ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 pr-4 text-gray-600">₹{Number(t.debit ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 pr-4">
                                <Badge variant={t.status === 'completed' || t.status === 'success' ? 'success' : t.status === 'failed' ? 'error' : 'warning'}>{t.status || '–'}</Badge>
                              </td>
                              <td className="py-2.5 pr-4 text-gray-600">₹{Number(t.balanceBefore ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 pr-4 text-gray-600">₹{Number(t.balanceAfter ?? 0).toLocaleString()}</td>
                              <td className="py-2.5 pr-4 text-gray-500 max-w-[120px] truncate" title={t.remarks}>{t.remarks || '–'}</td>
                              <td className="py-2.5 text-gray-500">{formatDateTime(t.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {txPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Page {txPage} of {txPagination.totalPages} ({txPagination.total} total)
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                            disabled={txPage <= 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <HiChevronLeft className="w-4 h-4 inline mr-1" /> Prev
                          </button>
                          <button
                            type="button"
                            onClick={() => setTxPage((p) => Math.min(txPagination.totalPages, p + 1))}
                            disabled={txPage >= txPagination.totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Next <HiChevronRight className="w-4 h-4 inline ml-1" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'game-history' && (
            <Card title="Game History" icon={HiCollection}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="text"
                  value={ghGameCode}
                  onChange={(e) => setGhGameCode(e.target.value)}
                  placeholder="Game code"
                  className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none w-32"
                />
                <input
                  type="text"
                  value={ghProviderCode}
                  onChange={(e) => setGhProviderCode(e.target.value)}
                  placeholder="Provider code"
                  className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none w-32"
                />
                <select
                  value={ghLimit}
                  onChange={(e) => { setGhLimit(Number(e.target.value)); setGhPage(1); }}
                  className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
              {ghLoading ? (
                <p className="text-sm text-gray-500">Loading game history…</p>
              ) : ghError ? (
                <p className="text-sm text-red-600">{ghError}</p>
              ) : gameHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No game history yet.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500">
                          <th className="py-2 pr-4">Game</th>
                          <th className="py-2 pr-4">Game Code</th>
                          <th className="py-2 pr-4">Provider</th>
                          <th className="py-2 pr-4">Date / Time</th>
                          <th className="py-2 pr-4">Bet Amount</th>
                          <th className="py-2 pr-4">Result</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Profit / Loss</th>
                          <th className="py-2 pr-4">Balance At Bet</th>
                          <th className="py-2 pr-4">Balance After</th>
                          <th className="py-2">Settled At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameHistory.map((g, i) => (
                          <tr key={g.providerRoundId || g.sessionId || i} className="border-b border-gray-100">
                            <td className="py-2.5 pr-4 font-medium text-gray-900">{g.gameName || '–'}</td>
                            <td className="py-2.5 pr-4 font-mono text-gray-600">{g.gameCode || '–'}</td>
                            <td className="py-2.5 pr-4 text-gray-600">{g.providerCode || '–'}</td>
                            <td className="py-2.5 pr-4 text-gray-500">{formatDateTime(g.dateTime || g.betAt)}</td>
                            <td className="py-2.5 pr-4 font-medium">₹{Number(g.betAmount ?? 0).toLocaleString()}</td>
                            <td className="py-2.5 pr-4">{g.result || '–'}</td>
                            <td className="py-2.5 pr-4">
                              <Badge variant={g.status === 'won' || g.status === 'settled' ? 'success' : g.status === 'lost' ? 'error' : 'warning'}>{g.status || '–'}</Badge>
                            </td>
                            <td className={`py-2.5 pr-4 font-medium ${Number(g.profitOrLoss ?? 0) >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                              ₹{Number(g.profitOrLoss ?? 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 pr-4 text-gray-600">₹{Number(g.balanceAtBet ?? 0).toLocaleString()}</td>
                            <td className="py-2.5 pr-4 text-gray-600">₹{Number(g.balanceAfter ?? 0).toLocaleString()}</td>
                            <td className="py-2.5 text-gray-500">{formatDateTime(g.settledAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {ghPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Page {ghPage} of {ghPagination.totalPages} ({ghPagination.total} total)
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGhPage((p) => Math.max(1, p - 1))}
                          disabled={ghPage <= 1}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <HiChevronLeft className="w-4 h-4 inline mr-1" /> Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => setGhPage((p) => Math.min(ghPagination.totalPages, p + 1))}
                          disabled={ghPage >= ghPagination.totalPages}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          Next <HiChevronRight className="w-4 h-4 inline ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {activeTab === 'support-tickets' && (
            <Card title="Support Tickets" icon={HiTicket}>
              {tickets.length === 0 ? (
                <p className="text-sm text-gray-500">No support tickets.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Subject</th>
                        <th className="py-2 pr-4">Priority</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t.id} className="border-b border-gray-100">
                          <td className="py-2.5 pr-4 font-mono text-gray-700">{t.id}</td>
                          <td className="py-2.5 pr-4 font-medium">{t.subject}</td>
                          <td className="py-2.5 pr-4"><Badge variant={t.priority === 'high' ? 'error' : 'warning'}>{t.priority}</Badge></td>
                          <td className="py-2.5 pr-4"><Badge variant={t.status === 'closed' ? 'neutral' : 'success'}>{t.status}</Badge></td>
                          <td className="py-2.5 text-gray-500">{formatDateTime(t.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'referral' && (
            <Card title="Referral" icon={HiUserGroup}>
              <Row label="Referral Code" value={user.referralCode || '–'} />
              {referralData && (
                <>
                  <Row label="Referred Count" value={String(referralData.referredCount)} />
                  <Row label="Total Commission (₹)" value={referralData.totalCommission?.toLocaleString()} />
                  {referralData.payouts?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payouts</p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-gray-500">
                            <th className="py-2 pr-4">Amount</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2">Paid At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralData.payouts.map((p, i) => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-2.5 pr-4 font-medium">₹{Number(p.amount).toLocaleString()}</td>
                              <td className="py-2.5 pr-4"><Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status}</Badge></td>
                              <td className="py-2.5 text-gray-500">{p.paidAt || '–'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
