/**
 * Sub Admin Management – assign users to sub-admins; sub-admin sees only assigned users (deposits, withdrawals, etc.).
 * Master admin sees all. Data persisted to localStorage for login-as-sub-admin.
 */
import { useState, useEffect } from 'react'
import {
  HiRefresh,
  HiPlus,
  HiEye,
  HiPencil,
  HiBan,
  HiCheckCircle,
  HiTrash,
  HiUserGroup,
  HiUser,
  HiSearch,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { ROLES } from '../constants/roles'
import { getUsers } from '../services/api'

const ROLE_OPTIONS = [
  { key: ROLES.SUPPORT, label: 'Support' },
  { key: ROLES.FINANCE, label: 'Finance' },
  { key: ROLES.RISK, label: 'Risk' },
  { key: ROLES.ADMIN, label: 'Admin' },
]

const DEFAULT_CAPABILITIES = {
  maxGameExposure: 100000,
  canManageUserAccounts: true,
  canManagePersonalLimits: true,
  canAdjustWallets: true,
  maxAdjustAmount: null, // null = no limit per adjustment
}

const initialSubAdmins = [
  { id: 1, name: 'John Doe', email: 'john@example.com', created: '2025-01-15', status: 'active', roles: ['support'], assignedUserIds: [1, 2, 3, 4, 5], ...DEFAULT_CAPABILITIES },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', created: '2025-01-10', status: 'active', roles: ['finance'], assignedUserIds: [6, 7, 8, 9, 10], ...DEFAULT_CAPABILITIES },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', created: '2024-12-20', status: 'inactive', roles: ['risk'], assignedUserIds: [11, 12, 13], ...DEFAULT_CAPABILITIES },
  { id: 4, name: 'Sarah Lee', email: 'sarah@example.com', created: '2025-02-01', status: 'active', roles: ['support', 'admin'], assignedUserIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], ...DEFAULT_CAPABILITIES },
  { id: 5, name: 'Alex Brown', email: 'alex@example.com', created: '2024-11-05', status: 'active', roles: ['admin'], assignedUserIds: [15, 16, 17, 18, 19, 20], ...DEFAULT_CAPABILITIES },
]

function loadSubAdminsFromStorage(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (_) {}
  return null
}

function saveSubAdminsToStorage(storageKey, list) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list))
  } catch (_) {}
}

