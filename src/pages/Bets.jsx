/**
 * Bets – manage all bets via Master Admin API: dashboard, upline/downline stats, list, settle, cancel.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  HiSearch,
  HiTrendingUp,
  HiTrendingDown,
  HiTicket,
  HiX,
  HiRefresh,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import AuthService from '../api/services/AuthService'

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'settled', label: 'Settled' },
  { id: 'cancelled', label: 'Cancelled' },
]

const ITEMS_PER_PAGE = 20

function formatDateTime(iso) {
  if (!iso) return '–'
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function formatMoney(n, showSign = false) {
  if (n == null) return '–'
  const num = Number(n)
  const s = `₹${Math.abs(num).toLocaleString('en-IN')}`
  if (!showSign) return s
  return num >= 0 ? `+${s}` : `-${s}`
}

function statusBadge(status) {
  if (status === 'open') return <Badge variant="warning">Open</Badge>
  if (status === 'settled') return <Badge variant="success">Settled</Badge>
  if (status === 'cancelled') return <Badge variant="neutral">Cancelled</Badge>
  if (status === 'void' || status === 'cashed_out') return <Badge variant="neutral">{status}</Badge>
  return status ? <Badge variant="neutral">{status}</Badge> : '–'
}

export default function Bets() {
  const [dashboard, setDashboard] = useState(null)
  const [uplineStats, setUplineStats] = useState([])
  const [downlineStats, setDownlineStats] = useState([])
  const [bets, setBets] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(ITEMS_PER_PAGE)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState(null)

  const [statusFilter, setStatusFilter] = useState('all')
  const [marketFilter, setMarketFilter] = useState('')
  const [uplineFilter, setUplineFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')

  const [settleModal, setSettleModal] = useState({ open: false, bet: null, result: null })
  const [cancelConfirm, setCancelConfirm] = useState({ open: false, bet: null })
  const [actionLoading, setActionLoading] = useState(false)
  const { addToast } = useToast()

  const loadDashboardAndStats = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      AuthService.getMasterBetsDashboard(),
      AuthService.getMasterBetsUplineStats(),
      AuthService.getMasterBetsDownlineStats(),
    ])
      .then(([dRes, uRes, downRes]) => {
        if (dRes?.success && dRes?.data) setDashboard(dRes.data)
        else setDashboard(null)
        if (uRes?.success && Array.isArray(uRes?.data)) setUplineStats(uRes.data)
        else setUplineStats([])
        if (downRes?.success && Array.isArray(downRes?.data)) setDownlineStats(downRes.data)
        else setDownlineStats([])
        setError(null)
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const loadBets = useCallback(() => {
    setListLoading(true)
    const params = {
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      market: marketFilter.trim() || undefined,
      upline: uplineFilter.trim() || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      search: search.trim() || undefined,
    }
    AuthService.getMasterBets(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setBets(res.data.bets || [])
          setTotal(res.data.total ?? 0)
        } else {
          setBets([])
          setTotal(0)
        }
      })
      .catch(() => {
        setBets([])
        setTotal(0)
      })
      .finally(() => setListLoading(false))
  }, [page, limit, statusFilter, marketFilter, uplineFilter, fromDate, toDate, search])

  useEffect(() => {
    loadDashboardAndStats()
  }, [loadDashboardAndStats])

  useEffect(() => {
    loadBets()
  }, [loadBets])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, marketFilter, uplineFilter, fromDate, toDate, search])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const openSettleModal = (bet, result) => setSettleModal({ open: true, bet, result })
  const closeSettleModal = () => setSettleModal({ open: false, bet: null, result: null })

  const handleSettle = () => {
    if (!settleModal.bet || !settleModal.result) return
    setActionLoading(true)
    AuthService.postMasterBetSettle(settleModal.bet.betId, { result: settleModal.result })
      .then((res) => {
        if (res?.success) {
          addToast(`Bet settled as ${settleModal.result}`, 'success')
          closeSettleModal()
          loadDashboardAndStats()
          loadBets()
        } else {
          addToast(res?.message || 'Failed to settle bet', 'error')
        }
      })
      .catch(() => addToast('Failed to settle bet', 'error'))
      .finally(() => setActionLoading(false))
  }

  const handleCancel = () => {
    if (!cancelConfirm.bet) return
    setActionLoading(true)
    AuthService.postMasterBetCancel(cancelConfirm.bet.betId)
      .then((res) => {
        if (res?.success) {
          addToast('Bet cancelled and stake refunded', 'success')
          setCancelConfirm({ open: false, bet: null })
          loadDashboardAndStats()
          loadBets()
        } else {
          addToast(res?.message || 'Failed to cancel bet', 'error')
        }
      })
      .catch(() => addToast('Failed to cancel bet', 'error'))
      .finally(() => setActionLoading(false))
  }

  const refreshAll = () => {
    loadDashboardAndStats()
    loadBets()
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Bet Management" subtitle="Downline, upline, P/L, exposure – view and settle bets" icon={HiTicket} />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Exposure</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatMoney(dashboard.totalExposure)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total P/L</p>
            <p className={`mt-1 text-2xl font-bold ${Number(dashboard.totalPL) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatMoney(dashboard.totalPL, true)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Bets</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{dashboard.openBets ?? 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settled</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{dashboard.settledBets ?? 0}</p>
          </div>
        </div>
      )}

      {/* Upline / Downline breakdown */}
      {!loading && (uplineStats.length > 0 || downlineStats.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {uplineStats.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">P/L & Exposure by Upline</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="text-left py-3 px-5 font-medium">Upline</th>
                      <th className="text-right py-3 px-5 font-medium">Exposure</th>
                      <th className="text-right py-3 px-5 font-medium">P/L</th>
                      <th className="text-right py-3 px-5 font-medium">Open</th>
                      <th className="text-right py-3 px-5 font-medium">Settled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uplineStats.map((row, idx) => (
                      <tr key={row.upline ?? idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-5 font-medium text-gray-900">{row.upline ?? '–'}</td>
                        <td className="py-3 px-5 text-right text-amber-600">{formatMoney(row.exposure)}</td>
                        <td className={`py-3 px-5 text-right font-medium ${Number(row.pl) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatMoney(row.pl, true)}
                        </td>
                        <td className="py-3 px-5 text-right text-gray-600">{row.open ?? 0}</td>
                        <td className="py-3 px-5 text-right text-gray-600">{row.settled ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {downlineStats.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">P/L & Exposure by Downline Level</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="text-left py-3 px-5 font-medium">Level</th>
                      <th className="text-right py-3 px-5 font-medium">Exposure</th>
                      <th className="text-right py-3 px-5 font-medium">P/L</th>
                      <th className="text-right py-3 px-5 font-medium">Bets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downlineStats.map((row, idx) => (
                      <tr key={row.level ?? idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-5 font-medium text-gray-900">{row.level ?? '–'}</td>
                        <td className="py-3 px-5 text-right text-amber-600">{formatMoney(row.exposure)}</td>
                        <td className={`py-3 px-5 text-right font-medium ${Number(row.pl) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatMoney(row.pl, true)}
                        </td>
                        <td className="py-3 px-5 text-right text-gray-600">{row.bets ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Bet ID, user, mobile..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
            />
          </div>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setStatusFilter(opt.id); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === opt.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500/50 hover:text-teal-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <input
            type="text"
            value={uplineFilter}
            onChange={(e) => setUplineFilter(e.target.value)}
            placeholder="Upline"
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm w-32 focus:border-teal-500 focus:outline-none"
          />
          <input
            type="text"
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            placeholder="Market"
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm w-40 focus:border-teal-500 focus:outline-none"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading || listLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors disabled:opacity-50"
          >
            <HiRefresh className="w-5 h-5" /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Bet ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">User</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Upline</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Downline</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Bet Type</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Market</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Stake</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Odds</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Potential P/L</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Exposure</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Status</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Settled P/L</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Placed</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : bets.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-gray-500 text-sm">
                    No bets match your filters.
                  </td>
                </tr>
              ) : (
                bets.map((b) => (
                  <tr key={b.betId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 font-mono text-sm text-teal-600">{b._id}</td>
                    <td className="py-4 px-5 text-gray-900">{b.user ?? '–'}</td>
                    <td className="py-4 px-5 text-gray-700">{b.upline ?? '–'}</td>
                    <td className="py-4 px-5">
                      {b.downlineLevel ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {b.downlineLevel}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {b.betType ?? '–'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-700 text-sm max-w-[180px] truncate" title={b.market}>{b.market ?? '–'}</td>
                    <td className="py-4 px-5 text-right font-medium text-gray-900">{formatMoney(b.stake)}</td>
                    <td className="py-4 px-5 text-right text-gray-700">{b.odds ?? '–'}</td>
                    <td className="py-4 px-5 text-right text-gray-700">{formatMoney(b.potentialPL)}</td>
                    <td className="py-4 px-5 text-right font-medium text-amber-600">{formatMoney(b.exposure)}</td>
                    <td className="py-4 px-5">{statusBadge(b.status)}</td>
                    <td className="py-4 px-5 text-right">
                      {b.settledPL != null ? (
                        <span className={Number(b.settledPL) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {formatMoney(b.settledPL, true)}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm">{formatDateTime(b.placedAt)}</td>
                    <td className="py-4 px-5 text-right">
                      {b.status === 'open' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openSettleModal(b, 'win'); }}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Settle as Win"
                          >
                            <HiTrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openSettleModal(b, 'lose'); }}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Settle as Loss"
                          >
                            <HiTrendingDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCancelConfirm({ open: true, bet: b }); }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            title="Cancel bet"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && !listLoading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settle modal */}
      <Modal
        open={settleModal.open}
        onClose={closeSettleModal}
        title={settleModal.result === 'win' ? 'Settle bet as Win' : 'Settle bet as Loss'}
      >
        {settleModal.bet && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bet <strong>{settleModal.bet.betId}</strong> – {settleModal.bet.user} – {settleModal.bet.market}
            </p>
            <p className="text-sm text-gray-600">
              Stake: {formatMoney(settleModal.bet.stake)} · Odds: {settleModal.bet.odds} ·{' '}
              {settleModal.result === 'win' ? `Potential P/L: ${formatMoney(settleModal.bet.potentialPL)}` : 'Stake lost'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeSettleModal} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSettle}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl font-medium text-white ${settleModal.result === 'win' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} disabled:opacity-50`}
              >
                {actionLoading ? 'Settling…' : `Confirm ${settleModal.result === 'win' ? 'Win' : 'Loss'}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={cancelConfirm.open}
        onCancel={() => setCancelConfirm({ open: false, bet: null })}
        onConfirm={handleCancel}
        title="Cancel bet"
        message={cancelConfirm.bet ? `Cancel bet ${cancelConfirm.bet.betId}? Stake will be returned.` : ''}
        confirmLabel="Cancel bet"
        danger
      />
    </div>
  )
}
