/**
 * My Account Statement – From & To, opening/closing balance, amount, transaction type.
 * Filters by user, transaction type, date range; export Excel/PDF.
 */
import { useState, useEffect, useMemo } from 'react'
import { HiSearch, HiDocumentDownload, HiDocumentReport } from 'react-icons/hi'
import { useToast } from '../context/ToastContext'
import { getAccountStatement } from '../services/api'

const TRANSACTION_OPTIONS = ['All', 'Settlement Deposit', 'Settlement Withdraw']

export default function AccountSettlement() {
  const [statement, setStatement] = useState([])
  const [userFilter, setUserFilter] = useState('')
  const [transactionType, setTransactionType] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const { addToast } = useToast()
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    getAccountStatement({
      userFilter: userFilter.trim(),
      transactionType: transactionType === 'All' ? undefined : transactionType,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }).then((r) => setStatement(r.data || []))
    setPage(1)
  }, [userFilter, transactionType, fromDate, toDate])

  const totalPages = Math.max(1, Math.ceil(statement.length / ITEMS_PER_PAGE))
  const paginated = useMemo(
    () => statement.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [statement, page]
  )

  const formatDate = (d) => {
    if (!d) return '–'
    const dt = new Date(d)
    return dt.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatAmount = (n) => {
    if (n == null) return '–'
    return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleExportExcel = () => {
    addToast('Excel export started. File will download shortly.', 'success')
    // In real app: trigger API or client-side XLSX export
  }

  const handleExportPdf = () => {
    addToast('PDF export started. File will download shortly.', 'success')
    // In real app: trigger API or client-side PDF export
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account Statement</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors text-sm font-medium"
          >
            <HiDocumentDownload className="w-5 h-5" /> Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors text-sm font-medium"
          >
            <HiDocumentReport className="w-5 h-5" /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-end">
        <div className="relative flex-1 min-w-[180px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Select User"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none min-w-[180px]"
        >
          {TRANSACTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-gray-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          />
          <label className="text-sm text-gray-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Date</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">From & To</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Opening Bal.</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Amount</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Closing Bal.</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-xs uppercase">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    No transactions in this period.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 text-gray-700 text-sm whitespace-nowrap">{formatDate(row.date)}</td>
                    <td className="py-4 px-5">
                      <span className="text-gray-900 font-medium">{row.from}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-900 font-medium">{row.to}</span>
                    </td>
                    <td className="py-4 px-5 text-right text-gray-700 tabular-nums">{formatAmount(row.openingBal)}</td>
                    <td className="py-4 px-5 text-right tabular-nums">
                      <span className={row.amount >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                        {row.amount >= 0 ? '' : '-'}{formatAmount(Math.abs(row.amount))}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-gray-700 tabular-nums">{formatAmount(row.closingBal)}</td>
                    <td className="py-4 px-5">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                        {row.transaction}
                      </span>
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
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, statement.length)} of {statement.length}
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
                Next ({page}/{totalPages})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}