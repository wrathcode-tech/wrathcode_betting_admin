/**
 * Deposits – deposit requests from API. Tabs: All, Pending, Approved, Rejected.
 * GET /api/v1/master/deposit-requests (all), .../pending, .../approved, .../rejected
 */
import { useState, useEffect } from 'react'
import { HiSearch, HiDownload, HiCheck, HiX, HiArrowDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import AuthService from '../api/services/AuthService'
import { ApiConfig } from '../api/apiConfig/apiConfig'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

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

function userLabel(deposit) {
  const u = deposit.userId
  if (!u) return '–'
  const name = u.fullName || u.mobile || u.email
  const extra = [u.mobile, u.email].filter(Boolean).join(' • ')
  return extra ? `${name} (${extra})` : name
}

/** User ID string for API (deposit.userId may be object with _id or string) */
function getDepositUserId(deposit) {
  const u = deposit?.userId
  if (!u) return null
  return typeof u === 'string' ? u : u._id
}

function getPaymentProofUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${ApiConfig.baseUrl}${normalizedPath}`
}

export default function Deposits() {
  const [deposits, setDeposits] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [proofPreviewUrl, setProofPreviewUrl] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { addToast } = useToast()

  const fetchDeposits = () => {
    setLoading(true)
    setError(null)
    const params = { page, limit }
    const promise =
      activeTab === 'all'
        ? AuthService.getMasterDepositRequests(params)
        : activeTab === 'pending'
          ? AuthService.getMasterDepositRequestsPending(params)
          : activeTab === 'approved'
            ? AuthService.getMasterDepositRequestsApproved(params)
            : AuthService.getMasterDepositRequestsRejected(params)
    promise
      .then((res) => {
        if (res?.success && res?.data) {
          setDeposits(res.data.deposits || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setDeposits([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load deposits')
        }
      })
      .catch(() => {
        setDeposits([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load deposits')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDeposits()
  }, [activeTab, page, limit])

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  const filtered = search.trim()
    ? deposits.filter(
      (d) =>
        (d.utrNumber && String(d.utrNumber).toLowerCase().includes(search.toLowerCase())) ||
        (d._id && String(d._id).toLowerCase().includes(search.toLowerCase())) ||
        (d.userId?.mobile && d.userId.mobile.includes(search)) ||
        (d.userId?.fullName && d.userId.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (d.userId?.email && d.userId.email.toLowerCase().includes(search.toLowerCase()))
    )
    : deposits

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

  const handleApprove = (row) => {
    const userId = getDepositUserId(row)
    if (!userId) {
      addToast('User ID not found for this deposit', 'error')
      return
    }
    setActionLoading(true)
    AuthService.patchMasterDepositRequest(row._id, { status: 'approved', userId })
      .then((res) => {
        if (res?.success) {
          addToast(res.message || 'Deposit approved', 'success')
          fetchDeposits()
        } else {
          addToast(res?.message || 'Failed to approve deposit', 'error')
        }
      })
      .catch(() => addToast('Failed to approve deposit', 'error'))
      .finally(() => setActionLoading(false))
  }

  const handleRejectClick = (row) => {
    setSelectedDeposit(row)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleRejectClose = () => {
    if (!actionLoading) {
      setShowRejectModal(false)
      setSelectedDeposit(null)
      setRejectReason('')
    }
  }

  const handleRejectConfirm = () => {
    if (!selectedDeposit) return
    const userId = getDepositUserId(selectedDeposit)
    if (!userId) {
      addToast('User ID not found for this deposit', 'error')
      return
    }
    const reason = rejectReason.trim().slice(0, 500)
    const payload = {
      status: 'rejected',
      userId,
    }
    if (reason) {
      payload.rejectReason = reason
      payload.adminRemarks = reason
    }
    setActionLoading(true)
    AuthService.patchMasterDepositRequest(selectedDeposit._id, payload)
      .then((res) => {
        if (res?.success) {
          addToast(res.message || 'Deposit rejected', 'success')
          handleRejectClose()
          fetchDeposits()
        } else {
          addToast(res?.message || 'Failed to reject deposit', 'error')
        }
      })
      .catch(() => addToast('Failed to reject deposit', 'error'))
      .finally(() => setActionLoading(false))
  }

  const handleDownloadCSV = () => {
    if (!filtered.length) {
      addToast('No data to export', 'error')
      return
    }
    const headers = ['ID', 'User', 'Amount', 'Status', 'UTR', 'Remarks', 'Created']
    const rows = filtered.map((d) =>
      [
        d._id,
        userLabel(d),
        d.amount,
        statusLabel(d.status),
        d.utrNumber || '',
        d.remarks || '',
        d.createdAt || '',
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `deposits_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    addToast('CSV downloaded', 'success')
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'
  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)

  return (
    <div className="space-y-6">
      <PageBanner title="Deposits" subtitle="View and manage deposit requests" icon={HiArrowDown} />
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
            className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500 -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
            placeholder="Search by ID, UTR, user..."
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
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Transaction ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User Name</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Amount</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">UTR</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Payment Proof</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Remarks</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Processed</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Created</th>
                {(activeTab === 'all' || activeTab === 'pending') && (
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
                  <td colSpan={activeTab === 'rejected' ? 11 : 10} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={activeTab === 'rejected' ? 11 : 10} className="py-12 text-center text-red-600 text-sm">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'rejected' ? 11 : 10} className="py-12 text-center text-gray-500 text-sm">
                    No deposits in this list.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const u = d.userId
                  return (
                    <tr key={d._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 text-teal-600 font-mono text-sm truncate max-w-[120px]" title={d.transactionId
                      }>{d.transactionId
                        }</td>
                      <td className="py-4 px-5 text-gray-900 text-sm">
                        {u?.uuid && <p className="font-medium">{u.uuid}</p>}
                        <p className="text-gray-500 font-mono text-xs mt-0.5">({u?.mobile || u?.email || u?.fullName || '–'})</p>
                      </td>
                      <td className="py-4 px-5 text-gray-900 text-sm">
                        {u?.fullName && <p className="font-medium">{u.fullName}</p>}
                      </td>
                      <td className="py-4 px-5 font-medium text-emerald-600">₹{Number(d.amount ?? 0).toLocaleString()}</td>
                      <td className="py-4 px-5">
                        <Badge variant={badgeVariant(d.status)}>{statusLabel(d.status)}</Badge>
                      </td>
                      <td className="py-4 px-5 text-gray-600 font-mono text-sm">{d.utrNumber || '–'}</td>
                      <td className="py-4 px-5">
                        {d.paymentProofUrl ? (
                          <span className="inline-flex items-center gap-1">
                            <img
                              src={getPaymentProofUrl(d.paymentProofUrl)}
                              crossOrigin="anonymous"
                              alt="Payment proof"
                              className="h-12 w-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0 cursor-pointer"
                              onClick={() => setProofPreviewUrl(getPaymentProofUrl(d.paymentProofUrl))}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.style.display = 'none'
                                const fallback = e.target.parentElement?.querySelector('.proof-fallback')
                                if (fallback) fallback.classList.remove('hidden')
                              }}
                            />
                            <span className="proof-fallback hidden text-gray-400 text-xs">Failed to load</span>
                          </span>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="py-4 px-5 text-gray-600 text-sm max-w-[150px] truncate" title={d.remarks}>{d.remarks || '–'}</td>
                      <td className="py-4 px-5 text-gray-500 text-sm">
                        {d.processedAt ? formatDateTime(d.processedAt) : '–'}
                        {d.processedBy && <span className="block text-xs text-gray-400">{d.processedBy}</span>}
                      </td>
                      <td className="py-4 px-5 text-gray-500 text-sm">{formatDateTime(d.createdAt)}</td>
                      {(activeTab === 'all' || activeTab === 'pending') && (
                        <td className="py-4 px-5 text-right">
                          {d.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleApprove(d)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <HiCheck className="w-4 h-4" /> Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleRejectClick(d)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate" title={d.adminRemarks}>{d.adminRemarks || '–'}</td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && filtered.length > 0 && totalPages > 1 && (
          <div className="flex justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 inline-flex items-center gap-1"
              >
                <HiChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 inline-flex items-center gap-1"
              >
                Next <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={handleRejectClose} title="Reject Deposit Request" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reject Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              className={inputClass}
            />
          </div>
          {selectedDeposit && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm">
              <p><strong>User:</strong> {userLabel(selectedDeposit)}</p>
              <p><strong>Amount:</strong> ₹{Number(selectedDeposit.amount ?? 0).toLocaleString()}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" disabled={actionLoading} onClick={handleRejectClose} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-50">Cancel</button>
            <button type="button" disabled={actionLoading} onClick={handleRejectConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50">
              {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!proofPreviewUrl} onClose={() => setProofPreviewUrl('')} title="Payment Proof" size="xl">
        <div className="flex items-center justify-center">
          {proofPreviewUrl ? (
            <img
              src={proofPreviewUrl}
              crossOrigin="anonymous"
              alt="Payment proof preview"
              className="max-h-[75vh] w-auto max-w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
            />
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
