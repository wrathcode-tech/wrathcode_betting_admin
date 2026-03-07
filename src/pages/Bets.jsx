/**
 * Bets – manage all bets: downline, upline, P/L, exposure, settle, cancel.
 */
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  HiSearch,
  HiCurrencyDollar,
  HiTrendingUp,
  HiTrendingDown,
  HiTicket,
  HiCheck,
  HiX,
  HiRefresh,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import {
  getBets,
  getBetSummary,
  settleBet as apiSettleBet,
  cancelBet as apiCancelBet,
} from '../services/api'

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'settled', label: 'Settled' },
  { id: 'cancelled', label: 'Cancelled' },
]

function statusMatch(bet, tabId) {
  if (tabId === 'all') return true
  return bet.status === tabId
}

export default function Bets() {
  const [bets, setBets] = useState([])
  const [summary, setSummary] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [uplineFilter, setUplineFilter] = useState('')
  const [marketFilter, setMarketFilter] = useState('')
  const [page, setPage] = useState(1)
  const [settleModal, setSettleModal] = useState({ open: false, bet: null, result: null })
  const [cancelConfirm, setCancelConfirm] = useState({ open: false, bet: null })
  const { addToast } = useToast()
  const { getAssignedUserIds } = useAuth()
  const ITEMS_PER_PAGE = 10

  const loadData = () => {
    getBets().then((r) => {
      let list = r.data || []
      const assignedIds = getAssignedUserIds()
      if (assignedIds?.length > 0) list = list.filter((b) => assignedIds.includes(b.userId))
      setBets(list)
    })
    getBetSummary().then((r) => setSummary(r.data || null))
  }

  useEffect(loadData, [getAssignedUserIds])

  const uplineOptions = useMemo(() => {
    const set = new Set()
    bets.forEach((b) => {
      if (b.uplineName && b.uplineName !== '–') set.add(b.uplineName)
    })
    return ['', ...[...set].sort()]
  }, [bets])

  const marketOptions = useMemo(() => {
    const set = new Set()
    bets.forEach((b) => b.market && set.add(b.market))
    return ['', ...[...set].sort()]
  }, [bets])

  const filtered = useMemo(() => {
    let list = bets.filter((b) => statusMatch(b, statusFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (b) =>
          b.id?.toLowerCase().includes(q) ||
          b.userName?.toLowerCase().includes(q) ||
          b.market?.toLowerCase().includes(q) ||
          b.selection?.toLowerCase().includes(q)
      )
    }
    if (uplineFilter) list = list.filter((b) => b.uplineName === uplineFilter)
    if (marketFilter) list = list.filter((b) => b.market === marketFilter)
    return list
  }, [bets, statusFilter, search, uplineFilter, marketFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = useMemo(
    () => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filtered, page]
  )

  useEffect(() => setPage(1), [statusFilter, search, uplineFilter, marketFilter])

  const formatMoney = (n, showSign = false) => {
    if (n == null) return '–'
    const num = Number(n)
    const s = `₹${Math.abs(num).toLocaleString()}`
    if (!showSign) return s
    return num >= 0 ? `+${s}` : `-${s}`
  }

  const openSettleModal = (bet, result) => setSettleModal({ open: true, bet, result })
  const closeSettleModal = () => setSettleModal({ open: false, bet: null, result: null })

  const handleSettle = () => {
    if (!settleModal.bet) return
    apiSettleBet(settleModal.bet.id, settleModal.result).then((r) => {
      if (r.data?.ok) {
        setBets((prev) =>
          prev.map((b) => (b.id === settleModal.bet.id ? { ...b, status: 'settled', settledPl: r.data.bet.settledPl, settledAt: r.data.bet.settledAt } : b))
        )
        getBetSummary().then((res) => setSummary(res.data || null))
        addToast(`Bet ${settleModal.bet.id} settled as ${settleModal.result}`, 'success')
      } else addToast('Failed to settle bet', 'error')
      closeSettleModal()
    })
  }

  const handleCancel = () => {
    if (!cancelConfirm.bet) return
    apiCancelBet(cancelConfirm.bet.id).then((r) => {
      if (r.data?.ok) {
        setBets((prev) =>
          prev.map((b) => (b.id === cancelConfirm.bet.id ? { ...b, status: 'cancelled', settledPl: 0, settledAt: r.data.bet.settledAt } : b))
        )
        getBetSummary().then((res) => setSummary(res.data || null))
        addToast(`Bet ${cancelConfirm.bet.id} cancelled`, 'success')
      } else addToast('Failed to cancel bet', 'error')
      setCancelConfirm({ open: false, bet: null })
    })
  }

  const statusBadge = (status) => {
    if (status === 'open') return <Badge variant="warning">Open</Badge>
    if (status === 'settled') return <Badge variant="success">Settled</Badge>
    if (status === 'cancelled') return <Badge variant="neutral">Cancelled</Badge>
    return status
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Bet Management" subtitle="Downline, upline, P/L, exposure – view and settle bets" icon={HiTicket} />

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Exposure</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatMoney(summary.totalExposure)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total P/L</p>
            <p className={`mt-1 text-2xl font-bold ${summary.totalPl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatMoney(summary.totalPl, true)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Bets</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{summary.openBetsCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settled</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{summary.settledCount}</p>
          </div>
        </div>
      )}

      {/* Upline / Downline breakdown */}
      {summary?.uplineBreakdown?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  {summary.uplineBreakdown.map((row) => (
                    <tr key={row.uplineId ?? 'direct'} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-5 font-medium text-gray-900">{row.uplineName}</td>
                      <td className="py-3 px-5 text-right text-amber-600">{formatMoney(row.exposure)}</td>
                      <td className={`py-3 px-5 text-right font-medium ${row.pl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatMoney(row.pl, true)}
                      </td>
                      <td className="py-3 px-5 text-right text-gray-600">{row.openCount}</td>
                      <td className="py-3 px-5 text-right text-gray-600">{row.settledCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                  {summary.downlineBreakdown?.map((row) => (
                    <tr key={row.level} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-5 font-medium text-gray-900">{row.label}</td>
                      <td className="py-3 px-5 text-right text-amber-600">{formatMoney(row.exposure)}</td>
                      <td className={`py-3 px-5 text-right font-medium ${row.pl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatMoney(row.pl, true)}
                      </td>
                      <td className="py-3 px-5 text-right text-gray-600">{row.betCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bet ID, user, market..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setStatusFilter(opt.id); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === opt.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-500/50 hover:text-teal-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={uplineFilter}
          onChange={(e) => { setUplineFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Uplines</option>
          {uplineOptions.filter(Boolean).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={marketFilter}
          onChange={(e) => { setMarketFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="">All Markets</option>
          {marketOptions.filter(Boolean).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors"
        >
          <HiRefresh className="w-5 h-5" /> Refresh
        </button>
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-gray-500 text-sm">
                    No bets match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 font-mono text-sm text-teal-600">{b.id}</td>
                    <td className="py-4 px-5">
                      <Link to={`/users/${b.userId}`} className="text-teal-600 hover:underline font-medium">
                        {b.userName}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-gray-700">{b.uplineName || '–'}</td>
                    <td className="py-4 px-5">
                      {b.downlineLevel != null ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          L{b.downlineLevel}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="py-4 px-5 text-gray-700 text-sm max-w-[180px] truncate" title={b.market}>{b.market}</td>
                    <td className="py-4 px-5 text-right font-medium text-gray-900">{formatMoney(b.stake)}</td>
                    <td className="py-4 px-5 text-right text-gray-700">{b.odds}</td>
                    <td className="py-4 px-5 text-right text-gray-700">{formatMoney(b.potentialPayout - b.stake)}</td>
                    <td className="py-4 px-5 text-right font-medium text-amber-600">{formatMoney(b.exposure)}</td>
                    <td className="py-4 px-5">{statusBadge(b.status)}</td>
                    <td className="py-4 px-5 text-right">
                      {b.settledPl != null ? (
                        <span className={b.settledPl >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {formatMoney(b.settledPl, true)}
                        </span>
                      ) : (
                        '–'
                      )}
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm">
                      {b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '–'}
                    </td>
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
                            onClick={(e) => { e.stopPropagation(); openSettleModal(b, 'loss'); }}
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
        title={`Settle bet as ${settleModal.result === 'win' ? 'Win' : 'Loss'}`}
      >
        {settleModal.bet && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bet <strong>{settleModal.bet.id}</strong> – {settleModal.bet.userName} – {settleModal.bet.market} ({settleModal.bet.selection})
            </p>
            <p className="text-sm text-gray-600">
              Stake: {formatMoney(settleModal.bet.stake)} · Odds: {settleModal.bet.odds} ·{' '}
              {settleModal.result === 'win' ? `Payout: ${formatMoney(settleModal.bet.potentialPayout)}` : 'Stake lost'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeSettleModal} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSettle}
                className={`px-4 py-2 rounded-xl font-medium text-white ${settleModal.result === 'win' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Confirm {settleModal.result === 'win' ? 'Win' : 'Loss'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel confirm */}
      <ConfirmDialog
        open={cancelConfirm.open}
        onCancel={() => setCancelConfirm({ open: false, bet: null })}
        onConfirm={handleCancel}
        title="Cancel bet"
        message={cancelConfirm.bet ? `Cancel bet ${cancelConfirm.bet.id}? Stake will be returned.` : ''}
        confirmLabel="Cancel bet"
        danger
      />
    </div>
  )
}
