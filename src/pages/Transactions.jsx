/**
 * Transactions – deposit & withdrawal list from GET /api/v1/master/deposit-withdrawal-list
 */
import { useState, useEffect, useCallback } from 'react'
import { HiSearch, HiDownload, HiCurrencyDollar, HiChevronLeft, HiChevronRight, HiRefresh } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useToast } from '../context/ToastContext'
import AuthService from '../api/services/AuthService'

function formatDateTime(iso) {
  if (!iso) return '–'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return iso
  }
}

function formatTimeAgo(iso) {
  if (!iso) return '–'
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now - d
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`
    if (diffHr < 24) return `${diffHr} hr ago`
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
    return formatDateTime(iso)
  } catch {
    return '–'
  }
}

function formatAmount(amount, currency = 'INR') {
  if (amount == null) return '–'
  const num = Number(amount)
  if (Number.isNaN(num)) return '–'
  return currency === 'INR' ? `₹${num.toLocaleString('en-IN')}` : `${currency} ${num.toLocaleString()}`
}

export default function Transactions() {
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { addToast } = useToast()

  const fetchList = useCallback(() => {
    setLoading(true)
    setError(null)
    AuthService.getMasterDepositWithdrawalList({ page, limit })
      .then((res) => {
        if (res?.success && res?.data) {
          setList(res.data.list || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setList([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load transactions')
        }
      })
      .catch(() => {
        setList([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load transactions')
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    setPage(1)
  }, [typeFilter])

  const filtered = list.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false
    if (search.trim()) {
      const term = search.toLowerCase()
      return (
        (t.transactionId && String(t.transactionId).toLowerCase().includes(term)) ||
        (t.userDisplay && t.userDisplay.toLowerCase().includes(term))
      )
    }
    return true
  })

  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const total = pagination.total

  function handleExport() {
    addToast('Export started. You will receive the file shortly.', 'success')
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Transactions" subtitle="Deposit & withdrawal list – INR" icon={HiCurrencyDollar} />
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={fetchList}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 disabled:opacity-50"
          title="Refresh"
        >
          <HiRefresh className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors"
        >
          <HiDownload className="w-5 h-5" /> Export
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction ID or user..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Transaction ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Type</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Amount</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Currency</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Payment</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Time</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">Loading…</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-red-600 text-sm">{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">No transactions match your filters.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.transactionId || t.time + t.amount} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 text-teal-600 font-mono text-sm">{t.transactionId || '–'}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          t.type === 'deposit' ? 'bg-blue-500/20 text-blue-600' : 'bg-orange-500/20 text-orange-600'
                        }`}
                      >
                        {t.type === 'deposit' ? 'Deposit' : t.type === 'withdrawal' ? 'Withdrawal' : t.type || '–'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-700">{t.userDisplay || '–'}</td>
                    <td className="py-4 px-5 text-right font-medium text-gray-900">{formatAmount(t.amount, t.currency)}</td>
                    <td className="py-4 px-5">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">{t.currency || 'INR'}</span>
                    </td>
                    <td className="py-4 px-5 text-gray-500 text-sm uppercase">{t.paymentMethod ? String(t.paymentMethod).toUpperCase() : '–'}</td>
                    <td className="py-4 px-5">
                      <span className="text-gray-700 text-sm block">{formatDateTime(t.time)}</span>
                      <span className="text-gray-500 text-xs block">({formatTimeAgo(t.time)})</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          t.status === 'approved' || t.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : t.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-600'
                              : 'bg-red-500/20 text-red-600'
                        }`}
                      >
                        {t.status ? String(t.status).charAt(0).toUpperCase() + String(t.status).slice(1) : '–'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && filtered.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 disabled:pointer-events-none"
              >
                <HiChevronLeft className="w-4 h-4 inline mr-1" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 disabled:pointer-events-none"
              >
                Next <HiChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
