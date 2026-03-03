/**
 * Dashboard – PlayAdd / BetFury style (casino). Users, Bets, Revenue (GGR),
 * Deposits/Withdrawals INR, Gaming, Bonuses, Support, Login & Activity.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiUsers,
  HiUserAdd,
  HiArrowDown,
  HiArrowUp,
  HiChartBar,
  HiHashtag,
  HiCollection,
  HiCash,
  HiGift,
  HiSupport,
  HiRefresh,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'

// PlayAdd / BetFury style – professional metric labels
const USERS_PLAYERS = [
  { label: 'Total Users', value: '2,847', unit: '', icon: HiUsers, borderColor: 'border-teal-500', iconBg: 'bg-teal-500/10', iconColor: 'text-teal-600' },
  { label: 'New Signups (24h)', value: '28', unit: '', icon: HiUserAdd, borderColor: 'border-sky-500', iconBg: 'bg-sky-500/10', iconColor: 'text-sky-600' },
  { label: 'New Signups (30d)', value: '412', unit: '', icon: HiUserAdd, borderColor: 'border-emerald-500', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
  { label: 'Rejected Users', value: '23', unit: '', icon: HiUsers, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
]
const DEPOSITS = [
  { label: 'Total Deposit Volume', value: '₹18.2L', unit: '', icon: HiArrowDown, borderColor: 'border-green-500', iconBg: 'bg-green-500/10', iconColor: 'text-green-600' },
  { label: 'Deposits Today', value: '₹1,24,500', unit: '', icon: HiArrowDown, borderColor: 'border-emerald-600', iconBg: 'bg-emerald-600/10', iconColor: 'text-emerald-700' },
  { label: 'Deposits (24h)', value: '₹1,18,200', unit: '', icon: HiArrowDown, borderColor: 'border-cyan-500', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-600' },
  { label: 'Deposits (7d)', value: '₹4.2L', unit: '', icon: HiArrowDown, borderColor: 'border-indigo-500', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
  { label: 'Deposits (30d)', value: '₹18.2L', unit: '', icon: HiArrowDown, borderColor: 'border-teal-600', iconBg: 'bg-teal-600/10', iconColor: 'text-teal-700' },
]
const WITHDRAWALS = [
  { label: 'Total Withdrawal Volume', value: '₹12.4L', unit: '', icon: HiArrowUp, borderColor: 'border-lime-500', iconBg: 'bg-lime-500/10', iconColor: 'text-lime-600' },
  { label: 'Withdrawals Today', value: '₹89,200', unit: '', icon: HiArrowUp, borderColor: 'border-teal-600', iconBg: 'bg-teal-600/10', iconColor: 'text-teal-700' },
  { label: 'Withdrawals (24h)', value: '₹82,100', unit: '', icon: HiArrowUp, borderColor: 'border-violet-500', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
  { label: 'Withdrawals (7d)', value: '₹3.1L', unit: '', icon: HiArrowUp, borderColor: 'border-amber-500', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
  { label: 'Withdrawals (30d)', value: '₹12.4L', unit: '', icon: HiArrowUp, borderColor: 'border-orange-500', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-600' },
]
const GAMING = [
  { label: 'Total Games', value: '156', unit: '', icon: HiCollection, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
  { label: 'Active Games', value: '142', unit: '', icon: HiCollection, borderColor: 'border-emerald-500', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
  { label: 'Inactive Games', value: '14', unit: '', icon: HiCollection, borderColor: 'border-gray-400', iconBg: 'bg-gray-400/10', iconColor: 'text-gray-600' },
]
const BETS = [
  { label: 'Total Bets', value: '1,24,892', unit: '', icon: HiHashtag, borderColor: 'border-purple-500', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600' },
  { label: 'Bets Today', value: '8,421', unit: '', icon: HiHashtag, borderColor: 'border-fuchsia-500', iconBg: 'bg-fuchsia-500/10', iconColor: 'text-fuchsia-600' },
  { label: 'Bets (7d)', value: '42,156', unit: '', icon: HiHashtag, borderColor: 'border-pink-500', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-600' },
  { label: 'Bets (30d)', value: '1,18,420', unit: '', icon: HiHashtag, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
]
const BONUSES = [
  { label: 'Total Bonus Issued', value: '₹8.5L', unit: '', icon: HiGift, borderColor: 'border-pink-500', iconBg: 'bg-pink-500/10', iconColor: 'text-pink-600' },
  { label: 'Bonus Claimed', value: '₹6.2L', unit: '', icon: HiGift, borderColor: 'border-rose-500', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
  { label: 'Bonus Pending', value: '₹2.3L', unit: '', icon: HiGift, borderColor: 'border-violet-500', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-600' },
]
const SUPPORT = [
  { label: 'Open Tickets', value: '8', unit: '', icon: HiSupport, borderColor: 'border-blue-500', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
  { label: 'Resolved Today', value: '14', unit: '', icon: HiSupport, borderColor: 'border-cyan-500', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-600' },
]

const LOGIN_ACTIVITY = [
  { id: 1, activity: 'LOGIN_SUCCESS', activityType: 'success', ip: '192.168.1.1', dateTime: '2026-02-20 14:32:15' },
  { id: 2, activity: 'LOGIN_OTP_SENT', activityType: 'teal', ip: '192.168.1.1', dateTime: '2026-02-20 14:30:02' },
  { id: 3, activity: 'LOGIN_SUCCESS', activityType: 'success', ip: '10.0.0.5', dateTime: '2026-02-20 13:15:44' },
  { id: 4, activity: 'LOGIN_SUCCESS', activityType: 'success', ip: '192.168.1.1', dateTime: '2026-02-20 11:00:22' },
  { id: 5, activity: 'LOGIN_SUCCESS', activityType: 'success', ip: '10.0.0.5', dateTime: '2026-02-20 09:45:11' },
]

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

function Section({ title, cards }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const { hasPermission, user, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const [activityLogs, setActivityLogs] = useState(LOGIN_ACTIVITY)

  const canViewUsers = hasPermission(PERMISSIONS.VIEW_USERS)
  const canViewDeposits = hasPermission(PERMISSIONS.VIEW_DEPOSITS)
  const canViewWithdrawals = hasPermission(PERMISSIONS.VIEW_WITHDRAWALS)
  const canViewGames = hasPermission(PERMISSIONS.VIEW_GAMES)
  const canViewBonuses = hasPermission(PERMISSIONS.VIEW_BONUSES)
  const canViewReports = hasPermission(PERMISSIONS.VIEW_REPORTS)
  const canViewTickets = hasPermission(PERMISSIONS.VIEW_TICKETS)

  function handleRefreshActivity() {
    setActivityLogs((prev) => [...prev].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Dashboard" subtitle="Overview of your casino metrics" showLive={true} icon={HiChartBar} />

      {user?.role === 'sub_admin' && caps.maxGameExposure != null && caps.maxGameExposure > 0 && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-800">
          <span className="font-medium">Your limits:</span> Max game exposure for your assigned users is <strong>₹{Number(caps.maxGameExposure).toLocaleString()}</strong>. You can manage user accounts, personal limits, and wallet adjustments within your scope.
        </div>
      )}

      {/* USERS & PLAYERS */}
      {canViewUsers && <Section title="Users & Players" cards={USERS_PLAYERS} />}

      {/* DEPOSITS */}
      {canViewDeposits && <Section title="Deposits" cards={DEPOSITS} />}

      {/* WITHDRAWALS */}
      {canViewWithdrawals && <Section title="Withdrawals" cards={WITHDRAWALS} />}

      {/* GAMING */}
      {(canViewGames || canViewReports) && <Section title="Gaming" cards={GAMING} />}

      {/* BETS */}
      {(canViewGames || canViewReports) && <Section title="Bets" cards={BETS} />}

      {/* BONUSES */}
      {canViewBonuses && <Section title="Bonuses" cards={BONUSES} />}

      {/* SUPPORT */}
      {canViewTickets && <Section title="Support" cards={SUPPORT} />}

      {/* Login & Activity table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Login & Activity</h3>
            <span className="text-sm text-gray-500">Recent admin login history</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/audit-logs" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View all logs
            </Link>
            <button
              type="button"
              onClick={handleRefreshActivity}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <HiRefresh className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-5 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-3 px-5">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.activityType === 'success' ? 'bg-emerald-500' : 'bg-teal-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900">{row.activity}</span>
                    </span>
                  </td>
                  <td className="py-3 px-5 text-sm text-gray-600 font-mono">{row.ip}</td>
                  <td className="py-3 px-5 text-sm text-gray-500">{row.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
