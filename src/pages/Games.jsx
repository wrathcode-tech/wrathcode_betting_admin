/**
 * Games – Game library from GET /api/v1/master/games. Grid/list view, search, filters, pagination.
 */
import { useState, useEffect, useCallback } from 'react'
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
  HiChevronLeft,
  HiChevronRight,
  HiRefresh,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import AuthService from '../api/services/AuthService'

const CATEGORY_STYLES = {
  Card: 'bg-teal-100 text-teal-700',
  Casino: 'bg-indigo-100 text-indigo-700',
  Sports: 'bg-amber-100 text-amber-700',
  Crash: 'bg-rose-100 text-rose-700',
  Live: 'bg-violet-100 text-violet-700',
  slots: 'bg-indigo-100 text-indigo-700',
  crash: 'bg-rose-100 text-rose-700',
}

function getCategoryStyle(cat) {
  const c = (cat || '').toLowerCase()
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES[c] || 'bg-gray-100 text-gray-700'
}

function getCategoryLabel(game) {
  const cat = game.category
  if (Array.isArray(cat) && cat[0]) return cat[0].name || cat[0].code || '–'
  return cat?.name || cat?.code || cat || '–'
}

const DEBOUNCE_MS = 400
const CATEGORY_OPTIONS = ['All', 'slots', 'crash', 'Card', 'Casino', 'Sports', 'Crash', 'Live']

export default function Games() {
  const { user, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const [games, setGames] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [viewMode, setViewMode] = useState('grid')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { addToast } = useToast()

  const fetchGames = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit }
    if (searchTerm.trim()) params.search = searchTerm.trim()
    if (statusFilter) params.status = statusFilter
    if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter
    if (sortBy) params.sortBy = sortBy
    if (sortOrder) params.sortOrder = sortOrder
    AuthService.getMasterGames(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setGames(res.data.games || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setGames([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load games')
        }
      })
      .catch(() => {
        setGames([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load games')
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter, categoryFilter, sortBy, sortOrder])

  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const total = pagination.total

  const stats = {
    total,
    live: games.filter((g) => g.status === 'active').length,
    categories: [...new Set(games.map((g) => getCategoryLabel(g)).filter(Boolean))].length,
    totalPlayers: games.reduce((s, g) => s + Number(g.playCount || 0), 0),
  }

  function openAdd() {
    addToast('Add game API not implemented', 'error')
  }

  function openEdit(g) {
    setSelectedGame(g)
    addToast('Edit game API not implemented', 'error')
    setEditOpen(true)
  }

  function openStats(g) {
    setSelectedGame(g)
    setStatsOpen(true)
  }

  function handleDelete(id) {
    addToast('Delete game API not implemented', 'error')
    setDeleteConfirm(null)
  }

  const btnPrimary =
    'px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-colors'
  const btnSecondary =
    'px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none'

  return (
    <div className="space-y-0">
      <PageBanner title="Games" subtitle="Manage your game library — view and filter games" icon={HiCollection} />

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
              <p className="text-lg font-bold text-gray-900">{loading ? '…' : stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HiStatusOnline className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active (page)</p>
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
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories (page)</p>
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
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Play Count (page)</p>
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
          <span className="text-sm text-gray-500">{loading ? '…' : `${total} games`}</span>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by game name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const v = e.target.value
              if (v) {
                const [s, o] = v.split('-')
                setSortBy(s)
                setSortOrder(o)
              } else {
                setSortBy('')
                setSortOrder('asc')
              }
            }}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="">Sort</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
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
          <button
            type="button"
            onClick={fetchGames}
            className="p-2.5 rounded-xl bg-teal-500 text-white hover:bg-teal-600"
            title="Refresh"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
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

      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading games…</div>
      ) : error ? (
        <div className="py-12 text-center text-red-600 text-sm">{error}</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((g) => (
            <div
              key={g._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              {g.thumbnail && (
                <div className="aspect-video bg-gray-100">
                  <img src={g.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{g.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{g.providerName || g.providerCode || '–'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${getCategoryStyle(getCategoryLabel(g))}`}>
                        {getCategoryLabel(g)}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                          g.status === 'active' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {g.status === 'active' ? 'Active' : g.status || '–'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-gray-600">
                  <HiUserGroup className="w-4 h-4 text-gray-400" />
                  {(g.playCount ?? 0).toLocaleString('en-IN')} plays
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(g)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-1.5"
                  >
                    <HiPencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openStats(g)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-teal-200 text-teal-600 hover:bg-teal-50 flex items-center justify-center gap-1.5"
                  >
                    <HiChartBar className="w-4 h-4" /> Stats
                  </button>
                </div>
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
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Play Count</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {g.thumbnail && (
                        <img src={g.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      )}
                      <span className="font-medium text-gray-900">{g.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-gray-500">{g.providerName || g.providerCode || '–'}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getCategoryStyle(getCategoryLabel(g))}`}>
                      {getCategoryLabel(g)}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-gray-600">{(g.playCount ?? 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        g.status === 'active' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {g.status === 'active' ? 'Active' : g.status || '–'}
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
                        onClick={() => setDeleteConfirm({ id: g._id, name: g.name })}
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

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1"
            >
              <HiChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-1"
            >
              Next <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <EmptyState
          title="No games found"
          message={searchTerm || statusFilter || categoryFilter !== 'All' ? 'Try changing search or filters.' : 'No games to display.'}
          action={<button type="button" onClick={() => { setSearchInput(''); setStatusFilter(''); setCategoryFilter('All'); setPage(1); }} className={btnSecondary}>Clear filters</button>}
        />
      )}

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelectedGame(null); }} title="Edit Game">
        {selectedGame && (
          <p className="text-gray-500 text-sm">Edit game API not implemented. Game: {selectedGame.name}</p>
        )}
      </Modal>

      <Modal open={statsOpen} onClose={() => { setStatsOpen(false); setSelectedGame(null); }} title={selectedGame ? `${selectedGame.name} – Stats` : 'Game Stats'} size="md">
        {selectedGame && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500">Play Count</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{(selectedGame.playCount ?? 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-400">Status</p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">{selectedGame.status || '–'}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-400">Last Synced</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {selectedGame.lastSyncedAt ? new Date(selectedGame.lastSyncedAt).toLocaleString() : '–'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete game?"
        message={deleteConfirm ? `Remove "${deleteConfirm.name}"? (API not implemented)` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
