/**
 * Withdrawals – withdrawal requests from API. Tabs: All, Pending, Approved, Rejected.
 * GET /api/v1/master/withdrawal-requests (all), .../pending, .../approved, .../rejected
 */
import React, { useState, useEffect } from 'react'
import { HiSearch, HiDownload, HiCheck, HiX, HiArrowUp, HiChevronLeft, HiChevronRight, HiEye, HiUser, HiCreditCard } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

function formatDateTime(iso) {
  if (!iso) return '–'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return iso
  }
}

function userLabel(w) {
  const u = w.userId
  if (!u) return '–'
  const name = u.fullName || u.mobile || u.email
  const extra = [u.mobile, u.email].filter(Boolean).join(' • ')
  return extra ? `${name} (${extra})` : name
}

/** User-facing UUID for list/export (nested userId.uuid or top-level uuid) – not Mongo _id */
function getUserDisplayUuid(w) {
  const u = w?.userId
  if (u && typeof u === 'object' && u.uuid != null && u.uuid !== '') return String(u.uuid)
  if (w?.uuid != null && w.uuid !== '') return String(w.uuid)
  return ''
}

/** User ID string for API (withdrawal.userId may be object with _id or string) */
function getWithdrawalUserId(w) {
  const u = w?.userId
  if (!u) return null
  return typeof u === 'string' ? u : u._id
}