export default function SubAdminManagement() {
  const { hasPermission, SUB_ADMINS_KEY } = useAuth()
  const [subAdmins, setSubAdminsState] = useState(initialSubAdmins)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    roles: [],
    assignedUserIds: [],
    maxGameExposure: DEFAULT_CAPABILITIES.maxGameExposure,
    canManageUserAccounts: DEFAULT_CAPABILITIES.canManageUserAccounts,
    canManagePersonalLimits: DEFAULT_CAPABILITIES.canManagePersonalLimits,
    canAdjustWallets: DEFAULT_CAPABILITIES.canAdjustWallets,
    maxAdjustAmount: DEFAULT_CAPABILITIES.maxAdjustAmount,
    password: '',
    confirmPassword: '',
    status: 'active',
  })
  const { addToast } = useToast()

  useEffect(() => {
    const stored = loadSubAdminsFromStorage(SUB_ADMINS_KEY)
    if (stored && stored.length > 0) {
      setSubAdminsState(stored.map((a) => ({ ...DEFAULT_CAPABILITIES, ...a })))
    }
  }, [SUB_ADMINS_KEY])

  useEffect(() => {
    saveSubAdminsToStorage(SUB_ADMINS_KEY, subAdmins)
  }, [SUB_ADMINS_KEY, subAdmins])

  useEffect(() => {
    getUsers().then((r) => setAllUsers(r.data || []))
  }, [])

  function setSubAdmins(updater) {
    setSubAdminsState(updater)
  }

  const canEdit = hasPermission(PERMISSIONS.MANAGE_ROLES) || hasPermission(PERMISSIONS.EDIT_USERS)

  function handleRefresh() {
    setSubAdmins((prev) => [...prev])
    addToast('List refreshed', 'success')
  }

  function handleAddSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Name and email are required', 'error')
      return
    }
    if (form.password && form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error')
      return
    }
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }
    const newAdmin = {
      id: Math.max(0, ...subAdmins.map((a) => a.id)) + 1,
      name: form.name,
      email: form.email,
      created: new Date().toISOString().slice(0, 10),
      status: form.status,
      roles: form.roles.length ? form.roles : ['support'],
      assignedUserIds: Array.isArray(form.assignedUserIds) ? [...form.assignedUserIds] : [],
      maxGameExposure: Number(form.maxGameExposure) || DEFAULT_CAPABILITIES.maxGameExposure,
      canManageUserAccounts: !!form.canManageUserAccounts,
      canManagePersonalLimits: !!form.canManagePersonalLimits,
      canAdjustWallets: !!form.canAdjustWallets,
      maxAdjustAmount: form.maxAdjustAmount != null && form.maxAdjustAmount !== '' ? Number(form.maxAdjustAmount) : null,
    }
    setSubAdmins((prev) => [newAdmin, ...prev])
    setAddModalOpen(false)
    setForm({
      name: '', email: '', roles: [], assignedUserIds: [],
      maxGameExposure: DEFAULT_CAPABILITIES.maxGameExposure,
      canManageUserAccounts: DEFAULT_CAPABILITIES.canManageUserAccounts,
      canManagePersonalLimits: DEFAULT_CAPABILITIES.canManagePersonalLimits,
      canAdjustWallets: DEFAULT_CAPABILITIES.canAdjustWallets,
      maxAdjustAmount: DEFAULT_CAPABILITIES.maxAdjustAmount,
      password: '', confirmPassword: '', status: 'active',
    })
    addToast('Sub admin created successfully', 'success')
  }

  function toggleRole(key) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(key) ? f.roles.filter((r) => r !== key) : [...f.roles, key],
    }))
  }

  function toggleStatus(admin) {
    if (!canEdit) return
    setSubAdmins((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a))
    )
    addToast(`Sub admin ${admin.status === 'active' ? 'disabled' : 'activated'}`, 'success')
  }

  function handleDelete(id) {
    setSubAdmins((prev) => prev.filter((a) => a.id !== id))
    setDeleteConfirm(null)
    addToast('Sub admin removed', 'success')
  }

  function openView(admin) {
    setSelectedAdmin(admin)
    setViewModalOpen(true)
  }

  function openEdit(admin) {
    setSelectedAdmin(admin)
    setForm({
      name: admin.name,
      email: admin.email,
      roles: admin.roles || [],
      assignedUserIds: Array.isArray(admin.assignedUserIds) ? [...admin.assignedUserIds] : [],
      maxGameExposure: admin.maxGameExposure ?? DEFAULT_CAPABILITIES.maxGameExposure,
      canManageUserAccounts: admin.canManageUserAccounts !== false,
      canManagePersonalLimits: admin.canManagePersonalLimits !== false,
      canAdjustWallets: admin.canAdjustWallets !== false,
      maxAdjustAmount: admin.maxAdjustAmount ?? DEFAULT_CAPABILITIES.maxAdjustAmount,
      password: '',
      confirmPassword: '',
      status: admin.status,
    })
    setEditModalOpen(true)
  }

  function toggleAssignedUser(userId) {
    setForm((f) => ({
      ...f,
      assignedUserIds: f.assignedUserIds.includes(userId)
        ? f.assignedUserIds.filter((id) => id !== userId)
        : [...f.assignedUserIds, userId],
    }))
  }

  function selectAllUsers() {
    const ids = filteredUserList.map((u) => u.id)
    setForm((f) => ({ ...f, assignedUserIds: ids }))
  }

  function clearAssignedUsers() {
    setForm((f) => ({ ...f, assignedUserIds: [] }))
  }

  const filteredUserList = allUsers.filter(
    (u) =>
      !userSearch.trim() ||
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (String(u.id).includes(userSearch))
  )

  function handleEditSubmit(e) {
    e.preventDefault()
    if (!selectedAdmin) return
    setSubAdmins((prev) =>
      prev.map((a) =>
        a.id === selectedAdmin.id
          ? {
              ...a,
              name: form.name,
              email: form.email,
              roles: form.roles,
              status: form.status,
              assignedUserIds: Array.isArray(form.assignedUserIds) ? [...form.assignedUserIds] : [],
              maxGameExposure: Number(form.maxGameExposure) || DEFAULT_CAPABILITIES.maxGameExposure,
              canManageUserAccounts: !!form.canManageUserAccounts,
              canManagePersonalLimits: !!form.canManagePersonalLimits,
              canAdjustWallets: !!form.canAdjustWallets,
              maxAdjustAmount: form.maxAdjustAmount != null && form.maxAdjustAmount !== '' ? Number(form.maxAdjustAmount) : null,
            }
          : a
      )
    )
    setEditModalOpen(false)
    setSelectedAdmin(null)
    addToast('Sub admin updated', 'success')
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'

  return (
    <div className="space-y-6">
      <PageBanner
        title="Sub Admin Management"
        subtitle="Manage sub-admin accounts and permissions – PlayAdd / BetFury"
        icon={HiUserGroup}
      />
      {/* Teal card + Add button row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-200 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white/80 text-teal-600 hover:bg-white transition-colors"
            title="Refresh"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
          <span className="font-medium text-gray-800">Sub Admin Management</span>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors"
          >
            <HiPlus className="w-5 h-5" />
            Add Sub Admin
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Users</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5 font-medium text-gray-900">{admin.name}</td>
                  <td className="py-4 px-5 text-gray-600">{admin.email}</td>
                  <td className="py-4 px-5 text-gray-500 text-sm">{admin.created}</td>
                  <td className="py-4 px-5 text-gray-600 text-sm">
                    {(admin.assignedUserIds || []).length > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <HiUser className="w-4 h-4 text-teal-500" />
                        {(admin.assignedUserIds || []).length} user(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openView(admin)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(admin)}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(admin)}
                            className="p-2 rounded-lg transition-colors"
                            title={admin.status === 'active' ? 'Disable' : 'Activate'}
                          >
                            {admin.status === 'active' ? (
                              <HiBan className="w-5 h-5 text-red-500 hover:bg-red-50" />
                            ) : (
                              <HiCheckCircle className="w-5 h-5 text-emerald-500 hover:bg-emerald-50" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(admin)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub Admin Modal – scrollable, improved layout */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Sub Admin" size="lg" scrollable>
        <form onSubmit={handleAddSubmit} className="space-y-6 pb-2">
          {/* Basic info */}
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-teal-500" /> Basic info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roles (select multiple)</label>
              <div className="flex flex-wrap gap-3">
                {ROLE_OPTIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                    <input type="checkbox" checked={form.roles.includes(key)} onChange={() => toggleRole(key)} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Assign Users */}
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-teal-500" /> Assign users
            </h4>
            <p className="text-xs text-gray-500">Sub-admin will only see and manage these users (deposits, withdrawals, gaming, etc.).</p>
            <div className="relative rounded-xl bg-white border border-gray-200 overflow-hidden">
              <HiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name, email, ID..." className="w-full pl-9 pr-4 py-2.5 text-sm border-0 focus:ring-0 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={selectAllUsers} className="text-xs font-medium text-teal-600 hover:text-teal-700 px-2 py-1 rounded-lg hover:bg-teal-50">Select all</button>
              <button type="button" onClick={clearAssignedUsers} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100">Clear</button>
              {form.assignedUserIds.length > 0 && <span className="text-xs text-teal-600 font-medium ml-auto">{form.assignedUserIds.length} selected</span>}
            </div>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 space-y-0.5 scrollbar-thin">
              {filteredUserList.slice(0, 50).map((u) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-teal-50/50 p-2 rounded-lg transition-colors">
                  <input type="checkbox" checked={form.assignedUserIds.includes(u.id)} onChange={() => toggleAssignedUser(u.id)} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-800 truncate flex-1">{u.name || u.email || `User #${u.id}`}</span>
                  <span className="text-xs text-gray-500">#{u.id}</span>
                </label>
              ))}
              {filteredUserList.length > 50 && <p className="text-xs text-gray-500 px-2 py-1.5 border-t border-gray-100">+ {filteredUserList.length - 50} more (use search)</p>}
            </div>
          </section>

          {/* Capabilities & limits */}
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-teal-500" /> Capabilities & limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max game exposure (₹)</label>
                <input type="number" min={0} value={form.maxGameExposure} onChange={(e) => setForm((f) => ({ ...f, maxGameExposure: e.target.value }))} placeholder="100000" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max wallet adjust per tx (₹)</label>
                <input type="number" min={0} value={form.maxAdjustAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, maxAdjustAmount: e.target.value === '' ? null : e.target.value }))} placeholder="No limit" className={inputClass} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                <input type="checkbox" checked={form.canManageUserAccounts} onChange={(e) => setForm((f) => ({ ...f, canManageUserAccounts: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Manage user accounts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                <input type="checkbox" checked={form.canManagePersonalLimits} onChange={(e) => setForm((f) => ({ ...f, canManagePersonalLimits: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Manage personal limits</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                <input type="checkbox" checked={form.canAdjustWallets} onChange={(e) => setForm((f) => ({ ...f, canAdjustWallets: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Adjust wallets</span>
              </label>
            </div>
          </section>

          {/* Security & status */}
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-teal-500" /> Security & status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Re-enter password" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={`${inputClass} max-w-xs`}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm">
              Create Sub Admin
            </button>
          </div>
        </form>
      </Modal>

      {/* View modal (simple) */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Sub Admin Details" size="sm">
        {selectedAdmin && (
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Name</span> {selectedAdmin.name}</p>
            <p><span className="text-gray-500">Email</span> {selectedAdmin.email}</p>
            <p><span className="text-gray-500">Created</span> {selectedAdmin.created}</p>
            <p><span className="text-gray-500">Status</span> <span className="capitalize">{selectedAdmin.status}</span></p>
            <p><span className="text-gray-500">Roles</span> {(selectedAdmin.roles || []).join(', ')}</p>
            <p><span className="text-gray-500">Assigned Users</span> {(selectedAdmin.assignedUserIds || []).length} user(s)</p>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="text-gray-500 font-medium mb-1">Capabilities</p>
              <p>Max game exposure: ₹{(selectedAdmin.maxGameExposure ?? 100000).toLocaleString()}</p>
              <p>Manage user accounts: {selectedAdmin.canManageUserAccounts !== false ? 'Yes' : 'No'}</p>
              <p>Manage personal limits: {selectedAdmin.canManagePersonalLimits !== false ? 'Yes' : 'No'}</p>
              <p>Adjust wallets: {selectedAdmin.canAdjustWallets !== false ? 'Yes' : 'No'}</p>
              {selectedAdmin.maxAdjustAmount != null && selectedAdmin.maxAdjustAmount > 0 && <p>Max adjust per tx: ₹{Number(selectedAdmin.maxAdjustAmount).toLocaleString()}</p>}
            </div>
            {(selectedAdmin.assignedUserIds || []).length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Can only view/manage:</p>
                <div className="flex flex-wrap gap-1">
                  {allUsers.filter((u) => (selectedAdmin.assignedUserIds || []).includes(u.id)).map((u) => (
                    <span key={u.id} className="inline-flex items-center px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-xs">{u.name || u.email || u.id}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit modal – scrollable, same layout as Add */}
      <Modal open={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedAdmin(null); }} title="Edit Sub Admin" size="lg" scrollable>
        <form onSubmit={handleEditSubmit} className="space-y-6 pb-2">
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2"><span className="w-1 h-4 rounded-full bg-teal-500" /> Basic info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
              <div className="flex flex-wrap gap-3">
                {ROLE_OPTIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                    <input type="checkbox" checked={form.roles.includes(key)} onChange={() => toggleRole(key)} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2"><span className="w-1 h-4 rounded-full bg-teal-500" /> Assign users</h4>
            <div className="relative rounded-xl bg-white border border-gray-200 overflow-hidden">
              <HiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name, email, ID..." className="w-full pl-9 pr-4 py-2.5 text-sm border-0 focus:ring-0 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={selectAllUsers} className="text-xs font-medium text-teal-600 hover:text-teal-700 px-2 py-1 rounded-lg hover:bg-teal-50">Select all</button>
              <button type="button" onClick={clearAssignedUsers} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100">Clear</button>
              {form.assignedUserIds.length > 0 && <span className="text-xs text-teal-600 font-medium ml-auto">{form.assignedUserIds.length} selected</span>}
            </div>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 space-y-0.5">
              {filteredUserList.slice(0, 50).map((u) => (
                <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-teal-50/50 p-2 rounded-lg transition-colors">
                  <input type="checkbox" checked={form.assignedUserIds.includes(u.id)} onChange={() => toggleAssignedUser(u.id)} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-800 truncate flex-1">{u.name || u.email || `User #${u.id}`}</span>
                  <span className="text-xs text-gray-500">#{u.id}</span>
                </label>
              ))}
              {filteredUserList.length > 50 && <p className="text-xs text-gray-500 px-2 py-1.5 border-t border-gray-100">+ {filteredUserList.length - 50} more</p>}
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2"><span className="w-1 h-4 rounded-full bg-teal-500" /> Capabilities & limits</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Max game exposure (₹)</label><input type="number" min={0} value={form.maxGameExposure} onChange={(e) => setForm((f) => ({ ...f, maxGameExposure: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Max wallet adjust per tx (₹)</label><input type="number" min={0} value={form.maxAdjustAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, maxAdjustAmount: e.target.value === '' ? null : e.target.value }))} placeholder="No limit" className={inputClass} /></div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                <input type="checkbox" checked={form.canManageUserAccounts} onChange={(e) => setForm((f) => ({ ...f, canManageUserAccounts: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Manage user accounts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                <input type="checkbox" checked={form.canManagePersonalLimits} onChange={(e) => setForm((f) => ({ ...f, canManagePersonalLimits: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Manage personal limits</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                <input type="checkbox" checked={form.canAdjustWallets} onChange={(e) => setForm((f) => ({ ...f, canAdjustWallets: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Adjust wallets</span>
              </label>
            </div>
          </section>
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-3"><span className="w-1 h-4 rounded-full bg-teal-500" /> Status</h4>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={`${inputClass} max-w-xs`}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </section>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => { setEditModalOpen(false); setSelectedAdmin(null); }} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Sub Admin?"
        message={deleteConfirm ? `Remove "${deleteConfirm.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
