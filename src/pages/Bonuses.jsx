/**
 * Bonuses – Teal banner, summary cards, Bonus Campaigns grid/table, search & filters.
 * Data from getBonuses() + getBonusAnalytics(). Easy to understand at a glance.
 */
import { useState, useMemo, useEffect } from 'react'
import {
  HiOutlinePlus,
  HiSearch,
  HiPencil,
  HiTrash,
  HiGift,
  HiTicket,
  HiCollection,
  HiStatusOnline,
  HiCurrencyRupee,
  HiTrendingUp,
  HiViewGrid,
  HiViewList,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getBonuses, getBonusAnalytics } from '../services/api'

const BONUS_TYPES = ['First Deposit', 'Reload', 'Free Spins', 'Cashback', 'Referral', 'Promo Code']
const TYPE_MAP = {
  first_deposit: 'First Deposit',
  reload: 'Reload',
  free_spins: 'Free Spins',
  cashback: 'Cashback',
  referral: 'Referral',
  promo: 'Promo Code',
}
const TYPE_STYLES = {
  'First Deposit': 'bg-teal-100 text-teal-700',
  Reload: 'bg-indigo-100 text-indigo-700',
  'Free Spins': 'bg-amber-100 text-amber-700',
  Cashback: 'bg-emerald-100 text-emerald-700',
  Referral: 'bg-violet-100 text-violet-700',
  'Promo Code': 'bg-rose-100 text-rose-700',
}

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function normalizeBonus(b) {
  const type = TYPE_MAP[b.type] || b.type || 'Promo Code'
  const status = (b.status === 'expired' || b.status === 'Expired') ? 'Expired' : 'Active'
  return {
    ...b,
    type,
    status,
    endDate: b.expiry || b.endDate || '',
    startDate: b.startDate || '',
  }
}

