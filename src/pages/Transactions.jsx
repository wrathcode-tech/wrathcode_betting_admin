import { useState, useMemo } from 'react'
import { HiSearch, HiDownload, HiCurrencyDollar } from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useToast } from '../context/ToastContext'

const PAYMENT_METHODS = ['All', 'UPI', 'Paytm', 'GPay', 'PhonePe', 'IMPS', 'Bank Transfer']

const allTx = [
  { id: 'TXN001', type: 'Deposit', user: 'Rahul K.', amount: '₹5,000', currency: 'INR', method: 'UPI', time: '2 min ago' },
  { id: 'TXN002', type: 'Withdrawal', user: 'Priya S.', amount: '₹12,000', currency: 'INR', method: 'Paytm', time: '15 min ago' },
  { id: 'TXN003', type: 'Deposit', user: 'Sneha M.', amount: '₹10,000', currency: 'INR', method: 'IMPS', time: '28 min ago' },
  { id: 'TXN004', type: 'Withdrawal', user: 'Vikram J.', amount: '₹5,000', currency: 'INR', method: 'UPI', time: '45 min ago' },
  { id: 'TXN005', type: 'Bet', user: 'Amit R.', amount: '₹500', currency: 'INR', method: '–', time: '1 hr ago' },
  { id: 'TXN006', type: 'Win', user: 'Sneha M.', amount: '₹15,000', currency: 'INR', method: '–', time: '2 hr ago' },
  { id: 'TXN007', type: 'Deposit', user: 'Vikram J.', amount: '₹2,000', currency: 'INR', method: 'GPay', time: '3 hr ago' },
  { id: 'TXN008', type: 'Withdrawal', user: 'Sneha M.', amount: '₹8,000', currency: 'INR', method: 'Bank Transfer', time: '4 hr ago' },
  { id: 'TXN009', type: 'Deposit', user: 'Kavya L.', amount: '₹3,000', currency: 'INR', method: 'GPay', time: '5 hr ago' },
]

const typeOptions = ['All', 'Deposit', 'Withdrawal', 'Bet', 'Win']

export default function Transactions() {
  const [filter, setFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { addToast } = useToast()
  const ITEMS_PER_PAGE = 5

  const filtered = useMemo(() => {
    let list = filter === 'All' ? allTx : allTx.filter((t) => t.type === filter)
    if (methodFilter !== 'All') list = list.filter((t) => t.method === methodFilter)
    if (search.trim()) list = list.filter((t) => t.id.toLowerCase().includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [filter, methodFilter, search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = useMemo(() => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filtered, page])

  function handleExport() {
    addToast('Export started. You will receive the file shortly.', 'success')
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Transactions" subtitle="INR – deposits, withdrawals, bets, wins – PlayAdd / BetFury" icon={HiCurrencyDollar} />
      <div className="flex justify-end">
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
            placeholder="Search by ID or user..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none">
          {typeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none">
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === 'All' ? 'All methods' : m}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Type</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Amount</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Currency</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Payment</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500 text-sm">No transactions match your filters.</td></tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 text-teal-600 font-mono text-sm">{t.id}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${t.type === 'Deposit' ? 'bg-blue-500/20 text-blue-400' : t.type === 'Withdrawal' ? 'bg-orange-500/20 text-orange-400' : t.type === 'Win' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-200 text-gray-600'}`}>{t.type}</span>
                    </td>
                    <td className="py-4 px-5 text-gray-700">{t.user}</td>
                    <td className="py-4 px-5 font-medium text-gray-900">{t.amount}</td>
                    <td className="py-4 px-5"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">INR</span></td>
                    <td className="py-4 px-5 text-gray-500 text-sm">{t.method}</td>
                    <td className="py-4 px-5 text-gray-500 text-sm">{t.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
