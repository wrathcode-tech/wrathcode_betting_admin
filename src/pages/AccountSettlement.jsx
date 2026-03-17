/**
 * Account Settlement – Sub-admin settlements: Pending, Settled, Rejected tabs
 */
import { useState, useEffect, useRef } from 'react'
import { HiRefresh, HiChevronLeft, HiChevronRight, HiCheck, HiX } from 'react-icons/hi'
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
                            <HiCheck className="w-4 h-4" /> Settle
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(row._id)}
                            disabled={actionLoadingId === row._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            <HiX className="w-4 h-4" /> Reject
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
