/**
 * Dashboard – Fetches GET /api/v1/master/dashboard. Users, Deposits, Withdrawals, Games.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HiUsers,
  HiUserAdd,
  HiArrowDown,
  HiArrowUp,
  HiChartBar,
  HiHashtag,
  HiCollection,
  HiGift,
  HiSupport,
  HiRefresh,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

function formatAmount(n) {
  if (n == null || Number.isNaN(Number(n))) return '–'
  return '₹' + Number(n).toLocaleString('en-IN')
}

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return '–'
  return Number(n).toLocaleString('en-IN')
}

/** Build section cards from GET /api/v1/master/dashboard response */
function buildUsersCards(users) {
  if (!users) return []
  return [
    { label: 'Total Users', value: formatCount(users.total), unit: '', icon: HiUsers, borderColor: 'border-teal-500', iconBg: 'bg-teal-500/10', iconColor: 'text-teal-600' },
    { label: 'New Signups (24h)', value: formatCount(users.newSignup24h), unit: '', icon: HiUserAdd, borderColor: 'border-sky-500', iconBg: 'bg-sky-500/10', iconColor: 'text-sky-600' },
    { label: 'New Signups (30d)', value: formatCount(users.newSignup30d), unit: '', icon: HiUserAdd, borderColor: 'border-emerald-500', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
  ]
}
function buildDepositCards(deposit) {
  if (!deposit) return []
  return [
    { label: 'Total Deposit Volume', value: formatAmount(deposit.totalAmount), unit: '', icon: HiArrowDown, borderColor: 'border-green-500', iconBg: 'bg-green-500/10', iconColor: 'text-green-600' },
    { label: 'Deposits (24h)', value: formatAmount(deposit.totalAmount24h), unit: '', icon: HiArrowDown, borderColor: 'border-cyan-500', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-600' },
    { label: 'Deposits (7d)', value: formatAmount(deposit.totalAmount7d), unit: '', icon: HiArrowDown, borderColor: 'border-indigo-500', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
    { label: 'Deposits (30d)', value: formatAmount(deposit.totalAmount30d), unit: '', icon: HiArrowDown, borderColor: 'border-teal-600', iconBg: 'bg-teal-600/10', iconColor: 'text-teal-700' },
  ]
}
function buildWithdrawalCards(withdrawal) {
  if (!withdrawal) return []
  return [
    { label: 'Total Withdrawal Volume', value: formatAmount(withdrawal.totalAmount), unit: '', icon: HiArrowUp, borderColor: 'border-lime-500', iconBg: 'bg-lime-500/10', iconColor: 'text-lime-600' },
    { label: 'Withdrawals (24h)', value: formatAmount(withdrawal.totalAmount24h), unit: '', icon: HiArrowUp, borderColor: 'border-violet-500', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
    { label: 'Withdrawals (7d)', value: formatAmount(withdrawal.totalAmount7d), unit: '', icon: HiArrowUp, borderColor: 'border-amber-500', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
    { label: 'Withdrawals (30d)', value: formatAmount(withdrawal.totalAmount30d), unit: '', icon: HiArrowUp, borderColor: 'border-orange-500', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-600' },
  ]
}
function buildGamesCards(games) {
  if (!games) return []
  return [
    { label: 'Total Games', value: formatCount(games.total), unit: '', icon: HiCollection, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
    { label: 'Active Games', value: formatCount(games.activeCount), unit: '', icon: HiCollection, borderColor: 'border-emerald-500', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
    { label: 'Inactive Games', value: formatCount(games.inactiveCount), unit: '', icon: HiCollection, borderColor: 'border-gray-400', iconBg: 'bg-gray-400/10', iconColor: 'text-gray-600' },
  ]
}
function buildBetsCards(stats) {
  if (!stats) return []
  return [
    { label: 'Total Bet Amount', value: formatAmount(stats.totalBetAmount), unit: '', icon: HiHashtag, borderColor: 'border-purple-500', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600' },
    { label: 'Bet Amount Today', value: formatAmount(stats.todayBetAmount), unit: '', icon: HiHashtag, borderColor: 'border-fuchsia-500', iconBg: 'bg-fuchsia-500/10', iconColor: 'text-fuchsia-600' },
    { label: 'Bet Amount (7d)', value: formatAmount(stats.betAmount7d), unit: '', icon: HiHashtag, borderColor: 'border-pink-500', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-600' },
    { label: 'Bet Amount (30d)', value: formatAmount(stats.betAmount30d), unit: '', icon: HiHashtag, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
  ]
}
const BONUSES = [
  { label: 'Total Bonus Issued', value: '₹8.5L', unit: '', icon: HiGift, borderColor: 'border-pink-500', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-600' },
  { label: 'Bonus Claimed', value: '₹6.2L', unit: '', icon: HiGift, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
  { label: 'Bonus Pending', value: '₹2.3L', unit: '', icon: HiGift, borderColor: 'border-violet-500', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
]
const SUPPORT = [
  { label: 'Open Tickets', value: '8', unit: '', icon: HiSupport, borderColor: 'border-blue-500', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
  { label: 'Resolved Today', value: '14', unit: '', icon: HiSupport, borderColor: 'border-cyan-500', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-600' },
]

function formatLogDateTime(iso) {
  if (!iso) return '–'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return iso
  }
}

function MetricCard({ label, value, unit, icon: Icon, borderColor, iconBg, iconColor }) {
  return (
    <div className={`homecard bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} p-5 shadow-sm flex items-start justify-between text-left`}>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {value}{unit ? <span className="text-base font-medium text-gray-600 ml-1">{unit}</span> : ''}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}

function Section({ title, cards, loading }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function Dashboard() {
  const { hasPermission, user, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const [adminLogs, setAdminLogs] = useState([])
  const [adminLogsPagination, setAdminLogsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [adminLogsPage, setAdminLogsPage] = useState(1)
  const [adminLogsActivity, setAdminLogsActivity] = useState('')
  const [adminLogsLoading, setAdminLogsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)
  const [betsAmountStats, setBetsAmountStats] = useState(null)
  const [betsAmountStatsLoading, setBetsAmountStatsLoading] = useState(true)

  const canViewUsers = hasPermission(PERMISSIONS.VIEW_USERS)
  const canViewDeposits = hasPermission(PERMISSIONS.VIEW_DEPOSITS)
  const canViewWithdrawals = hasPermission(PERMISSIONS.VIEW_WITHDRAWALS)
  const canViewGames = hasPermission(PERMISSIONS.VIEW_GAMES)
  const canViewBonuses = hasPermission(PERMISSIONS.VIEW_BONUSES)
  const canViewReports = hasPermission(PERMISSIONS.VIEW_REPORTS)
  const canViewTickets = hasPermission(PERMISSIONS.VIEW_TICKETS)

  useEffect(() => {
    setDashboardLoading(true)
    setDashboardError(null)
    AuthService.getMasterDashboard()
      .then((res) => {
        if (res?.success && res?.data) {
          setDashboardData(res.data)
          setDashboardError(null)
        } else {
          setDashboardData(null)
          setDashboardError(res?.message || 'Failed to load dashboard')
        }
      })
      .catch(() => {
        setDashboardData(null)
        setDashboardError('Failed to load dashboard')
      })
      .finally(() => setDashboardLoading(false))
  }, [])

  useEffect(() => {
    setBetsAmountStatsLoading(true)
    AuthService.getMasterBetsAmountStats()
      .then((res) => {
        if (res?.success && res?.data) {
          setBetsAmountStats(res.data)
        } else {
          setBetsAmountStats(null)
        }
      })
      .catch(() => setBetsAmountStats(null))
      .finally(() => setBetsAmountStatsLoading(false))
  }, [])

  const usersCards = buildUsersCards(dashboardData?.users)
  const depositCards = buildDepositCards(dashboardData?.deposit)
  const withdrawalCards = buildWithdrawalCards(dashboardData?.withdrawal)
  const gamesCards = buildGamesCards(dashboardData?.games)
  const betsCards = buildBetsCards(betsAmountStats)

  function fetchAdminLogs(page = 1, activity = '') {
    setAdminLogsLoading(true)
    const params = { page, limit: 20 }
    if (activity) params.activity = activity
    AuthService.getMasterAdminLogs(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setAdminLogs(res.data.logs || [])
          setAdminLogsPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
        } else {
          setAdminLogs([])
          setAdminLogsPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        }
      })
      .catch(() => {
        setAdminLogs([])
        setAdminLogsPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
      })
      .finally(() => setAdminLogsLoading(false))
  }

  useEffect(() => {
    fetchAdminLogs(adminLogsPage, adminLogsActivity)
  }, [adminLogsPage, adminLogsActivity])

  function handleRefreshActivity() {
    fetchAdminLogs(adminLogsPage, adminLogsActivity)
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Dashboard" subtitle="Overview of your casino metrics" showLive={true} icon={HiChartBar} />

      {user?.role === 'sub_admin' && caps.maxGameExposure != null && caps.maxGameExposure > 0 && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-800">
          <span className="font-medium">Your limits:</span> Max game exposure for your assigned users is <strong>₹{Number(caps.maxGameExposure).toLocaleString()}</strong>. You can manage user accounts, personal limits, and wallet adjustments within your scope.
        </div>
      )}

      {dashboardError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {dashboardError}
        </div>
      )}

      {/* USERS & PLAYERS – from GET /api/v1/master/dashboard */}
      {canViewUsers && (
        <Section
          title="Users & Players"
          cards={dashboardLoading ? [] : usersCards}
          loading={dashboardLoading}
        />
      )}

      {/* DEPOSITS */}
      {canViewDeposits && (
        <Section
          title="Deposits"
          cards={dashboardLoading ? [] : depositCards}
          loading={dashboardLoading}
        />
      )}

      {/* WITHDRAWALS */}
      {canViewWithdrawals && (
        <Section
          title="Withdrawals"
          cards={dashboardLoading ? [] : withdrawalCards}
          loading={dashboardLoading}
        />
      )}

      {/* GAMING */}
      {(canViewGames || canViewReports) && (
        <Section
          title="Gaming"
          cards={dashboardLoading ? [] : gamesCards}
          loading={dashboardLoading}
        />
      )}

      {/* BETS – GET /api/v1/master/bets/amount-stats */}
      {(canViewGames || canViewReports) && (
        <Section
          title="Bets"
          cards={betsAmountStatsLoading ? [] : betsCards}
          loading={betsAmountStatsLoading}
        />
      )}

      {/* BONUSES */}
      {canViewBonuses && <Section title="Bonuses" cards={BONUSES} />}

      {/* SUPPORT */}
      {canViewTickets && <Section title="Support" cards={SUPPORT} />}

      {/* Login & Activity – GET /api/v1/master/admin-logs */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Login & Activity</h3>
            <span className="text-sm text-gray-500">Admin login history</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={adminLogsActivity}
              onChange={(e) => { setAdminLogsActivity(e.target.value); setAdminLogsPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
            >
              <option value="">All activity</option>
              <option value="login">Login</option>
            </select>
            <Link to="/audit-logs" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View all logs
            </Link>
            <button
              type="button"
              onClick={handleRefreshActivity}
              disabled={adminLogsLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <HiRefresh className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {adminLogsLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 px-5 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : adminLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-5 text-center text-gray-500 text-sm">
                    No logs found
                  </td>
                </tr>
              ) : (
                adminLogs.map((row, index) => (
                  <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-5 text-sm text-gray-600">
                      {(adminLogsPagination.page - 1) * adminLogsPagination.limit + index + 1}
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-gray-900">{row.activity || '–'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-700">
                      {row.admin?.fullName || row.admin?.email || '–'}
                      {row.admin?.email && row.admin?.fullName && (
                        <span className="block text-gray-500 text-xs">{row.admin.email}</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-600 font-mono">{row.ipAddress || '–'}</td>
                    <td className="py-3 px-5 text-sm text-gray-500">{formatLogDateTime(row.dateTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!adminLogsLoading && adminLogs.length > 0 && adminLogsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {adminLogsPagination.page} of {adminLogsPagination.totalPages} ({adminLogsPagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdminLogsPage((p) => Math.max(1, p - 1))}
                disabled={adminLogsPagination.page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setAdminLogsPage((p) => Math.min(adminLogsPagination.totalPages, p + 1))}
                disabled={adminLogsPagination.page >= adminLogsPagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
