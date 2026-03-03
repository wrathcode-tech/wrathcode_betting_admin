/**
 * Withdrawals – tabs: All, Pending, Approved, Rejected (like Deposits). Approve/Reject only on Pending; no Actions on Approved/Rejected.
 */
import { useState, useEffect, useMemo } from 'react'
import { HiSearch, HiDownload, HiCheck, HiX, HiArrowUp } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getWithdrawals } from '../services/api'

const CURRENCY_FILTER = ['All', 'INR']

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

function statusMatch(w, tabId) {
  if (tabId === 'all') return true
  if (tabId === 'pending') return w.status === 'pending'
  if (tabId === 'approved') return w.status === 'approved' || w.status === 'completed'
  if (tabId === 'rejected') return w.status === 'rejected'
  return true
}

export default function Withdrawals() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [currencyFilter, setCurrencyFilter] = useState('All')
  const [page, setPage] = useState(1)
  const { addToast } = useToast()
  const { hasPermission, getAssignedUserIds } = useAuth()
  const canApprove = hasPermission(PERMISSIONS.APPROVE_WITHDRAWALS)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    getWithdrawals().then((r) => {
      let list = r.data || []
      const assignedIds = getAssignedUserIds()
      if (assignedIds && assignedIds.length > 0) list = list.filter((w) => assignedIds.includes(w.userId))
      setData(list)
    })
  }, [getAssignedUserIds])

  const counts = useMemo(() => ({
    all: data.length,
    pending: data.filter((w) => w.status === 'pending').length,
    approved: data.filter((w) => w.status === 'approved' || w.status === 'completed').length,
    rejected: data.filter((w) => w.status === 'rejected').length,
  }), [data])

  const filtered = useMemo(() => {
    return data.filter((w) => {
      const matchSearch = !search.trim() || w.user?.toLowerCase().includes(search.toLowerCase()) || w.id?.toLowerCase().includes(search.toLowerCase())
      const matchCurrency = currencyFilter === 'All' || w.currency === currencyFilter
      const matchTab = statusMatch(w, activeTab)
      return matchSearch && matchCurrency && matchTab
    })
  }, [data, search, currencyFilter, activeTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  )

  useEffect(() => setPage(1), [activeTab, search, currencyFilter])

  const formatAmount = (w) => (w.currency === 'INR' ? `₹${Number(w.amount).toLocaleString()}` : `${w.amount} ${w.currency}`)

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

  const handleApprove = (id) => {
    setData((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)))
    addToast('Withdrawal approved', 'success')
  }

  const handleReject = (id) => {
    setData((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'rejected', rejectReason: 'Rejected by Admin' } : w)))
    addToast('Withdrawal rejected', 'success')
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Withdrawals" subtitle="INR (UPI, Bank) – approve or reject requests – PlayAdd / BetFury" icon={HiArrowUp} />
      <div className="flex justify-end">
        <button type="button" onClick={() => addToast('Export started', 'success')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors">
          <HiDownload className="w-5 h-5" /> Export
        </button>
      </div>

      {/* Tabs: All, Pending, Approved, Rejected */}
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
          <option value="All">All</option>
          {CURRENCY_FILTER.filter((c) => c !== 'All').map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
                {(activeTab === 'all' || activeTab === 'pending') && canApprove && (
                  <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((w) => (
                <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5 text-teal-600 font-mono text-sm">{w.id}</td>
                  <td className="py-4 px-5 text-gray-900 font-medium">{w.user}</td>
                  <td className="py-4 px-5 font-medium text-gray-900">{formatAmount(w)}</td>
                  <td className="py-4 px-5"><Badge variant="info">INR</Badge></td>
                  <td className="py-4 px-5 text-gray-600">{w.method}</td>
                  <td className="py-4 px-5"><Badge variant={badgeVariant(w.status)}>{statusLabel(w.status)}</Badge></td>
                  <td className="py-4 px-5 text-gray-500 text-sm">{w.createdAt}</td>
                  {activeTab === 'rejected' && (
                    <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate" title={w.rejectReason}>{w.rejectReason || '–'}</td>
                  )}
                  {(activeTab === 'all' || activeTab === 'pending') && canApprove && (
                    <td className="py-4 px-5 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => handleApprove(w.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100">
                            <HiCheck className="w-4 h-4" /> Approve
                          </button>
                          <button type="button" onClick={() => handleReject(w.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100">
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
          <div className="py-12 text-center text-gray-500 text-sm">No withdrawals in this list.</div>
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
    </div>
  )
}