/** Short summary of withdrawalToDetail (bank/UPI etc.) */
function withdrawalToSummary(detail) {
  if (!detail || typeof detail !== 'object') return '–'
  const parts = []
  if (detail.accountNumber) parts.push(`A/C ${detail.accountNumber}`)
  if (detail.ifsc) parts.push(detail.ifsc)
  if (detail.upiId) parts.push(detail.upiId)
  if (detail.bankName) parts.push(detail.bankName)
  if (parts.length) return parts.join(' • ')
  return Object.keys(detail).length ? '–' : '–'
}

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [viewDetailWithdrawal, setViewDetailWithdrawal] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canApprove = hasPermission(PERMISSIONS.APPROVE_WITHDRAWALS)

  const fetchWithdrawals = () => {
    setLoading(true)
    setError(null)
    const params = { page, limit }
    const promise =
      activeTab === 'all'
        ? AuthService.getMasterWithdrawalRequests(params)
        : activeTab === 'pending'
          ? AuthService.getMasterWithdrawalRequestsPending(params)
          : activeTab === 'approved'
            ? AuthService.getMasterWithdrawalRequestsApproved(params)
            : AuthService.getMasterWithdrawalRequestsRejected(params)
    promise
      .then((res) => {
        if (res?.success && res?.data) {
          setWithdrawals(res.data.withdrawals || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setWithdrawals([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load withdrawals')
        }
      })
      .catch(() => {
        setWithdrawals([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load withdrawals')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [activeTab, page, limit])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  const filtered = search.trim()
    ? withdrawals.filter(
        (w) =>
          (w.uuid && String(w.uuid).toLowerCase().includes(search.toLowerCase())) ||
          (w.userId?.uuid && String(w.userId.uuid).toLowerCase().includes(search.toLowerCase())) ||
          (w._id && String(w._id).toLowerCase().includes(search.toLowerCase())) ||
          (w.userId?.mobile && String(w.userId.mobile).includes(search)) ||
          (w.userId?.fullName && w.userId.fullName.toLowerCase().includes(search.toLowerCase())) ||
          (w.userId?.email && w.userId.email.toLowerCase().includes(search.toLowerCase())) ||
          (w.amount != null && String(w.amount).includes(search))
      )
    : withdrawals

  const badgeVariant = (status) => {
    if (status === 'approved' || status === 'completed') return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'rejected') return 'error'
    return 'neutral'
  }

  const statusLabel = (status) => {
    if (status === 'completed') return 'Approved'
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : status
  }

  const formatAmount = (w) => (w.amount != null ? `₹${Number(w.amount).toLocaleString('en-IN')}` : '–')

  const handleApprove = (row) => {
    const userId = getWithdrawalUserId(row)
    if (!userId) {
      addToast('User ID not found for this withdrawal', 'error')
      return
    }
    setActionLoading(true)
    AuthService.patchMasterWithdrawalRequest(row._id, { status: 'approved', userId })
      .then((res) => {
        if (res?.success) {
          addToast(res.message || 'Withdrawal approved', 'success')
          fetchWithdrawals()
        } else {
          addToast(res?.message || 'Failed to approve withdrawal', 'error')
        }
      })
      .catch(() => addToast('Failed to approve withdrawal', 'error'))
      .finally(() => setActionLoading(false))
  }

  const handleRejectClick = (row) => {
    setSelectedWithdrawal(row)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleRejectClose = () => {
    if (!actionLoading) {
      setShowRejectModal(false)
      setSelectedWithdrawal(null)
      setRejectReason('')
    }
  }

  const handleRejectConfirm = () => {
    if (!selectedWithdrawal) return
    const userId = getWithdrawalUserId(selectedWithdrawal)
    if (!userId) {
      addToast('User ID not found for this withdrawal', 'error')
      return
    }
    const reason = (rejectReason || 'Rejected by Admin').trim().slice(0, 500)
    setActionLoading(true)
    AuthService.patchMasterWithdrawalRequest(selectedWithdrawal._id, {
      status: 'rejected',
      userId,
      rejectReason: reason,
      adminRemarks: reason,
    })
      .then((res) => {
        if (res?.success) {
          addToast(res.message || 'Withdrawal rejected', 'success')
          handleRejectClose()
          fetchWithdrawals()
        } else {
          addToast(res?.message || 'Failed to reject withdrawal', 'error')
        }
      })
      .catch(() => addToast('Failed to reject withdrawal', 'error'))
      .finally(() => setActionLoading(false))
  }

  const handleDownloadCSV = () => {
    if (!filtered.length) {
      addToast('No data to export', 'error')
      return
    }
    const headers = ['User ID', 'User', 'Amount', 'Status', 'Withdrawal To', 'Processed', 'Created']
    const rows = filtered.map((w) =>
      [
        getUserDisplayUuid(w) || '–',
        userLabel(w),
        w.amount,
        statusLabel(w.status),
        withdrawalToSummary(w.withdrawalToDetail),
        w.processedAt ? formatDateTime(w.processedAt) : '',
        w.createdAt ? formatDateTime(w.createdAt) : '',
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `withdrawals_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    addToast('CSV downloaded', 'success')
  }

  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const colCount = 7 + ((activeTab === 'all' || activeTab === 'pending') && canApprove ? 1 : 0) + (activeTab === 'rejected' ? 1 : 0)

  return (
    <div className="space-y-6">
      <PageBanner title="Withdrawals" subtitle="View and manage withdrawal requests" icon={HiArrowUp} />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors"
        >
          <HiDownload className="w-5 h-5" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500 -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-teal-200/60 text-teal-800">{pagination.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search & limit */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, user, amount..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Amount</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Withdrawal To</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Processed</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Created</th>
                {(activeTab === 'all' || activeTab === 'pending') && canApprove && (
                  <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>
                )}
                {activeTab === 'rejected' && (
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Admin Remarks</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-red-600 text-sm">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="py-12 text-center text-gray-500 text-sm">
                    No withdrawals in this list.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const userUuid = getUserDisplayUuid(w)
                  return (
                  <tr key={w._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-5 text-teal-600 font-mono text-sm truncate max-w-[120px]" title={userUuid || undefined}>
                      {userUuid || '–'}
                    </td>
                    <td className="py-4 px-5 text-gray-900 font-medium">{userLabel(w)}</td>
                    <td className="py-4 px-5 font-medium text-gray-900">{formatAmount(w)}</td>
                    <td className="py-4 px-5">
                      <Badge variant={badgeVariant(w.status)}>{statusLabel(w.status)}</Badge>
                    </td>
                    <td className="py-4 px-5 text-gray-600 text-sm">
                      <div className="flex items-center gap-2">
                        {/* <span className="truncate max-w-[140px]" title={withdrawalToSummary(w.withdrawalToDetail)}>
                          {withdrawalToSummary(w.withdrawalToDetail)}
                        </span> */}
                        <button
                          type="button"
                          onClick={() => setViewDetailWithdrawal(w)}
                          className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100"
                          title="View bank & user details"
                        >
                          <HiEye className="w-4 h-4" /> View
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm">
                      {w.processedAt ? formatDateTime(w.processedAt) : '–'}
                      {w.processedBy && (
                        <span className="block text-xs text-gray-400">{typeof w.processedBy === 'object' ? w.processedBy.fullName || w.processedBy.email : w.processedBy}</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm">{formatDateTime(w.createdAt)}</td>
                    {(activeTab === 'all' || activeTab === 'pending') && canApprove && (
                      <td className="py-4 px-5 text-right">
                        {w.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(w)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <HiCheck className="w-4 h-4" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectClick(w)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                            >
                              <HiX className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">–</span>
                        )}
                      </td>
                    )}
                    {activeTab === 'rejected' && (
                      <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate" title={w.adminRemarks || ''}>
                        {w.adminRemarks || '–'}
                      </td>
                    )}
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1"
              >
                <HiChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1"
              >
                Next <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View bank & user details modal – premium */}
      <Modal open={!!viewDetailWithdrawal} onClose={() => setViewDetailWithdrawal(null)} title="Withdrawal details" size="lg" scrollable>
        {viewDetailWithdrawal && (
          <div className="space-y-6">
            {/* Summary strip */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50/50 to-teal-50 border border-teal-100">
              <div>
                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Amount</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{formatAmount(viewDetailWithdrawal)}</p>
              </div>
              <div className="h-8 w-px bg-teal-200 hidden sm:block" />
              <div>
                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Status</p>
                <p className="mt-0.5">
                  <Badge variant={badgeVariant(viewDetailWithdrawal.status)}>{statusLabel(viewDetailWithdrawal.status)}</Badge>
                </p>
              </div>
              <div className="h-8 w-px bg-teal-200 hidden sm:block" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Withdrawal ID</p>
                <p className="text-sm font-mono text-gray-700 truncate mt-0.5" title={viewDetailWithdrawal.transactionId ?? viewDetailWithdrawal._id}>{viewDetailWithdrawal.transactionId ?? viewDetailWithdrawal._id ?? '–'}</p>
              </div>
            </div>

            {/* User section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                  <HiUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">User details</h3>
                  <p className="text-xs text-gray-500">Applicant information</p>
                </div>
              </div>
              <div className="p-4">
                {viewDetailWithdrawal.userId ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {viewDetailWithdrawal.userId.fullName != null && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Full name</dt>
                        <dd className="text-gray-900 font-medium">{viewDetailWithdrawal.userId.fullName}</dd>
                      </div>
                    )}
                    {viewDetailWithdrawal.userId.mobile != null && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Mobile</dt>
                        <dd className="text-gray-900">{viewDetailWithdrawal.userId.mobile}</dd>
                      </div>
                    )}
                    {viewDetailWithdrawal.userId.email != null && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Email</dt>
                        <dd className="text-gray-900 break-all">{viewDetailWithdrawal.userId.email}</dd>
                      </div>
                    )}
                    {getUserDisplayUuid(viewDetailWithdrawal) && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">User ID</dt>
                        <dd className="text-gray-900 font-mono text-xs break-all mt-0.5 p-2 rounded-lg bg-white border border-gray-100">{getUserDisplayUuid(viewDetailWithdrawal)}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-gray-500 text-sm py-2">No user details available.</p>
                )}
              </div>
            </div>

            {/* Bank / withdrawal to section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <HiCreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Bank & payout details</h3>
                  <p className="text-xs text-gray-500">Withdrawal destination</p>
                </div>
              </div>
              <div className="p-4">
                {viewDetailWithdrawal.withdrawalToDetail && typeof viewDetailWithdrawal.withdrawalToDetail === 'object' ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {Object.entries(viewDetailWithdrawal.withdrawalToDetail).map(([key, value]) => {
                      const keyNorm = key.toLowerCase().replace(/_/g, '')
                      if (keyNorm === 'accountid' || keyNorm === 'isdefaultforwithdrawal') return null
                      if (value == null || (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)) return null
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
                      const display = typeof value === 'object' && value !== null && !(value instanceof Date)
                        ? JSON.stringify(value)
                        : String(value)
                      return (
                        <div key={key}>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">{label}</dt>
                          <dd className="text-gray-900 break-all">{display}</dd>
                        </div>
                      )
                    })}
                  </dl>
                ) : (
                  <p className="text-gray-500 text-sm py-2">No bank details available.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDetailWithdrawal(null)}
                className="px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showRejectModal} onClose={handleRejectClose} title="Reject Withdrawal">
        {selectedWithdrawal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reject withdrawal <strong>{selectedWithdrawal._id}</strong> – {userLabel(selectedWithdrawal)} – {formatAmount(selectedWithdrawal)}?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Insufficient verification"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={handleRejectClose} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleRejectConfirm} disabled={actionLoading} className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
