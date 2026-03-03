/**
 * Deposits – flow: Pending (Edit amount, Approve, Reject with reason), Approved, Rejected. No API call (mock only).
 */
import { useState, useEffect, useMemo } from 'react'
import { HiSearch, HiDownload, HiCheck, HiX, HiPencil, HiArrowDown } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { getDeposits, approveDeposit as apiApproveDeposit, rejectDeposit as apiRejectDeposit } from '../services/api'

const CURRENCY_FILTER = ['All', 'INR']
const METHOD_FILTER = ['UPI', 'Paytm', 'GPay', 'PhonePe', 'IMPS', 'Bank Transfer']

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

function statusMatch(d, tabId) {
  if (tabId === 'all') return true
  if (tabId === 'pending') return d.status === 'pending'
  if (tabId === 'approved') return d.status === 'completed'
  if (tabId === 'rejected') return d.status === 'rejected'
  return true
}

export default function Deposits() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [currencyFilter, setCurrencyFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [editedAmounts, setEditedAmounts] = useState({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [editPrevAmount, setEditPrevAmount] = useState(0)
  const [editAmount, setEditAmount] = useState('')
  const [editRowId, setEditRowId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { addToast } = useToast()
  const { getAssignedUserIds } = useAuth()
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    getDeposits().then((r) => {
      let list = r.data || []
      const assignedIds = getAssignedUserIds()
      if (assignedIds && assignedIds.length > 0) list = list.filter((d) => assignedIds.includes(d.userId))
      setData(list)
    })
  }, [getAssignedUserIds])

  const counts = useMemo(() => ({
    all: data.length,
    pending: data.filter((d) => d.status === 'pending').length,
    approved: data.filter((d) => d.status === 'completed').length,
    rejected: data.filter((d) => d.status === 'rejected').length,
  }), [data])

  const filtered = useMemo(() => {
    let list = data.filter((d) => {
      const matchSearch = !search.trim() || d.user?.toLowerCase().includes(search.toLowerCase()) || d.id?.toLowerCase().includes(search.toLowerCase())
      const matchCurrency = currencyFilter === 'All' || d.currency === currencyFilter
      const matchMethod = methodFilter === 'All' || d.method === methodFilter
      const matchTab = statusMatch(d, activeTab)
      return matchSearch && matchCurrency && matchMethod && matchTab
    })
    if (activeTab === 'approved' && (startDate || endDate)) {
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null
      list = list.filter((d) => {
        const t = d.createdAt ? new Date(d.createdAt) : null
        if (!t) return true
        if (start && t < start) return false
        if (end && t > end) return false
        return true
      })
    }
    return list
  }, [data, search, currencyFilter, methodFilter, activeTab, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  )

  useEffect(() => setPage(1), [activeTab, search, currencyFilter, methodFilter, startDate, endDate])

  const formatAmount = (d) => (d.currency === 'INR' ? `₹${Number(d.amount).toLocaleString()}` : `${d.amount} ${d.currency}`)

  const badgeVariant = (status) => {
    if (status === 'completed') return 'success'
    if (status === 'pending') return 'warning'
    if (status === 'rejected') return 'error'
    return 'neutral'
  }

  const statusLabel = (status) => {
    if (status === 'completed') return 'Approved'
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : status
  }

  const getEffectiveAmount = (rowId, amount) => {
    const edited = editedAmounts[rowId]
    if (edited !== undefined && edited !== null && edited !== '') return Number(edited)
    return Number(amount || 0)
  }

  const openEditModal = (row) => {
    const prev = Number(row?.amount || 0)
    setEditPrevAmount(prev)
    setEditAmount(String(prev))
    setEditRowId(row?.id)
    setShowEditModal(true)
  }

  const handleSaveAmount = () => {
    if (editRowId != null) setEditedAmounts((prev) => ({ ...prev, [editRowId]: editAmount }))
    setShowEditModal(false)
    setEditRowId(null)
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditRowId(null)
  }

  const handleApprove = (row) => {
    const amountToCredit = getEffectiveAmount(row.id, row.amount)
    apiApproveDeposit(row.id, amountToCredit).then((res) => {
      if (res.data?.ok !== false) {
        setData((prev) => prev.map((d) => (d.id === row.id ? { ...d, status: 'completed' } : d)))
        setEditedAmounts((prev) => { const next = { ...prev }; delete next[row.id]; return next })
        addToast('Deposit approved – user balance credited', 'success')
      }
    })
  }

  const handleRejectClick = (row) => {
    setSelectedDeposit(row)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleRejectClose = () => {
    setShowRejectModal(false)
    setSelectedDeposit(null)
    setRejectReason('')
  }

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      addToast('Please enter a reject reason', 'error')
      return
    }
    if (!selectedDeposit) return
    apiRejectDeposit(selectedDeposit.id, rejectReason.trim()).then((res) => {
      if (res.data?.ok !== false) {
        setData((prev) => prev.map((d) => (d.id === selectedDeposit.id ? { ...d, status: 'rejected', rejectReason: rejectReason.trim() } : d)))
        handleRejectClose()
        addToast('Deposit rejected', 'success')
      }
    })
  }

  const handleDownloadCSV = () => {
    const list = filtered
    if (!list.length) {
      addToast('No data to export', 'error')
      return
    }
    const headers = ['ID', 'User', 'Amount', 'Currency', 'Method', 'Status', 'Time']
    const rows = list.map((d) => [d.id, d.user, d.amount, d.currency, d.method, statusLabel(d.status), d.createdAt].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `approved_deposits_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    addToast('CSV downloaded', 'success')
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'

  return (
    <div className="space-y-6">
      <PageBanner title="Deposits" subtitle="INR – view and track all deposits – PlayAdd / BetFury" icon={HiArrowDown} />
      <div className="flex justify-end">
        <button type="button" onClick={() => addToast('Export started', 'success')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors">
          <HiDownload className="w-5 h-5" /> Export
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
            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? 'bg-teal-200/60 text-teal-800' : 'bg-gray-200 text-gray-600'}`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Search, filters, date (Approved), CSV */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or user..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
        <select value={currencyFilter} onChange={(e) => { setCurrencyFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none">
          {CURRENCY_FILTER.map((m) => (<option key={m} value={m}>{m}</option>))}
        </select>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none">
          <option value="All">All methods</option>
          {METHOD_FILTER.map((m) => (<option key={m} value={m}>{m}</option>))}
        </select>
        {activeTab === 'approved' && (
          <>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:border-teal-500 focus:outline-none" title="From" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:border-teal-500 focus:outline-none" title="To" />
            <button type="button" onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-medium hover:bg-gray-900">
              <HiDownload className="w-4 h-4" /> CSV
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Amount</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Currency</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Method</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Time</th>
                {activeTab === 'rejected' && (
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Reject Reason</th>
                )}
                {(activeTab === 'all' || activeTab === 'pending') && (
                  <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5 text-teal-600 font-mono text-sm">{d.id}</td>
                  <td className="py-4 px-5 text-gray-900 font-medium">{d.user}</td>
                  <td className="py-4 px-5 font-medium">
                    <span className="text-emerald-500">
                      {d.status === 'pending' && editedAmounts[d.id] != null ? `₹${Number(editedAmounts[d.id]).toLocaleString()}` : formatAmount(d)}
                    </span>
                  </td>
                  <td className="py-4 px-5"><Badge variant="info">INR</Badge></td>
                  <td className="py-4 px-5 text-gray-600">{d.method}</td>
                  <td className="py-4 px-5"><Badge variant={badgeVariant(d.status)}>{statusLabel(d.status)}</Badge></td>
                  <td className="py-4 px-5 text-gray-500 text-sm">{d.createdAt}</td>
                  {activeTab === 'rejected' && (
                    <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate" title={d.rejectReason}>{d.rejectReason || '–'}</td>
                  )}
                  {(activeTab === 'all' || activeTab === 'pending') && (
                    <td className="py-4 px-5 text-right">
                      {d.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openEditModal(d)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">
                            <HiPencil className="w-4 h-4" /> Edit
                          </button>
                          <button type="button" onClick={() => handleApprove(d)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100">
                            <HiCheck className="w-4 h-4" /> Approve
                          </button>
                          <button type="button" onClick={() => handleRejectClick(d)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100">
                            <HiX className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">–</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No deposits in this list.</div>
        ) : (
          totalPages > 1 && (
            <div className="flex justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50">Prev</button>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Reject Reason Modal */}
      <Modal open={showRejectModal} onClose={handleRejectClose} title="Reject Deposit Request" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reject Reason <span className="text-red-500">*</span></label>
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
              <p><strong>User:</strong> {selectedDeposit.user}</p>
              <p><strong>Amount:</strong> {formatAmount(selectedDeposit)}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={handleRejectClose} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300">Cancel</button>
            <button type="button" onClick={handleRejectConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600">Confirm Reject</button>
          </div>
        </div>
      </Modal>

      {/* Edit Amount Modal */}
      <Modal open={showEditModal} onClose={handleCancelEdit} title="Edit Amount" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Previous Amount</label>
            <input type="text" readOnly value={editPrevAmount} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Amount</label>
            <input type="number" min={0} step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={inputClass} placeholder="0" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleCancelEdit} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300">Cancel</button>
            <button type="button" onClick={handleSaveAmount} className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
