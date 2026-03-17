/**
 * Referrals – Teal banner, summary cards, Referrer Leaderboard (GET /api/v1/master/users/referral-stats), Payouts section.
 */
import { useState, useMemo, useEffect } from 'react'
import {
  HiSearch,
  HiUserGroup,
  HiCash,
  HiTrendingUp,
  HiOutlineExternalLink,
  HiCollection,
  HiReceiptTax,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getReferralPayouts } from '../services/api'
import AuthService from '../api/services/AuthService'

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

const LEADERBOARD_LIMIT = 20

export default function Referrals() {
  const [leaderboardUsers, setLeaderboardUsers] = useState([])
  const [leaderboardPagination, setLeaderboardPagination] = useState({ page: 1, limit: LEADERBOARD_LIMIT, total: 0, totalPages: 1 })
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState(null)
  const [leaderboardPage, setLeaderboardPage] = useState(1)
  const [search, setSearch] = useState('')
  const [summary, setSummary] = useState({
    totalReferrersCount: 0,
    totalReferralsCount: 0,
    commissionPaidSum: 0,
    conversionRate: 0,
  })
  const [payouts, setPayouts] = useState([])
  const [payoutTab, setPayoutTab] = useState('all') // all | pending | paid
  const { hasPermission } = useAuth()
  const canManage = hasPermission(PERMISSIONS.MANAGE_REFERRALS)

  useEffect(() => {
    setLeaderboardLoading(true)
    setLeaderboardError(null)
    AuthService.getMasterUsersReferralStats({ page: leaderboardPage, limit: LEADERBOARD_LIMIT })
      .then((res) => {
        if (res?.success && res?.data) {
          setLeaderboardUsers(res.data.users || [])
          setLeaderboardPagination(res.data.pagination || { page: 1, limit: LEADERBOARD_LIMIT, total: 0, totalPages: 1 })
          if (res.data.summary) {
            setSummary({
              totalReferrersCount: res.data.summary.totalReferrersCount ?? 0,
              totalReferralsCount: res.data.summary.totalReferralsCount ?? 0,
              commissionPaidSum: res.data.summary.commissionPaidSum ?? 0,
              conversionRate: res.data.summary.conversionRate ?? 0,
            })
          }
          setLeaderboardError(null)
        } else {
          setLeaderboardUsers([])
          setLeaderboardPagination({ page: 1, limit: LEADERBOARD_LIMIT, total: 0, totalPages: 1 })
          setLeaderboardError(res?.message || 'Failed to load leaderboard')
        }
      })
      .catch(() => {
        setLeaderboardUsers([])
        setLeaderboardPagination({ page: 1, limit: LEADERBOARD_LIMIT, total: 0, totalPages: 1 })
        setLeaderboardError('Failed to load leaderboard')
      })
      .finally(() => setLeaderboardLoading(false))
  }, [leaderboardPage])

  useEffect(() => {
    getReferralPayouts().then((r) => setPayouts(Array.isArray(r.data) ? r.data : []))
  }, [])

  const filteredReferrers = useMemo(() => {
    if (!search.trim()) return leaderboardUsers
    const q = search.trim().toLowerCase()
    return leaderboardUsers.filter(
      (r) =>
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.uuid && r.uuid.toLowerCase().includes(q))
    )
  }, [leaderboardUsers, search])

  const filteredPayouts = useMemo(() => {
    if (payoutTab === 'pending') return payouts.filter((p) => p.status === 'pending')
    if (payoutTab === 'paid') return payouts.filter((p) => p.status === 'paid')
    return payouts
  }, [payouts, payoutTab])

  const pendingCount = useMemo(() => payouts.filter((p) => p.status === 'pending').length, [payouts])
  const paidCount = useMemo(() => payouts.filter((p) => p.status === 'paid').length, [payouts])

  return (
    <div className="space-y-0">
      <PageBanner title="Referrals" subtitle="Referral program — tiers, commission, and referrer leaderboard" icon={HiUserGroup} />

      {/* Summary cards – from API data.summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <HiUserGroup className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Referrers</p>
              <p className="text-lg font-bold text-gray-900">{(summary.totalReferrersCount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HiCollection className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Referrals</p>
              <p className="text-lg font-bold text-gray-900">{(summary.totalReferralsCount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HiCash className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Paid</p>
              <p className="text-lg font-bold text-gray-900">{formatInr(summary.commissionPaidSum)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <HiTrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</p>
              <p className="text-lg font-bold text-gray-900">{Number(summary.conversionRate ?? 0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrer Leaderboard section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiUserGroup className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Referrer Leaderboard</span>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors font-medium"
            >
              <HiOutlineExternalLink className="w-5 h-5" />
              Configure Program
            </button>
          )}
          <span className="text-sm text-gray-500">{leaderboardPagination.total} referrers</span>
        </div>
      </div>

      {/* Search (client-side on current page) */}
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="relative flex-1 max-w-xs">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or UUID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
      </div>

      {leaderboardError && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">{leaderboardError}</div>
      )}

      {/* Referrer Leaderboard table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Referrer</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">UUID</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Total Referrals</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Total Commission</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">Loading…</td>
                </tr>
              ) : filteredReferrers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">No referrers found.</td>
                </tr>
              ) : (
                filteredReferrers.map((r) => (
                  <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-5">
                      <p className="font-medium text-gray-900">{r.fullName || '—'}</p>
                    </td>
                    <td className="py-4 px-5 font-mono text-sm text-gray-600">{r.uuid || '—'}</td>
                    <td className="py-4 px-5 text-right text-gray-700 font-medium">{Number(r.totalReferrals ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5 text-right text-emerald-600 font-semibold">{formatInr(r.totalCommission)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {leaderboardPagination.totalPages > 1 && !leaderboardLoading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(leaderboardPagination.page - 1) * LEADERBOARD_LIMIT + 1}–{Math.min(leaderboardPagination.page * LEADERBOARD_LIMIT, leaderboardPagination.total)} of {leaderboardPagination.total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLeaderboardPage((p) => Math.max(1, p - 1))}
                disabled={leaderboardPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <span className="flex items-center px-2 text-sm text-gray-600">
                {leaderboardPage} / {leaderboardPagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setLeaderboardPage((p) => Math.min(leaderboardPagination.totalPages, p + 1))}
                disabled={leaderboardPage >= leaderboardPagination.totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredReferrers.length === 0 && !leaderboardLoading && (
        <EmptyState
          title="No referrers found"
          message={leaderboardUsers.length === 0 ? 'Referral data will appear here once users start referring.' : 'Try changing search.'}
        />
      )}

      {/* Payouts section */}
      <div className="pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
            <HiReceiptTax className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800">Commission Payouts</span>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setPayoutTab('all')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${payoutTab === 'all' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All ({payouts.length})
            </button>
            <button
              type="button"
              onClick={() => setPayoutTab('pending')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${payoutTab === 'pending' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setPayoutTab('paid')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${payoutTab === 'paid' ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Paid ({paidCount})
            </button>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div className="mt-4 py-10 rounded-2xl bg-gray-50 border border-gray-200 border-dashed text-center">
            <p className="text-gray-500 text-sm">No payout records yet.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Referrer</th>
                    <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Amount</th>
                    <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                    <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Paid at</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 font-medium text-gray-900">{p.referrer}</td>
                      <td className="py-4 px-5 text-emerald-600 font-semibold">{formatInr(p.amount)}</td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                            p.status === 'paid' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-gray-500 text-sm">{p.paidAt || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPayouts.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">No payouts in this tab.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
