/**
 * Referrals – Teal banner, summary cards, Referrer Leaderboard table, Payouts section.
 * Data from getReferrers(), getReferralStats(), getReferralPayouts(). UI consistent with Games/Bonuses.
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
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getReferrers, getReferralStats, getReferralPayouts } from '../services/api'

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

const TIER_STYLES = {
  Platinum: 'bg-violet-100 text-violet-700',
  Gold: 'bg-amber-100 text-amber-700',
  Silver: 'bg-gray-200 text-gray-700',
  Bronze: 'bg-amber-700/20 text-amber-800',
}

export default function Referrals() {
  const [referrers, setReferrers] = useState([])
  const [stats, setStats] = useState({ totalReferrers: 0, totalReferrals: 0, commissionPaid: 0, conversionRate: 0 })
  const [payouts, setPayouts] = useState([])
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('All')
  const [payoutTab, setPayoutTab] = useState('all') // all | pending | paid
  const { hasPermission } = useAuth()
  const canManage = hasPermission(PERMISSIONS.MANAGE_REFERRALS)

  useEffect(() => {
    getReferrers().then((r) => setReferrers(Array.isArray(r.data) ? r.data : []))
    getReferralStats().then((r) => setStats(r.data || { totalReferrers: 0, totalReferrals: 0, commissionPaid: 0, conversionRate: 0 }))
    getReferralPayouts().then((r) => setPayouts(Array.isArray(r.data) ? r.data : []))
  }, [])

  const filteredReferrers = useMemo(() => {
    return referrers.filter((r) => {
      const matchSearch =
        !search.trim() ||
        (r.referrerName && r.referrerName.toLowerCase().includes(search.toLowerCase())) ||
        (r.referrerEmail && r.referrerEmail.toLowerCase().includes(search.toLowerCase()))
      const matchTier = tierFilter === 'All' || r.tier === tierFilter
      return matchSearch && matchTier
    })
  }, [referrers, search, tierFilter])

  const filteredPayouts = useMemo(() => {
    if (payoutTab === 'pending') return payouts.filter((p) => p.status === 'pending')
    if (payoutTab === 'paid') return payouts.filter((p) => p.status === 'paid')
    return payouts
  }, [payouts, payoutTab])

  const pendingCount = useMemo(() => payouts.filter((p) => p.status === 'pending').length, [payouts])
  const paidCount = useMemo(() => payouts.filter((p) => p.status === 'paid').length, [payouts])

  return (
    <div className="space-y-0">
      <PageBanner title="Referrals" subtitle="Referral program — tiers, commission, and referrer leaderboard – PlayAdd / BetFury" icon={HiUserGroup} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <HiUserGroup className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Referrers</p>
              <p className="text-lg font-bold text-gray-900">{(stats.totalReferrers || 0).toLocaleString('en-IN')}</p>
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
              <p className="text-lg font-bold text-gray-900">{(stats.totalReferrals || 0).toLocaleString('en-IN')}</p>
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
              <p className="text-lg font-bold text-gray-900">{formatInr(stats.commissionPaid)}</p>
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
              <p className="text-lg font-bold text-gray-900">{Number(stats.conversionRate || 0)}%</p>
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
          <span className="text-sm text-gray-500">{filteredReferrers.length} referrers</span>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="All">All tiers</option>
          <option value="Platinum">Platinum</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>

      {/* Referrers table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Referrer</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Referrals</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Commission</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Tier</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrers.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5">
                    <p className="font-medium text-gray-900">{r.referrerName}</p>
                    <p className="text-gray-500 text-sm">{r.referrerEmail}</p>
                  </td>
                  <td className="py-4 px-5 text-gray-700 font-medium">{r.referrals}</td>
                  <td className="py-4 px-5 text-emerald-600 font-semibold">{formatInr(r.commission)}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${TIER_STYLES[r.tier] || 'bg-gray-100 text-gray-700'}`}>
                      {r.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReferrers.length === 0 && (
        <EmptyState
          title="No referrers found"
          message={referrers.length === 0 ? 'Referral data will appear here once users start referring.' : 'Try changing search or tier filter.'}
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
