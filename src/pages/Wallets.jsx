/**
 * Wallets – listing from GET /api/v1/master/wallets. Search, pagination, summary cards.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  HiCash,
  HiUserGroup,
  HiSearch,
  HiRefresh,
  HiAdjustments,
  HiChevronLeft,
  HiChevronRight as HiNext,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function formatDateTime(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const DEBOUNCE_MS = 400

export default function Wallets() {
  const [wallets, setWallets] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ type: 'credit', amount: '', reason: '' })
  const [adjustLoading, setAdjustLoading] = useState(false)
  const { addToast } = useToast()
  const { hasPermission, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const canAdjust = hasPermission(PERMISSIONS.ADJUST_WALLETS) || caps.canAdjustWallets

  const fetchWallets = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit, search: searchTerm.trim() || undefined }
    AuthService.getMasterWallets(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setWallets(res.data.wallets || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setWallets([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load wallets')
        }
      })
      .catch(() => {
        setWallets([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load wallets')
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm])

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const total = pagination.total
  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)

  const stats = {
    totalBalance: wallets.reduce((s, w) => s + Number(w.totalBalance || 0), 0),
    totalWallets: total,
    activeWallets: wallets.filter((w) => Number(w.totalBalance || 0) > 0).length,
  }

  function openAdjust(w) {
    setSelectedWallet(w)
    setAdjustForm({ type: 'credit', amount: '', reason: '' })
    setAdjustOpen(true)
  }

  function getWalletUserId(w) {
    if (!w) return null
    return w.userId ?? w.user?._id ?? w._id
  }

  function handleAdjust(e) {
    e.preventDefault()
    const userId = getWalletUserId(selectedWallet)
    if (!userId) {
      addToast('User ID not found for this wallet', 'error')
      return
    }
    const amount = Number(adjustForm.amount)
    if (!adjustForm.amount || isNaN(amount) || amount < 1) {
      addToast('Enter a valid amount (minimum 1)', 'error')
      return
    }
    setAdjustLoading(true)
    const payload = {
      type: adjustForm.type,
      amount: Math.floor(amount),
      ...(adjustForm.reason?.trim() && { description: adjustForm.reason.trim().slice(0, 500) }),
    }
    AuthService.postMasterUserWalletAdjust(userId, payload)
      .then((res) => {
        if (res?.success) {
          addToast(res.message || 'Wallet balance updated', 'success')
          setAdjustOpen(false)
          setSelectedWallet(null)
          setAdjustForm({ type: 'credit', amount: '', reason: '' })
          fetchWallets()
        } else {
          addToast(res?.message || 'Failed to adjust balance', 'error')
        }
      })
      .catch(() => addToast('Failed to adjust balance', 'error'))
      .finally(() => setAdjustLoading(false))
  }

  function handleReset() {
    setSearchInput('')
    setSearchTerm('')
    setPage(1)
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'

  return (
    <div className="space-y-0">
      <PageBanner title="Wallets" subtitle="View and manage user balances (INR)" icon={HiCash} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <HiCash className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Balance</p>
              <p className="text-lg font-bold text-gray-900">{formatInr(stats.totalBalance)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HiUserGroup className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Wallets</p>
              <p className="text-lg font-bold text-gray-900">{loading ? '…' : total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HiCash className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">With Balance</p>
              <p className="text-lg font-bold text-gray-900">{stats.activeWallets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet list section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiCash className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Wallet Balances</span>
        </div>
        <span className="text-sm text-gray-500">{loading ? '…' : `${total} wallets`}</span>
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by mobile, name, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button
          type="button"
          onClick={fetchWallets}
          className="p-2.5 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          title="Refresh"
        >
          <HiRefresh className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">UUID</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance (INR)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bonus (INR)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total (INR)</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                {canAdjust && (
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canAdjust ? 7 : 6} className="py-12 text-center text-gray-500 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={canAdjust ? 7 : 6} className="py-12 text-center text-red-600 text-sm">
                    {error}
                  </td>
                </tr>
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan={canAdjust ? 7 : 6} className="py-12 text-center text-gray-500 text-sm">
                    No wallets found.
                  </td>
                </tr>
              ) : (
                [...wallets].reverse().map((w) => (
                  <tr key={w.userId ?? w._id ?? w.user?._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                          {(w.fullName || '?')[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{w.fullName || '–'}</p>
                          <p className="text-sm text-gray-500">{w.email || '–'}</p>
                          {w.mobile && <p className="text-xs text-gray-400">{w.mobile}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-600 text-sm">{w.uuid || '–'}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">{formatInr(w.balance)}</td>
                    <td className="py-4 px-4 text-right font-medium text-amber-600">{formatInr(w.bonusAmount)}</td>
                    <td className="py-4 px-4 text-right font-semibold text-teal-700">{formatInr(w.totalBalance)}</td>
                    <td className="py-4 px-4 text-gray-500 text-sm">{formatDateTime(w.createdAt)}</td>
                    {canAdjust && (
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openAdjust(w)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
                        >
                          <HiAdjustments className="w-4 h-4" />
                          Adjust
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && wallets.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                <HiChevronLeft className="w-4 h-4 inline mr-1" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next <HiNext className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && wallets.length === 0 && (
        <EmptyState
          title="No wallets found"
          message={searchTerm ? 'Try a different search.' : 'No wallets to display.'}
        />
      )}

      {/* Adjust balance modal */}
      <Modal
        open={adjustOpen}
        onClose={() => { if (!adjustLoading) { setAdjustOpen(false); setSelectedWallet(null); } }}
        title={selectedWallet ? `Adjust balance – ${selectedWallet.fullName || selectedWallet.email || 'User'}` : 'Adjust balance'}
        size="md"
      >
        {selectedWallet && (
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-medium">Current total balance</p>
              <p className="text-xl font-bold text-teal-600">{formatInr(selectedWallet.totalBalance)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                value={adjustForm.type}
                onChange={(e) => setAdjustForm((f) => ({ ...f, type: e.target.value }))}
                className={inputClass}
                disabled={adjustLoading}
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (INR, min 1)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))}
                className={inputClass}
                placeholder="0"
                disabled={adjustLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional, max 500 chars)</label>
              <input
                type="text"
                maxLength={500}
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Bonus correction, Refund reversal"
                disabled={adjustLoading}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setAdjustOpen(false); setSelectedWallet(null); }}
                disabled={adjustLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50"
              >
                {adjustLoading ? 'Applying…' : 'Apply'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
