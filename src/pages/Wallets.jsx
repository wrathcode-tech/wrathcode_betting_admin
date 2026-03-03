/**
 * Wallets – UI/UX: teal banner, summary cards, searchable table (User, Main, Bonus, Total INR), Adjust modal, pagination.
 */
import { useState, useMemo, useEffect } from 'react'
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
import { getUsers } from '../services/api'

const CURRENCY = 'INR'

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function Wallets() {
  const [wallets, setWallets] = useState([])
  const [search, setSearch] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ type: 'credit', amount: '', reason: '' })
  const { addToast } = useToast()
  const { hasPermission, getAssignedUserIds, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const canAdjust = hasPermission(PERMISSIONS.ADJUST_WALLETS) || caps.canAdjustWallets

  useEffect(() => {
    loadWallets()
  }, [getAssignedUserIds])

  function loadWallets() {
    getUsers().then((r) => {
      let raw = r.data || []
      const assignedIds = getAssignedUserIds()
      if (assignedIds && assignedIds.length > 0) raw = raw.filter((u) => assignedIds.includes(u.id))
      const list = raw.map((u) => ({
        id: u.id,
        userId: u.id,
        userName: u.name,
        email: u.email,
        mainBalance: u.balanceFiat ?? 0,
        bonusBalance: u.bonusBalance ?? 0,
      }))
      setWallets(list)
    })
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return wallets
    const term = search.toLowerCase()
    return wallets.filter(
      (w) =>
        (w.userName && w.userName.toLowerCase().includes(term)) ||
        (w.email && w.email.toLowerCase().includes(term))
    )
  }, [wallets, search])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(page, totalPages)
  const slice = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage, perPage])

  const stats = useMemo(() => {
    const totalMain = filtered.reduce((s, w) => s + (w.mainBalance || 0), 0)
    const totalBonus = filtered.reduce((s, w) => s + (w.bonusBalance || 0), 0)
    const withBalance = filtered.filter((w) => (w.mainBalance || 0) + (w.bonusBalance || 0) > 0).length
    return {
      totalBalance: totalMain + totalBonus,
      totalWallets: filtered.length,
      activeWallets: withBalance,
    }
  }, [filtered])

  function openAdjust(w) {
    setSelectedWallet(w)
    setAdjustForm({ type: 'credit', amount: '', reason: '' })
    setAdjustOpen(true)
  }

  function handleAdjust(e) {
    e.preventDefault()
    if (!selectedWallet || !adjustForm.amount || Number(adjustForm.amount) <= 0) {
      addToast('Enter a valid amount', 'error')
      return
    }
    const amt = Number(adjustForm.amount)
    if (caps.maxAdjustAmount != null && caps.maxAdjustAmount > 0 && amt > caps.maxAdjustAmount) {
      addToast(`Max adjust per transaction is ₹${caps.maxAdjustAmount.toLocaleString()}`, 'error')
      return
    }
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWallet.id) return w
        const main = w.mainBalance || 0
        const newMain =
          adjustForm.type === 'credit' ? main + amt : Math.max(0, main - amt)
        return { ...w, mainBalance: newMain }
      })
    )
    setAdjustOpen(false)
    setSelectedWallet(null)
    addToast('Balance updated', 'success')
  }

  function handleReset() {
    setSearch('')
    setPage(1)
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'

  return (
    <div className="space-y-0">
      <PageBanner title="Wallets" subtitle="View and manage user balances (INR) – PlayAdd / BetFury" icon={HiCash} />

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
              <p className="text-lg font-bold text-gray-900">{stats.totalWallets}</p>
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
        <span className="text-sm text-gray-500">{total} users</span>
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select
          value={perPage}
          onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
        <button
          type="button"
          onClick={loadWallets}
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
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main (INR)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bonus (INR)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total (INR)</th>
                {canAdjust && (
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {slice.map((w) => {
                const main = w.mainBalance || 0
                const bonus = w.bonusBalance || 0
                const totalRow = main + bonus
                return (
                  <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                          {(w.userName || '?')[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{w.userName}</p>
                          <p className="text-sm text-gray-500">{w.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">{formatInr(main)}</td>
                    <td className="py-4 px-4 text-right font-medium text-amber-600">{formatInr(bonus)}</td>
                    <td className="py-4 px-4 text-right font-semibold text-teal-700">{formatInr(totalRow)}</td>
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
                )
              })}
            </tbody>
          </table>
        </div>

        {total > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-2">
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

      {filtered.length === 0 && (
        <EmptyState
          title="No wallets found"
          message={search ? 'Try a different search.' : 'No user wallets to display.'}
        />
      )}

      {/* Adjust balance modal */}
      <Modal
        open={adjustOpen}
        onClose={() => { setAdjustOpen(false); setSelectedWallet(null); }}
        title={selectedWallet ? `Adjust balance – ${selectedWallet.userName}` : 'Adjust balance'}
        size="md"
      >
        {selectedWallet && (
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-medium">Current balance</p>
              <p className="text-xl font-bold text-teal-600">{formatInr(selectedWallet.mainBalance)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                value={adjustForm.type}
                onChange={(e) => setAdjustForm((f) => ({ ...f, type: e.target.value }))}
                className={inputClass}
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (INR)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
              <input
                type="text"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Bonus, correction"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setAdjustOpen(false); setSelectedWallet(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600"
              >
                Apply
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