export default function Bonuses() {
  const [bonuses, setBonuses] = useState([])
  const [analytics, setAnalytics] = useState({ totalClaimed: 0, totalWagered: 0, activeCampaigns: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingBonus, setEditingBonus] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'First Deposit',
    value: '',
    code: '',
    maxUsage: '',
    startDate: '',
    endDate: '',
    status: 'Active',
  })
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canManage = hasPermission(PERMISSIONS.MANAGE_BONUSES)

  useEffect(() => {
    getBonuses().then((r) => {
      const list = Array.isArray(r.data) ? r.data.map(normalizeBonus) : []
      setBonuses(list)
    })
    getBonusAnalytics().then((r) => {
      setAnalytics(r.data || { totalClaimed: 0, totalWagered: 0, activeCampaigns: 0 })
    })
  }, [])

  const filtered = useMemo(() => {
    return bonuses.filter((b) => {
      const matchSearch =
        !search.trim() ||
        (b.name && b.name.toLowerCase().includes(search.toLowerCase())) ||
        (b.code && b.code.toLowerCase().includes(search.toLowerCase()))
      const matchType = typeFilter === 'All' || b.type === typeFilter
      const matchStatus = statusFilter === 'All' || b.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [bonuses, search, typeFilter, statusFilter])

  const typesForFilter = useMemo(() => ['All', ...BONUS_TYPES], [])

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'
  const btnPrimary =
    'px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors'
  const btnSecondary =
    'px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors'

  function openAdd() {
    setForm({
      name: '',
      type: 'First Deposit',
      value: '',
      code: '',
      maxUsage: '',
      startDate: '',
      endDate: '',
      status: 'Active',
    })
    setAddOpen(true)
  }

  function openEdit(b) {
    setEditingBonus(b)
    setForm({
      name: b.name || '',
      type: b.type || 'First Deposit',
      value: b.value || '',
      code: b.code || '',
      maxUsage: b.maxUsage != null ? String(b.maxUsage) : '',
      startDate: b.startDate || '',
      endDate: b.endDate || b.expiry || '',
      status: b.status || 'Active',
    })
    setEditOpen(true)
  }

  function handleAddSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      addToast('Name is required', 'error')
      return
    }
    const newId = Math.max(0, ...bonuses.map((x) => x.id)) + 1
    setBonuses((prev) => [
      ...prev,
      {
        id: newId,
        name: form.name.trim(),
        type: form.type,
        value: form.value.trim(),
        code: form.code.trim() || null,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
        usage: 0,
        startDate: form.startDate || '',
        endDate: form.endDate || '',
        expiry: form.endDate || null,
        status: form.status,
      },
    ])
    setAddOpen(false)
    addToast('Bonus created', 'success')
  }

  function handleEditSubmit(e) {
    e.preventDefault()
    if (!editingBonus) return
    setBonuses((prev) =>
      prev.map((b) =>
        b.id === editingBonus.id
          ? {
              ...b,
              name: form.name.trim(),
              type: form.type,
              value: form.value.trim(),
              code: form.code.trim() || null,
              maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
              startDate: form.startDate || '',
              endDate: form.endDate || '',
              expiry: form.endDate || null,
              status: form.status,
            }
          : b
      )
    )
    setEditOpen(false)
    setEditingBonus(null)
    addToast('Bonus updated', 'success')
  }

  function handleDelete(id) {
    setBonuses((prev) => prev.filter((b) => b.id !== id))
    setDeleteConfirm(null)
    addToast('Bonus removed', 'success')
  }

  return (
    <div className="space-y-0">
      <PageBanner title="Bonuses" subtitle="Bonus campaigns, promo codes, and rewards — create and manage in one place" icon={HiGift} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <HiCollection className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bonuses</p>
              <p className="text-lg font-bold text-gray-900">{bonuses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HiStatusOnline className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
              <p className="text-lg font-bold text-gray-900">{bonuses.filter((b) => b.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HiTrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Claimed</p>
              <p className="text-lg font-bold text-gray-900">{(analytics.totalClaimed || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <HiCurrencyRupee className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Wagered</p>
              <p className="text-lg font-bold text-gray-900">{formatInr(analytics.totalWagered)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Campaigns section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiGift className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Bonus Campaigns</span>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <button type="button" onClick={openAdd} className={`flex items-center gap-2 ${btnPrimary}`}>
              <HiOutlinePlus className="w-5 h-5" />
              Add Bonus
            </button>
          )}
          <span className="text-sm text-gray-500">{filtered.length} campaigns</span>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or promo code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            {typesForFilter.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`}
              title="Grid"
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`}
              title="List"
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <HiGift className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{b.name}</h3>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-lg text-xs font-medium ${TYPE_STYLES[b.type] || 'bg-gray-100 text-gray-700'}`}>
                      {b.type}
                    </span>
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    b.status === 'Active' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <p className="mt-3 text-teal-600 font-semibold">{b.value}</p>
              {b.code && (
                <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
                  <HiTicket className="w-4 h-4 text-gray-400" />
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{b.code}</code>
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Usage: <span className="font-medium text-gray-700">{b.usage}</span>
                {b.maxUsage != null ? ` / ${b.maxUsage}` : ''}
              </p>
              {b.endDate && <p className="mt-0.5 text-xs text-gray-400">Expires: {b.endDate}</p>}
              {canManage && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <HiPencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ id: b.id, name: b.name })}
                    className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Campaign</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Type</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Value</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Code</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Usage</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Expiry</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                {canManage && <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5 font-medium text-gray-900">{b.name}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${TYPE_STYLES[b.type] || 'bg-gray-100 text-gray-700'}`}>
                      {b.type}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-teal-600 font-medium">{b.value}</td>
                  <td className="py-4 px-5 text-gray-600">{b.code || '—'}</td>
                  <td className="py-4 px-5 text-gray-600">{b.usage}{b.maxUsage != null ? ` / ${b.maxUsage}` : ''}</td>
                  <td className="py-4 px-5 text-gray-500 text-sm">{b.endDate || '—'}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        b.status === 'Active' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEdit(b)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50" title="Edit">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ id: b.id, name: b.name })}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          title="No bonuses found"
          message={bonuses.length === 0 ? 'Create your first bonus campaign to get started.' : 'Try changing search or filters.'}
          action={canManage && bonuses.length === 0 ? <button type="button" onClick={openAdd} className={btnPrimary}>Add Bonus</button> : undefined}
        />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Bonus">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="e.g. Welcome 100%" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputClass}>
              {BONUS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Value (description)</label>
            <input type="text" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className={inputClass} placeholder="e.g. 100% up to ₹5,000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo code (optional)</label>
            <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className={inputClass} placeholder="WELCOME100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max usage (optional)</label>
            <input type="number" min="0" value={form.maxUsage} onChange={(e) => setForm((f) => ({ ...f, maxUsage: e.target.value }))} className={inputClass} placeholder="500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className={btnPrimary}>Create</button>
            <button type="button" onClick={() => setAddOpen(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditingBonus(null); }} title="Edit Bonus">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputClass}>
              {BONUS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Value</label>
            <input type="text" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo code</label>
            <input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max usage</label>
            <input type="number" min="0" value={form.maxUsage} onChange={(e) => setForm((f) => ({ ...f, maxUsage: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className={btnPrimary}>Save</button>
            <button type="button" onClick={() => { setEditOpen(false); setEditingBonus(null); }} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete bonus?"
        message={deleteConfirm ? `Remove "${deleteConfirm.name}"?` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
