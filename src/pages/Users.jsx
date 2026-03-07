/**
 * User List – table (EMAIL, MOBILE, NAME, UUID, STATUS, REFERRAL CODE, CREATED, ACTIONS).
 * Data from GET /api/v1/master/users with pagination and filters.
 */
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiUser,
  HiUserGroup,
  HiSearch,
  HiRefresh,
  HiEye,
  HiLockClosed,
  HiChevronLeft,
  HiChevronRight as HiNext,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

function formatCreatedAt(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${day}/${month}/${year}, ${String(h).padStart(2, '0')}:${m} ${ampm}`
}

const statusVariant = (s) => (s === 'active' ? 'success' : s === 'banned' ? 'error' : s === 'pending' ? 'warning' : 'neutral')

/** Normalize API user to include id and status for table/actions */
function normalizeUser(u) {
  if (!u) return u
  return {
    ...u,
    id: u._id ?? u.id,
    name: u.fullName ?? u.name,
    phone: u.mobile ? (u.countryCode ? `${u.countryCode} ${u.mobile}` : u.mobile) : undefined,
    status: u.accountStatus ?? u.status,
  }
}

const DEBOUNCE_MS = 400

export default function Users() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [perPage, setPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [confirmAction, setConfirmAction] = useState(null)
  const { addToast } = useToast()
  const { hasPermission, getSubAdminCapabilities } = useAuth()
  const caps = getSubAdminCapabilities()
  const canManageUserAccounts = hasPermission(PERMISSIONS.EDIT_USERS) || caps.canManageUserAccounts
  const navigate = useNavigate()

  const fetchUsers = useCallback(() => {
    setLoading(true)
    const params = {
      page,
      limit: perPage,
      search: searchTerm.trim() || undefined,
      accountStatus: statusFilter === 'all' ? undefined : statusFilter,
      isActive: statusFilter === 'active' ? true : undefined,
    }
    AuthService.getMasterUsers(params)
      .then((res) => {
        if (res?.success && res?.data) {
          const list = (res.data.users || []).map(normalizeUser)
          setUsers(list)
          setPagination(res.data.pagination || { page: 1, limit: perPage, total: 0, totalPages: 1 })
        } else {
          setUsers([])
          addToast(res?.message || 'Failed to load users', 'error')
        }
      })
      .catch(() => {
        setUsers([])
        addToast('Failed to load users', 'error')
      })
      .finally(() => setLoading(false))
  }, [page, perPage, searchTerm, statusFilter, addToast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput])

  const total = pagination.total
  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)

  const goToUser = (user) => navigate(`/users/${user.id}`)

  const handleFreeze = () => {
    if (!confirmAction) return
    setConfirmAction(null)
    addToast('Freeze user API not implemented', 'error')
  }

  const handleBan = () => {
    if (!confirmAction) return
    setConfirmAction(null)
    addToast('Ban user API not implemented', 'error')
  }

  const handleActivate = () => {
    if (!confirmAction) return
    setConfirmAction(null)
    addToast('Activate user API not implemented', 'error')
  }

  const handleRefresh = () => {
    fetchUsers()
    addToast('List refreshed', 'success')
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <div className="space-y-0">
      <PageBanner title="User List" subtitle="View and manage registered users – PlayAdd / BetFury" icon={HiUser} />

      {/* Card header: User List + total */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiUserGroup className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">User List</span>
        </div>
        <div className="text-sm text-gray-500">{loading ? '…' : `${total} Total`}</div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 py-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email, UUID, mobile, name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
          <option value="frozen">Frozen</option>
        </select>
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
          onClick={handleRefresh}
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">UUID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Referral Code</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    Loading users…
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => goToUser(u)}
                  >
                    <td className="py-3 px-4 text-gray-900 text-sm">{u.email || '–'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{u.phone || u.mobile || '–'}</td>
                    <td className="py-3 px-4 text-gray-900 text-sm">{u.name || u.fullName || '–'}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goToUser(u); }}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm underline focus:outline-none"
                      >
                        {u.uuid || u.id}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(u.status)}>{u.status === 'active' ? 'Active' : u.status === 'pending' ? 'Pending' : u.status || '–'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm font-mono">{u.referralCode || '–'}</td>
                    <td className="py-3 px-4 text-gray-500 text-sm">{formatCreatedAt(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); goToUser(u); }}
                          className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                          title="View"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        {canManageUserAccounts && (
                          <button
                            type="button"
                            onClick={() => {
                              if (u.status === 'active') setConfirmAction({ id: u.id, action: 'freeze', name: u.name || u.fullName })
                              else setConfirmAction({ id: u.id, action: 'activate', name: u.name || u.fullName })
                            }}
                            className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                            title={u.status === 'active' ? 'Lock / Freeze' : 'Activate'}
                          >
                            <HiLockClosed className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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

      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'freeze'} title="Freeze user?" message={confirmAction ? `Freeze "${confirmAction.name}"?` : ''} confirmLabel="Freeze" onConfirm={handleFreeze} onCancel={() => setConfirmAction(null)} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'activate'} title="Activate user?" message={confirmAction ? `Activate "${confirmAction.name}"?` : ''} confirmLabel="Activate" onConfirm={handleActivate} onCancel={() => setConfirmAction(null)} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'ban'} title="Ban user?" message={confirmAction ? `Ban "${confirmAction.name}"? They will not be able to log in.` : ''} confirmLabel="Ban" danger onConfirm={handleBan} onCancel={() => setConfirmAction(null)} />
    </div>
  )
}
