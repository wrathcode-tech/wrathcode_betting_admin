/**
 * Reports – Teal banner, date range, all reports on one page: Revenue summary, P&L by category, Deposits vs Withdrawals.
 * Clear labels so client understands at a glance. No modal – everything visible on page.
 */
import { useState, useEffect } from 'react'
import {
  HiCash,
  HiTrendingUp,
  HiDownload,
  HiDocumentReport,
  HiCollection,
  HiArrowUp,
  HiArrowDown,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useToast } from '../context/ToastContext'
import { getReportsRevenueSummary } from '../services/api'
import AuthService from '../api/services/AuthService'

function formatInr(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

/** Normalize monthwise API row: { year, month, monthLabel, depositCount, depositAmount, withdrawalCount, withdrawalAmount } → table shape */
function normalizeMonthwiseRow(row) {
  const month = row.monthLabel && row.year ? `${row.monthLabel} ${row.year}` : row.monthLabel ?? row.monthName ?? row.period ?? '—'
  const deposits = row.depositCount ?? row.depositsCount ?? row.deposits ?? 0
  const depositAmount = row.depositAmount ?? row.totalDeposit ?? 0
  const withdrawals = row.withdrawalCount ?? row.withdrawalsCount ?? row.withdrawals ?? 0
  const withdrawalAmount = row.withdrawalAmount ?? row.totalWithdrawal ?? 0
  return { month, deposits, depositAmount, withdrawals, withdrawalAmount }
}

export default function Reports() {
  const [dateRange, setDateRange] = useState('30d')
  const [revenueSummary, setRevenueSummary] = useState([])
  const [plData, setPlData] = useState([])
  const [depositWithdrawal, setDepositWithdrawal] = useState([])
  const [depositWithdrawalLoading, setDepositWithdrawalLoading] = useState(false)
  const [plLoading, setPlLoading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    getReportsRevenueSummary(dateRange).then((r) => setRevenueSummary(Array.isArray(r.data) ? r.data : []))
  }, [dateRange])

  useEffect(() => {
    setPlLoading(true)
    const now = Date.now()
    const to = new Date(now).toISOString()
    const from = new Date(now - (dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30) * 24 * 60 * 60 * 1000).toISOString()
    AuthService.getMasterProfitLossByCategory({ from, to })
      .then((res) => {
        const list = res?.data?.data
        if (res?.success && Array.isArray(list)) {
          setPlData(list)
        } else {
          setPlData([])
          if (!res?.success && res?.message) addToast(res.message, 'error')
        }
      })
      .catch(() => {
        setPlData([])
        addToast('Failed to load profit & loss by category', 'error')
      })
      .finally(() => setPlLoading(false))
  }, [dateRange, addToast])

  useEffect(() => {
    setDepositWithdrawalLoading(true)
    const params = {}
    if (dateRange === '7d') params.from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    else if (dateRange === '90d') params.from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    AuthService.getMasterDepositsWithdrawalsMonthwise(params)
      .then((res) => {
        const list = res?.data?.data
        if (res?.success && Array.isArray(list)) {
          setDepositWithdrawal(list.map(normalizeMonthwiseRow))
        } else {
          setDepositWithdrawal([])
          if (!res?.success && res?.message) addToast(res.message, 'error')
        }
      })
      .catch(() => {
        setDepositWithdrawal([])
        addToast('Failed to load deposits/withdrawals by month', 'error')
      })
      .finally(() => setDepositWithdrawalLoading(false))
  }, [dateRange, addToast])

  function handleExport() {
    addToast('Report export started', 'success')
  }

  return (
    <div className="space-y-0">
      <PageBanner title="Reports" subtitle="Revenue, deposits & withdrawals — view and export by date range" icon={HiDocumentReport} />

      {/* Date range & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiDocumentReport className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Report period</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">Date range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            <HiDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* 1. Revenue (GGR) summary – at a glance */}
      <div className="pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Revenue (GGR) summary</h2>
        <p className="text-sm text-gray-500 mb-4">Gross gaming revenue for the selected period.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {revenueSummary.map((row) => (
            <div key={row.period} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">{row.period}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatInr(row.amount)}</p>
              <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${(row.change || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(row.change || 0) >= 0 ? <HiArrowUp className="w-4 h-4" /> : <HiArrowDown className="w-4 h-4" />}
                {Math.abs(row.change || 0)}% vs previous period
              </p>
            </div>
          ))}
        </div>
        {revenueSummary.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 text-center text-gray-500 text-sm">No revenue data for this period.</div>
        )}
      </div>

      {/* 2. Profit & Loss by category – GET /api/v1/master/profit-loss-by-category */}
      <div className="pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Profit & loss by category</h2>
        <p className="text-sm text-gray-500 mb-4">Segment-wise profit and loss (INR) for the selected period.</p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Category</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Profit (INR)</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Loss (INR)</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Net</th>
              </tr>
            </thead>
            <tbody>
              {plLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : (
                plData.map((row) => {
                  const net = row.net != null ? row.net : (row.profit || 0) - (row.loss || 0)
                  return (
                    <tr key={row.categoryCode ?? row.category} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 font-medium text-gray-900">{row.category ?? row.name}</td>
                      <td className="py-4 px-5 text-right text-emerald-600 font-medium">{formatInr(row.profit)}</td>
                      <td className="py-4 px-5 text-right text-red-600 font-medium">{formatInr(row.loss)}</td>
                      <td className={`py-4 px-5 text-right font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatInr(net)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!plLoading && plData.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 text-center text-gray-500 text-sm">No P&L data for this period.</div>
        )}
      </div>

      {/* 3. Deposits vs Withdrawals – GET /api/v1/master/deposits-withdrawals-monthwise */}
      <div className="pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Deposits vs withdrawals</h2>
        <p className="text-sm text-gray-500 mb-4">Transaction counts and amounts (INR) by month.</p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Month</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">No. of deposits</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Deposit amount</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">No. of withdrawals</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Withdrawal amount</th>
              </tr>
            </thead>
            <tbody>
              {depositWithdrawalLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : (
                depositWithdrawal.map((row) => (
                  <tr key={row.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-5 font-medium text-gray-900">{row.month}</td>
                    <td className="py-4 px-5 text-right text-gray-700">{row.deposits}</td>
                    <td className="py-4 px-5 text-right text-emerald-600 font-medium">{row.depositAmount != null ? formatInr(row.depositAmount) : '—'}</td>
                    <td className="py-4 px-5 text-right text-gray-700">{row.withdrawals}</td>
                    <td className="py-4 px-5 text-right text-amber-600 font-medium">{row.withdrawalAmount != null ? formatInr(row.withdrawalAmount) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!depositWithdrawalLoading && depositWithdrawal.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 text-center text-gray-500 text-sm">No deposit/withdrawal data for this period.</div>
        )}
      </div>

      {/* Short note */}
      <div className="pt-6 pb-2 flex items-start gap-2 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
        <HiTrendingUp className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-teal-800">
          <span className="font-medium">Tip:</span> Change the date range above to see data for different periods. Use Export to download reports.
        </div>
      </div>
    </div>
  )
}
