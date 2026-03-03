/**
 * User Details – full page for PlayAdd/BetFury: green banner, left sub-nav (Profile, Wallet, Gaming, Support & Referral),
 * cards: Basic Info, Account, Security, Login Security, Portfolio (INR). No P2P/crypto/trading.
 */
import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  HiChevronRight,
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
import { getUserById, getUserBets, getDepositsByUser, getWithdrawalsByUser, getTicketsByUser, getReferralByUser } from '../services/api'

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
  const [activeTab, setActiveTab] = useState('user-details')
  const [bets, setBets] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [tickets, setTickets] = useState([])
  const [referralData, setReferralData] = useState(null)
  const { getAssignedUserIds, hasPermission, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const canManagePersonalLimits = hasPermission(PERMISSIONS.EDIT_USERS) || caps.canManagePersonalLimits
  const [personalLimits, setPersonalLimits] = useState({ maxSingleBet: user?.maxSingleBet ?? 10000, dailyLossLimit: user?.dailyLossLimit ?? 50000 })
  const [limitsEditMode, setLimitsEditMode] = useState(false)

  useEffect(() => {
    if (!userId) return
    getUserById(userId).then((r) => setUser(r.data || null))
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
    getUserBets(user.id).then((r) => setBets(r.data || []))
    getDepositsByUser(user.id).then((r) => setDeposits(r.data || []))
    getWithdrawalsByUser(user.id).then((r) => setWithdrawals(r.data || []))
    getTicketsByUser(user.id).then((r) => setTickets(r.data || []))
    getReferralByUser(user.id).then((r) => setReferralData(r.data || null))
  }, [user?.id])

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading user...</p>
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
              </Card>
              <Card title="Account" icon={HiUser}>
                <Row label="UUID" value={user.uuid || user.id} />
                <Row label="Referral" value={user.referralCode} />
                <Row label="Status" value={<span className="text-teal-600 font-semibold">{user.status === 'active' ? 'Active' : user.status}</span>} />
                <Row label="Joined" value={formatDateTime(user.createdAt)} />
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
              <Row label="Main Balance (INR)" value={`₹${(user.balanceFiat ?? 0).toLocaleString()}`} />
              <Row label="Bonus Balance (INR)" value={`₹${(user.bonusBalance ?? 0).toLocaleString()}`} />
              <Row label="Total" value={`₹${totalBalance.toLocaleString()}`} />
            </Card>
          )}

          {activeTab === 'deposit-withdrawal' && (
            <div className="space-y-4">
              <Card title="Deposits" icon={HiCreditCard}>
                {deposits.length === 0 ? (
                  <p className="text-sm text-gray-500">No deposits yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500">
                          <th className="py-2 pr-4">ID</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Method</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deposits.map((d) => (
                          <tr key={d.id} className="border-b border-gray-100">
                            <td className="py-2.5 pr-4 font-mono text-gray-700">{d.id}</td>
                            <td className="py-2.5 pr-4 font-medium">₹{Number(d.amount).toLocaleString()}</td>
                            <td className="py-2.5 pr-4">{d.method}</td>
                            <td className="py-2.5 pr-4"><Badge variant={d.status === 'completed' ? 'success' : 'warning'}>{d.status}</Badge></td>
                            <td className="py-2.5 text-gray-500">{formatDateTime(d.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
              <Card title="Withdrawals" icon={HiCash}>
                {withdrawals.length === 0 ? (
                  <p className="text-sm text-gray-500">No withdrawals yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500">
                          <th className="py-2 pr-4">ID</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Method</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w) => (
                          <tr key={w.id} className="border-b border-gray-100">
                            <td className="py-2.5 pr-4 font-mono text-gray-700">{w.id}</td>
                            <td className="py-2.5 pr-4 font-medium">₹{Number(w.amount).toLocaleString()}</td>
                            <td className="py-2.5 pr-4">{w.method}</td>
                            <td className="py-2.5 pr-4"><Badge variant={w.status === 'completed' || w.status === 'approved' ? 'success' : 'warning'}>{w.status}</Badge></td>
                            <td className="py-2.5 text-gray-500">{formatDateTime(w.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'game-history' && (
            <Card title="Game History" icon={HiCollection}>
              <ul className="space-y-2">
                {bets.length === 0 ? (
                  <li className="text-sm text-gray-500">No bets yet.</li>
                ) : (
                  bets.map((b) => (
                    <li key={b.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-900">{b.game}</span>
                      <span className={b.result === 'win' ? 'text-teal-600 font-medium' : 'text-gray-500'}>
                        {b.result} ₹{(b.payout || 0).toLocaleString()}
                      </span>
                    </li>
                  ))
                )}
              </ul>
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
