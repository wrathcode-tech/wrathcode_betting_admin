/**
 * Account Settlement – Weekly profit (GET /api/v1/master/weekly-profit) + sub-admin settlements: Pending, Settled, Rejected
 */
import { useState, useEffect, useRef } from 'react'
import { HiRefresh, HiChevronLeft, HiChevronRight, HiCheck, HiX, HiChartBar } from 'react-icons/hi'
import { useToast } from '../context/ToastContext'
import AuthService from '../api/services/AuthService'
import Modal from '../components/Modal'

const LIMIT = 20

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'settled', label: 'Settled' },
  { id: 'rejected', label: 'Rejected' },
]

function formatDate(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatAmount(n) {
  if (n == null) return '–'
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getFetchApi(activeTab) {
  if (activeTab === 'settled') return AuthService.getMasterSubAdminSettlementsSettled
  if (activeTab === 'rejected') return AuthService.getMasterSubAdminSettlementsRejected
  return AuthService.getMasterSubAdminSettlementsPending
}

function getEmptyMessage(activeTab) {
  if (activeTab === 'settled') return 'No settled settlements.'
  if (activeTab === 'rejected') return 'No rejected settlements.'
  return 'No pending settlements.'
}

function getStatusVariant(status) {
  if (status === 'settled') return 'bg-emerald-100 text-emerald-800'
  if (status === 'rejected') return 'bg-red-100 text-red-800'
  return 'bg-amber-100 text-amber-800'
}

export default function AccountSettlement() {
  const [activeTab, setActiveTab] = useState('pending')
  const [settlements, setSettlements] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [weeklyProfit, setWeeklyProfit] = useState(null)
  const [weeklyLoading, setWeeklyLoading] = useState(true)
  const [weeklyError, setWeeklyError] = useState(null)
  const { addToast } = useToast()
  const fetchKeyRef = useRef(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectSettlementId, setRejectSettlementId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleSettle = (settlementId) => {
    setActionLoadingId(settlementId)
    AuthService.patchMasterSubAdminSettlementSettle(settlementId)
      .then((res) => {
        if (res?.success) {
          addToast(res?.message || 'Settlement marked as settled', 'success')
          setRefreshTrigger((t) => t + 1)
        } else {
          addToast(res?.message || 'Failed to settle', 'error')
        }
      })
      .catch((err) => {
        addToast(err?.response?.data?.message || err?.message || 'Failed to settle', 'error')
      })
      .finally(() => setActionLoadingId(null))
  }

  const openRejectModal = (settlementId) => {
    setRejectSettlementId(settlementId)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const closeRejectModal = () => {
    setRejectModalOpen(false)
    setRejectSettlementId(null)
    setRejectReason('')
  }

  const handleRejectSubmit = () => {
    if (!rejectSettlementId) return
    setActionLoadingId(rejectSettlementId)
    const body = rejectReason.trim() ? { rejectReason: rejectReason.trim() } : {}
    AuthService.patchMasterSubAdminSettlementReject(rejectSettlementId, body)
      .then((res) => {
        if (res?.success) {
          addToast(res?.message || 'Settlement rejected', 'success')
          closeRejectModal()
          setRefreshTrigger((t) => t + 1)
        } else {
          addToast(res?.message || 'Failed to reject', 'error')
        }
      })
      .catch((err) => {
        addToast(err?.response?.data?.message || err?.message || 'Failed to reject', 'error')
      })
      .finally(() => setActionLoadingId(null))
  }

  useEffect(() => {
    setWeeklyLoading(true)
    setWeeklyError(null)
    AuthService.getMasterWeeklyProfit()
      .then((res) => {
        if (res?.success && res?.data) {
          setWeeklyProfit(res.data)
          setWeeklyError(null)
        } else {
          setWeeklyProfit(null)
          setWeeklyError(res?.message || 'Failed to load weekly profit')
        }
      })
      .catch(() => {
        setWeeklyProfit(null)
        setWeeklyError('Failed to load weekly profit')
      })
      .finally(() => setWeeklyLoading(false))
  }, [refreshTrigger])

  useEffect(() => {
    const key = `${activeTab}-${page}-${refreshTrigger}`
    if (fetchKeyRef.current === key) return
    fetchKeyRef.current = key

    setLoading(true)
    setError(null)
    const api = getFetchApi(activeTab)
    api({ page, limit: LIMIT })
      .then((res) => {
        if (res?.success && res?.data) {
          setSettlements(res.data.settlements || [])
          setPagination(res.data.pagination || { page: 1, limit: LIMIT, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setSettlements([])
          setPagination({ page: 1, limit: LIMIT, total: 0, totalPages: 1 })
          setError(res?.message || `Failed to load ${activeTab} settlements`)
        }
      })
      .catch(() => {
        setSettlements([])
        setPagination({ page: 1, limit: LIMIT, total: 0, totalPages: 1 })
        setError(`Failed to load ${activeTab} settlements`)
      })
      .finally(() => {
        setLoading(false)
        fetchKeyRef.current = null
      })
  }, [page, activeTab, refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((t) => t + 1)
    addToast('List refreshed', 'success')
  }

  const { page: currentPage, total, totalPages } = pagination
  const from = total === 0 ? 0 : (currentPage - 1) * LIMIT + 1
  const to = Math.min(currentPage * LIMIT, total)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Account Settlement</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pending branch account settlements – weekly settlement of commission sharing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Weekly profit – GET /api/v1/master/weekly-profit */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
              <HiChartBar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Weekly profit</h2>
              {weeklyProfit?.weekStartDate && weeklyProfit?.weekEndDate && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDateTime(weeklyProfit.weekStartDate)} – {formatDateTime(weeklyProfit.weekEndDate)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('settled'); setPage(1) }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium hover:bg-emerald-100"
            >
              <HiCheck className="w-4 h-4" /> Settled
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('rejected'); setPage(1) }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm font-medium hover:bg-red-100"
            >
              <HiX className="w-4 h-4" /> Rejected
            </button>
          </div>
        </div>
        <div className="p-5 space-y-6">
          {weeklyLoading ? (
            <p className="text-sm text-gray-500 py-4">Loading weekly profit…</p>
          ) : weeklyError ? (
            <p className="text-sm text-red-600">{weeklyError}</p>
          ) : weeklyProfit ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">Total master profit</p>
                  <p className="text-lg font-semibold text-gray-900 tabular-nums mt-1">₹{formatAmount(weeklyProfit.totalMasterProfit)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">Super admin share</p>
                  <p className="text-lg font-semibold text-amber-700 tabular-nums mt-1">₹{formatAmount(weeklyProfit.superAdminShare)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">Master net (after super admin)</p>
                  <p className="text-lg font-semibold text-teal-700 tabular-nums mt-1">₹{formatAmount(weeklyProfit.masterNetAfterSuperAdmin)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">Super admin commission</p>
                  <p className="text-lg font-semibold text-gray-900 tabular-nums mt-1">
                    {weeklyProfit.superAdminCommissionPercent != null ? `${weeklyProfit.superAdminCommissionPercent}%` : '–'}
                  </p>
                </div>
              </div>

              {weeklyProfit.masterDirectStats && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Master direct</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total deposit</span>
                      <p className="font-medium text-gray-900 tabular-nums">₹{formatAmount(weeklyProfit.masterDirectStats.totalDeposit)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total withdrawal</span>
                      <p className="font-medium text-gray-900 tabular-nums">₹{formatAmount(weeklyProfit.masterDirectStats.totalWithdrawal)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Net amount</span>
                      <p className="font-medium text-emerald-700 tabular-nums">₹{formatAmount(weeklyProfit.masterDirectStats.netAmount)}</p>
                    </div>
                  </div>
                </div>
              )}

              {Array.isArray(weeklyProfit.subAdminBreakdown) && weeklyProfit.subAdminBreakdown.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Sub-admin breakdown</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                          <th className="py-2.5 px-3">Sub-admin ID</th>
                          <th className="py-2.5 px-3 text-right">Deposit</th>
                          <th className="py-2.5 px-3 text-right">Withdrawal</th>
                          <th className="py-2.5 px-3 text-right">Net</th>
                          <th className="py-2.5 px-3 text-right">Master share</th>
                          <th className="py-2.5 px-3 text-right">Sub-admin share</th>
                          <th className="py-2.5 px-3 text-right">Commission %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyProfit.subAdminBreakdown.map((row, idx) => (
                          <tr key={row.subAdminId || idx} className="border-b border-gray-100 hover:bg-gray-50/80">
                            <td className="py-3 px-3 font-mono text-xs text-gray-800 break-all max-w-[200px]">{row.subAdminId || '–'}</td>
                            <td className="py-3 px-3 text-right tabular-nums">₹{formatAmount(row.totalDeposit)}</td>
                            <td className="py-3 px-3 text-right tabular-nums">₹{formatAmount(row.totalWithdrawal)}</td>
                            <td className="py-3 px-3 text-right tabular-nums font-medium">₹{formatAmount(row.netAmount)}</td>
                            <td className="py-3 px-3 text-right tabular-nums text-teal-700">₹{formatAmount(row.masterShare)}</td>
                            <td className="py-3 px-3 text-right tabular-nums">₹{formatAmount(row.subAdminShare)}</td>
                            <td className="py-3 px-3 text-right tabular-nums">{row.commissionSharing != null ? `${row.commissionSharing}%` : '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {Array.isArray(weeklyProfit.dailyStats) && weeklyProfit.dailyStats.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Daily stats</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3 text-right">Deposit</th>
                          <th className="py-2.5 px-3 text-right">Withdrawal</th>
                          <th className="py-2.5 px-3 text-right">Profit</th>
                          <th className="py-2.5 px-3 text-right">Super admin share</th>
                          <th className="py-2.5 px-3">Computed at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyProfit.dailyStats.map((d, idx) => (
                          <tr key={`${d.date}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50/80">
                            <td className="py-3 px-3 text-gray-800">{d.date || '–'}</td>
                            <td className="py-3 px-3 text-right tabular-nums">₹{formatAmount(d.totalDeposit)}</td>
                            <td className="py-3 px-3 text-right tabular-nums">₹{formatAmount(d.totalWithdrawal)}</td>
                            <td className="py-3 px-3 text-right tabular-nums font-medium">₹{formatAmount(d.totalProfit)}</td>
                            <td className="py-3 px-3 text-right tabular-nums">₹{formatAmount(d.superAdminShare)}</td>
                            <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(d.computedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {weeklyProfit.lastSyncedAt && (
                <p className="text-xs text-gray-400">
                  Last synced: {formatDateTime(weeklyProfit.lastSyncedAt)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No weekly profit data.</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-teal-600 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch Id</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deposit</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Withdrawal</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission(%)</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch Profit</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Profit</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated At</th>
                {activeTab === 'pending' && (
                  <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 11 : 10} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 11 : 10} className="py-12 text-center text-gray-500 text-sm">
                    {getEmptyMessage(activeTab)}
                  </td>
                </tr>
              ) : (
                settlements.map((row) => (
                  <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="text-gray-900 font-medium">
                        {row.subAdmin?.fullName || 'Sub Admin'}
                      </span>
                      {row.subAdmin?.branchId && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ({row.subAdmin.branchId})
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5 text-gray-600 text-sm whitespace-nowrap">
                      {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
                    </td>
                    <td className="py-4 px-5 text-right text-gray-700 tabular-nums text-sm">{formatAmount(row.deposit)}</td>
                    <td className="py-4 px-5 text-right text-gray-700 tabular-nums text-sm">{formatAmount(row.withdrawal)}</td>
                    <td className="py-4 px-5 text-right tabular-nums text-sm">
                      <span className={Number(row.profit) >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatAmount(row.profit)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-gray-700 tabular-nums text-sm">{row.commissionSharing != null ? `${row.commissionSharing}%` : '–'}</td>
                    <td className="py-4 px-5 text-right text-teal-600 tabular-nums text-sm font-medium">{formatAmount(row.subAdminProfit)}</td>
                    <td className="py-4 px-5 text-right text-gray-700 tabular-nums text-sm">{formatAmount(row.adminProfit)}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${getStatusVariant(row.status)}`}>
                        {row.status || activeTab}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm whitespace-nowrap">{formatDateTime(row.createdAt)}</td>
                    {activeTab === 'pending' && (
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSettle(row._id)}
                            disabled={actionLoadingId === row._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                          >
                            <HiCheck className="w-4 h-4" /> Settled
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(row._id)}
                            disabled={actionLoadingId === row._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            <HiX className="w-4 h-4" /> Rejected
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {from}–{to} of {total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <span className="flex items-center px-2 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      <Modal
        open={rejectModalOpen}
        onClose={closeRejectModal}
        title="Reject Settlement"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Optionally provide a reason for rejecting this settlement.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reject reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Figures do not match with our records"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/30 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeRejectModal}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={actionLoadingId != null}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {actionLoadingId ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
