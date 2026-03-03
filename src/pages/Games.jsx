/**
 * Games – Teal banner, summary cards, Game Library (grid/list), search & category filter.
 * Data from getGames(); add/edit/delete update local state. Easy to understand at a glance.
 */
import { useState, useMemo, useEffect } from 'react'
import {
  HiOutlinePlus,
  HiSearch,
  HiPencil,
  HiChartBar,
  HiViewGrid,
  HiViewList,
  HiCollection,
  HiUserGroup,
  HiStatusOnline,
  HiTag,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { getGames } from '../services/api'

const CURRENCY = 'INR'
function formatInr(n) {
  return `${CURRENCY === 'INR' ? '₹' : ''}${Number(n || 0).toLocaleString('en-IN')}`
}

const CATEGORY_STYLES = {
  Card: 'bg-teal-100 text-teal-700',
  Casino: 'bg-indigo-100 text-indigo-700',
  Sports: 'bg-amber-100 text-amber-700',
  Crash: 'bg-rose-100 text-rose-700',
  Live: 'bg-violet-100 text-violet-700',
}

function getCategoryStyle(cat) {
  return CATEGORY_STYLES[cat] || 'bg-gray-100 text-gray-700'
}

export default function Games() {
  const { user, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const [games, setGames] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState({
    name: '',
    provider: 'In-house',
    category: 'Card',
    minBet: '',
    maxBet: '',
    houseEdge: '',
    status: 'live',
  })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const { addToast } = useToast()

  useEffect(() => {
    getGames().then((r) => setGames(Array.isArray(r.data) ? r.data : []))
  }, [])

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchSearch = !search.trim() || (g.name && g.name.toLowerCase().includes(search.toLowerCase()))
      const matchCat = categoryFilter === 'All' || (g.category === categoryFilter)
      return matchSearch && matchCat
    })
  }, [games, search, categoryFilter])

  const categories = useMemo(() => {
    const set = new Set(games.map((g) => g.category).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [games])

  const stats = useMemo(() => {
    const live = games.filter((g) => (g.status || g.enabled === true) && (g.status !== 'maintenance')).length
    const catSet = new Set(games.map((g) => g.category).filter(Boolean))
    const totalPlayers = games.reduce((s, g) => s + (Number(g.activePlayers) || 0), 0)
    return {
      total: games.length,
      live,
      categories: catSet.size,
      totalPlayers,
    }
  }, [games])

  function openAdd() {
    setForm({
      name: '',
      provider: 'In-house',
      category: 'Card',
      minBet: '',
      maxBet: '',
      houseEdge: '',
      status: 'live',
    })
    setAddOpen(true)
  }

  function openEdit(g) {
    setSelectedGame(g)
    setForm({
      name: g.name || '',
      provider: g.provider || 'In-house',
      category: g.category || 'Card',
      minBet: g.minBet != null ? String(g.minBet) : '',
      maxBet: g.maxBet != null ? String(g.maxBet) : '',
      houseEdge: g.houseEdge != null ? String(g.houseEdge) : '',
      status: g.status || (g.enabled === false ? 'maintenance' : 'live'),
    })
    setEditOpen(true)
  }

  function openStats(g) {
    setSelectedGame(g)
    setStatsOpen(true)
  }

  function handleAddSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      addToast('Game name is required', 'error')
      return
    }
    const min = Number(form.minBet) || 0
    const max = Number(form.maxBet) || 0
    const edge = Number(form.houseEdge) || 0
    const newId = Math.max(0, ...games.map((x) => x.id)) + 1
    setGames((prev) => [
      ...prev,
      {
        id: newId,
        name: form.name.trim(),
        provider: form.provider || 'In-house',
        category: form.category || 'Card',
        minBet: min,
        maxBet: max,
        houseEdge: edge,
        enabled: form.status === 'live',
        status: form.status,
        activePlayers: 0,
      },
    ])
    setAddOpen(false)
    addToast('Game added successfully', 'success')
  }

  function handleEditSubmit(e) {
    e.preventDefault()
    if (!selectedGame) return
    const min = Number(form.minBet) || 0
    const max = Number(form.maxBet) || 0
    const edge = Number(form.houseEdge) || 0
    setGames((prev) =>
      prev.map((g) =>
        g.id === selectedGame.id
          ? {
              ...g,
              name: form.name.trim(),
              provider: form.provider || 'In-house',
              category: form.category || 'Card',
              minBet: min,
              maxBet: max,
              houseEdge: edge,
              enabled: form.status === 'live',
              status: form.status,
            }
          : g
      )
    )
    setEditOpen(false)
    setSelectedGame(null)
    addToast('Game updated successfully', 'success')
  }

  function handleDelete(id) {
    setGames((prev) => prev.filter((g) => g.id !== id))
    setDeleteConfirm(null)
    addToast('Game removed', 'success')
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'
  const btnPrimary =
    'px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors'
  const btnSecondary =
    'px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors'

  return (
    <div className="space-y-0">
      <PageBanner title="Games" subtitle="Manage your game library — enable, edit limits, and view stats – PlayAdd / BetFury" icon={HiCollection} />

      {user?.role === 'sub_admin' && caps.maxGameExposure != null && caps.maxGameExposure > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          Your max game exposure for assigned users: <strong>₹{Number(caps.maxGameExposure).toLocaleString()}</strong>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <HiCollection className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Games</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HiStatusOnline className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Now</p>
              <p className="text-lg font-bold text-gray-900">{stats.live}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HiTag className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</p>
              <p className="text-lg font-bold text-gray-900">{stats.categories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <HiUserGroup className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Players</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalPlayers.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Library section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiCollection className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Game Library</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={openAdd} className={`flex items-center gap-2 ${btnPrimary}`}>
            <HiOutlinePlus className="w-5 h-5" />
            Add Game
          </button>
          <span className="text-sm text-gray-500">{filtered.length} games</span>
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
            placeholder="Search by game name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{g.name}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{g.provider}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${getCategoryStyle(g.category)}`}>
                      {g.category}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                        (g.status === 'live' || g.enabled === true) && g.status !== 'maintenance'
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {(g.status === 'live' || g.enabled === true) && g.status !== 'maintenance' ? 'Live' : 'Maintenance'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>Bet: {formatInr(g.minBet)} – {formatInr(g.maxBet)}</p>
                <p className="flex items-center gap-1">
                  <HiUserGroup className="w-4 h-4 text-gray-400" />
                  {(g.activePlayers ?? 0).toLocaleString('en-IN')} playing
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(g)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HiPencil className="w-4 h-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => openStats(g)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-teal-200 text-teal-600 hover:bg-teal-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HiChartBar className="w-4 h-4" /> Stats
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Game</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Provider</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Category</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Bet range</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Players</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5 text-gray-900 font-medium">{g.name}</td>
                  <td className="py-4 px-5 text-gray-500">{g.provider}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryStyle(g.category)}`}>
                      {g.category}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-gray-600 text-sm">
                    {formatInr(g.minBet)} – {formatInr(g.maxBet)}
                  </td>
                  <td className="py-4 px-5 text-gray-600">{(g.activePlayers ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        (g.status === 'live' || g.enabled === true) && g.status !== 'maintenance'
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {(g.status === 'live' || g.enabled === true) && g.status !== 'maintenance' ? 'Live' : 'Maintenance'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(g)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50" title="Edit">
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => openStats(g)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200" title="Stats">
                        <HiChartBar className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ id: g.id, name: g.name })}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          title="No games found"
          message={games.length === 0 ? 'Add your first game to get started.' : 'Try changing search or category filter.'}
          action={games.length === 0 ? <button type="button" onClick={openAdd} className={btnPrimary}>Add Game</button> : undefined}
        />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Game">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Game Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Teen Patti"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
            <input
              type="text"
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              className={inputClass}
              placeholder="In-house"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputClass}
            >
              <option value="Card">Card</option>
              <option value="Casino">Casino</option>
              <option value="Sports">Sports</option>
              <option value="Crash">Crash</option>
              <option value="Live">Live</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min bet (₹)</label>
              <input
                type="number"
                min="0"
                value={form.minBet}
                onChange={(e) => setForm((f) => ({ ...f, minBet: e.target.value }))}
                className={inputClass}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max bet (₹)</label>
              <input
                type="number"
                min="0"
                value={form.maxBet}
                onChange={(e) => setForm((f) => ({ ...f, maxBet: e.target.value }))}
                className={inputClass}
                placeholder="50000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">House edge (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.houseEdge}
              onChange={(e) => setForm((f) => ({ ...f, houseEdge: e.target.value }))}
              className={inputClass}
              placeholder="2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              <option value="live">Live</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className={btnPrimary}>Add Game</button>
            <button type="button" onClick={() => setAddOpen(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelectedGame(null); }} title="Edit Game">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Game Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
            <input type="text" value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
              <option value="Card">Card</option>
              <option value="Casino">Casino</option>
              <option value="Sports">Sports</option>
              <option value="Crash">Crash</option>
              <option value="Live">Live</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min bet (₹)</label>
              <input type="number" min="0" value={form.minBet} onChange={(e) => setForm((f) => ({ ...f, minBet: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max bet (₹)</label>
              <input type="number" min="0" value={form.maxBet} onChange={(e) => setForm((f) => ({ ...f, maxBet: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">House edge (%)</label>
            <input type="number" step="0.1" min="0" value={form.houseEdge} onChange={(e) => setForm((f) => ({ ...f, houseEdge: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              <option value="live">Live</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className={btnPrimary}>Save</button>
            <button type="button" onClick={() => { setEditOpen(false); setSelectedGame(null); }} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={statsOpen} onClose={() => { setStatsOpen(false); setSelectedGame(null); }} title={selectedGame ? `${selectedGame.name} – Stats` : 'Game Stats'} size="md">
        {selectedGame && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500">Total Plays</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">12,847</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-400">Active Players</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{(selectedGame.activePlayers ?? 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-400">Revenue (7d)</p>
                <p className="text-lg font-semibold text-emerald-600 mt-0.5">₹48,291</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-400">RTP</p>
                <p className="text-lg font-semibold text-teal-600 mt-0.5">{selectedGame.houseEdge != null ? `${100 - Number(selectedGame.houseEdge)}%` : '—'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Last 7 days • Demo data</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete game?"
        message={deleteConfirm ? `Remove "${deleteConfirm.name}"?` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
