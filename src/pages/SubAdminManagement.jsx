/**
 * Sub Admin Management – assign users to sub-admins; sub-admin sees only assigned users (deposits, withdrawals, etc.).
 * Master admin sees all. Data persisted to localStorage for login-as-sub-admin.
 */
import { useState, useEffect, useCallback } from 'react'
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
  HiUserAdd,
  HiUserRemove,
  HiSearch,
  HiX,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { ROLES } from '../constants/roles'
import { getUsers } from '../services/api'
import AuthService from '../api/services/AuthService'

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

const IS_ACTIVE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export default function SubAdminManagement() {
  const { hasPermission, SUB_ADMINS_KEY } = useAuth()
  const [subAdmins, setSubAdminsState] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [isActiveFilter, setIsActiveFilter] = useState('all')
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionId, setActionId] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    branchId: '',
    branchName: '',
    commissionSharing: '',
    roles: [],
    assignedUserIds: [],
    maxGameExposure: DEFAULT_CAPABILITIES.maxGameExposure,
    canManageUserAccounts: DEFAULT_CAPABILITIES.canManageUserAccounts,
    canManagePersonalLimits: DEFAULT_CAPABILITIES.canManagePersonalLimits,
    canAdjustWallets: DEFAULT_CAPABILITIES.canAdjustWallets,
    maxAdjustAmount: DEFAULT_CAPABILITIES.maxAdjustAmount,
    depositManagement: false,
    withdrawalManagement: false,
    userManagement: false,
    accountsManagement: false,
    password: '',
    confirmPassword: '',
    status: 'active',
  })
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignSubAdmin, setAssignSubAdmin] = useState(null)
  const [assignUserList, setAssignUserList] = useState([])
  const [assignUserListLoading, setAssignUserListLoading] = useState(false)
  const [assignSelectedIds, setAssignSelectedIds] = useState([])
  const [assignSearch, setAssignSearch] = useState('')
  const [assignSubmitting, setAssignSubmitting] = useState(false)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [removeSubAdmin, setRemoveSubAdmin] = useState(null)
  const [removeUserList, setRemoveUserList] = useState([])
  const [removeUserListLoading, setRemoveUserListLoading] = useState(false)
  const [removeSelectedIds, setRemoveSelectedIds] = useState([])
  const [removeSubmitting, setRemoveSubmitting] = useState(false)
  const { addToast } = useToast()

  function mapSubAdminFromApi(subAdmin) {
    const created = subAdmin.createdAt
      ? new Date(subAdmin.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
    return {
      id: subAdmin._id,
      name: subAdmin.fullName ?? subAdmin.name,
      email: subAdmin.emailId ?? subAdmin.email,
      mobileNumber: subAdmin.mobileNumber,
      branchId: subAdmin.branchId,
      branchName: subAdmin.branchName,
      created,
      status: subAdmin.isActive !== false ? 'active' : 'inactive',
      roles: ['support'],
      assignedUserIds: Array.isArray(subAdmin.assignedUserIds) ? subAdmin.assignedUserIds : [],
      assignedUsersCount: subAdmin.assignedUsersCount ?? 0,
      commissionSharing: subAdmin.commissionSharing ?? '',
      ...DEFAULT_CAPABILITIES,
      permissions: subAdmin.permissions,
    }
  }

  function emptyAddForm() {
    return {
      name: '',
      email: '',
      mobileNumber: '',
      branchId: '',
      branchName: '',
      commissionSharing: '',
      roles: [],
      assignedUserIds: [],
      maxGameExposure: DEFAULT_CAPABILITIES.maxGameExposure,
      canManageUserAccounts: DEFAULT_CAPABILITIES.canManageUserAccounts,
      canManagePersonalLimits: DEFAULT_CAPABILITIES.canManagePersonalLimits,
      canAdjustWallets: DEFAULT_CAPABILITIES.canAdjustWallets,
      maxAdjustAmount: DEFAULT_CAPABILITIES.maxAdjustAmount,
      depositManagement: false,
      withdrawalManagement: false,
      userManagement: false,
      accountsManagement: false,
      password: '',
      confirmPassword: '',
      status: 'active',
    }
  }

  function setSubAdmins(updater) {
    setSubAdminsState(updater)
  }

  const fetchSubAdmins = useCallback(() => {
    setListLoading(true)
    setListError(null)
    const isActive = isActiveFilter === 'all' ? undefined : isActiveFilter === 'true'
    AuthService.getMasterSubAdmins({ page, limit, isActive })
      .then((res) => {
        if (res?.success && res?.data) {
          const list = (res.data.subAdmins || []).map(mapSubAdminFromApi)
          setSubAdminsState(list)
          setTotal(res.data.total ?? 0)
          setListError(null)
        } else {
          setSubAdminsState([])
          setTotal(0)
          setListError(res?.message || 'Failed to load sub-admins')
        }
      })
      .catch(() => {
        setSubAdminsState([])
        setTotal(0)
        setListError('Failed to load sub-admins')
      })
      .finally(() => setListLoading(false))
  }, [page, limit, isActiveFilter])

  useEffect(() => {
    fetchSubAdmins()
  }, [fetchSubAdmins])

  useEffect(() => {
    if (subAdmins.length > 0) saveSubAdminsToStorage(SUB_ADMINS_KEY, subAdmins)
  }, [SUB_ADMINS_KEY, subAdmins])

  useEffect(() => {
    getUsers().then((r) => setAllUsers(r.data || []))
  }, [])

  const canEdit = hasPermission(PERMISSIONS.MANAGE_ROLES) || hasPermission(PERMISSIONS.EDIT_USERS)

  function handleRefresh() {
    fetchSubAdmins()
    addToast('List refreshed', 'success')
  }

  function handleAddSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      addToast('Full name is required', 'error')
      return
    }
    const mobile = String(form.mobileNumber || '').replace(/\D/g, '')
    if (mobile.length !== 10 || !/^[6-9]/.test(mobile)) {
      addToast('Mobile number must be 10 digits and start with 6–9', 'error')
      return
    }
    if (!form.email.trim()) {
      addToast('Email is required', 'error')
      return
    }
    if (!form.password || form.password.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    setAddSubmitting(true)
    const payload = {
      fullName: form.name.trim(),
      mobileNumber: mobile,
      emailId: form.email.trim(),
      password: form.password,
      branchId: form.branchId?.trim() || undefined,
      branchName: form.branchName?.trim() || undefined,
      commissionSharing: form.commissionSharing !== '' && form.commissionSharing != null ? Number(form.commissionSharing) : undefined,
      permissions: {
        depositManagement: !!form.depositManagement,
        withdrawalManagement: !!form.withdrawalManagement,
        userManagement: !!form.userManagement,
        accountsManagement: !!form.accountsManagement,
      },
    }
    AuthService.postMasterSubAdmin(payload)
      .then((res) => {
        if (res?.success && res?.data?.subAdmin) {
          const newAdmin = mapSubAdminFromApi(res.data.subAdmin)
          setSubAdmins((prev) => [newAdmin, ...prev])
          setAddModalOpen(false)
          setForm(emptyAddForm())
          addToast(res?.message || 'Sub-admin created successfully', 'success')
        } else {
          addToast(res?.message || 'Failed to create sub-admin', 'error')
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create sub-admin'
        addToast(msg, 'error')
      })
      .finally(() => setAddSubmitting(false))
  }

  function toggleRole(key) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(key) ? f.roles.filter((r) => r !== key) : [...f.roles, key],
    }))
  }

  function toggleStatus(admin) {
    if (!canEdit) return
    const newActive = admin.status !== 'active'
    setActionId(admin.id)
    AuthService.patchMasterSubAdminStatus(admin.id, newActive)
      .then((res) => {
        if (res?.success && res?.data?.subAdmin) {
          const updated = mapSubAdminFromApi(res.data.subAdmin)
          setSubAdmins((prev) => prev.map((a) => (a.id === admin.id ? updated : a)))
          addToast(res?.message || `Sub-admin ${newActive ? 'activated' : 'disabled'}`, 'success')
        } else {
          addToast(res?.message || 'Failed to update status', 'error')
        }
      })
      .catch((err) => addToast(err?.response?.data?.message ?? err?.message ?? 'Failed to update status', 'error'))
      .finally(() => setActionId(null))
  }

  function handleDelete(id) {
    if (!id) return
    setActionId(id)
    AuthService.deleteMasterSubAdmin(id)
      .then((res) => {
        if (res?.success) {
          setSubAdmins((prev) => prev.filter((a) => a.id !== id))
          setTotal((t) => Math.max(0, t - 1))
          setDeleteConfirm(null)
          addToast(res?.message || 'Sub-admin deleted', 'success')
        } else {
          addToast(res?.message || 'Failed to delete', 'error')
        }
      })
      .catch((err) => addToast(err?.response?.data?.message ?? err?.message ?? 'Failed to delete', 'error'))
      .finally(() => setActionId(null))
  }

  function openView(admin) {
    setSelectedAdmin(admin)
    setViewModalOpen(true)
  }

  function openEdit(admin) {
    setSelectedAdmin(admin)
    const perms = admin.permissions || {}
    setForm({
      name: admin.name,
      email: admin.email,
      mobileNumber: admin.mobileNumber ?? '',
      branchId: admin.branchId ?? '',
      branchName: admin.branchName ?? '',
      commissionSharing: admin.commissionSharing ?? '',
      roles: admin.roles || [],
      assignedUserIds: Array.isArray(admin.assignedUserIds) ? [...admin.assignedUserIds] : [],
      maxGameExposure: admin.maxGameExposure ?? DEFAULT_CAPABILITIES.maxGameExposure,
      canManageUserAccounts: admin.canManageUserAccounts !== false,
      canManagePersonalLimits: admin.canManagePersonalLimits !== false,
      canAdjustWallets: admin.canAdjustWallets !== false,
      maxAdjustAmount: admin.maxAdjustAmount ?? DEFAULT_CAPABILITIES.maxAdjustAmount,
      depositManagement: !!perms.depositManagement,
      withdrawalManagement: !!perms.withdrawalManagement,
      userManagement: !!perms.userManagement,
      accountsManagement: !!perms.accountsManagement,
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

  function openAssignModal(admin) {
    setAssignSubAdmin(admin)
    setAssignSelectedIds([])
    setAssignSearch('')
    setAssignModalOpen(true)
    setAssignUserListLoading(true)
    setAssignUserList([])
    AuthService.getMasterUnassignedUsers({ page: 1, limit: 500 })
      .then((res) => {
        if (res?.success && res?.data?.users) {
          const list = (res.data.users || []).map((u) => ({
            id: u._id ?? u.id,
            name: u.fullName ?? u.name,
            uuid: u.uuid,
            mobile: u.mobileNumber ?? u.mobile ?? u.phone ?? '',
            branchId: u.branchId ?? '',
          }))
          setAssignUserList(list)
        } else {
          setAssignUserList([])
        }
      })
      .catch(() => setAssignUserList([]))
      .finally(() => setAssignUserListLoading(false))
  }

  function closeAssignModal() {
    setAssignModalOpen(false)
    setAssignSubAdmin(null)
    setAssignUserList([])
    setAssignSelectedIds([])
    setAssignSearch('')
  }

  function openRemoveModal(admin) {
    setRemoveSubAdmin(admin)
    setRemoveSelectedIds([])
    setRemoveModalOpen(true)
    setRemoveUserListLoading(true)
    setRemoveUserList([])
    AuthService.getMasterSubAdminAssignedUsers(admin.id, { page: 1, limit: 100 })
      .then((res) => {
        if (res?.success && res?.data?.users) {
          const list = (res.data.users || []).map((u) => ({
            id: u._id ?? u.id,
            name: u.fullName ?? u.name,
            uuid: u.uuid,
            mobile: u.mobileNumber ?? u.mobile ?? u.phone ?? '',
            branchId: u.branchId ?? '',
          }))
          setRemoveUserList(list)
        } else {
          setRemoveUserList([])
        }
      })
      .catch(() => setRemoveUserList([]))
      .finally(() => setRemoveUserListLoading(false))
  }

  function closeRemoveModal() {
    setRemoveModalOpen(false)
    setRemoveSubAdmin(null)
    setRemoveUserList([])
    setRemoveSelectedIds([])
  }

  function toggleRemoveUser(userId) {
    setRemoveSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  function selectAllRemoveUsers() {
    const list = removeUserList
    const allSelected = list.length > 0 && list.every((u) => removeSelectedIds.includes(u.id))
    if (allSelected) {
      setRemoveSelectedIds([])
    } else {
      setRemoveSelectedIds(list.map((u) => u.id))
    }
  }

  function handleRemoveSubmit(e) {
    e.preventDefault()
    if (!removeSubAdmin || removeSelectedIds.length === 0) {
      addToast('Select at least one user to remove', 'error')
      return
    }
    setRemoveSubmitting(true)
    AuthService.postMasterSubAdminUnassignUsers(removeSubAdmin.id, removeSelectedIds)
      .then((res) => {
        if (res?.success) {
          addToast(res?.message || `${removeSelectedIds.length} user(s) removed from sub-admin`, 'success')
          closeRemoveModal()
          fetchSubAdmins()
        } else {
          addToast(res?.message || 'Failed to remove users', 'error')
        }
      })
      .catch(() => addToast('Failed to remove users', 'error'))
      .finally(() => setRemoveSubmitting(false))
  }

  function toggleAssignUser(userId) {
    setAssignSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  function selectAllAssignUsers() {
    const filtered = assignFilteredUserList
    const allSelected = filtered.length > 0 && filtered.every((u) => assignSelectedIds.includes(u.id))
    if (allSelected) {
      setAssignSelectedIds((prev) => prev.filter((id) => !filtered.some((u) => u.id === id)))
    } else {
      setAssignSelectedIds((prev) => {
        const set = new Set(prev)
        filtered.forEach((u) => set.add(u.id))
        return [...set]
      })
    }
  }

  function handleAssignSubmit(e) {
    e.preventDefault()
    if (!assignSubAdmin || assignSelectedIds.length === 0) {
      addToast('Select at least one user to assign', 'error')
      return
    }
    setAssignSubmitting(true)
    AuthService.postMasterUsersAssignSubAdmin(assignSubAdmin.id, assignSelectedIds)
      .then((res) => {
        if (res?.success) {
          addToast(res?.message || `${assignSelectedIds.length} user(s) assigned successfully`, 'success')
          closeAssignModal()
          fetchSubAdmins()
        } else {
          addToast(res?.message || 'Failed to assign users', 'error')
        }
      })
      .catch(() => addToast('Failed to assign users', 'error'))
      .finally(() => setAssignSubmitting(false))
  }

  const assignFilteredUserList = assignUserList.filter(
    (u) =>
      !assignSearch.trim() ||
      (u.name && String(u.name).toLowerCase().includes(assignSearch.toLowerCase())) ||
      (u.uuid && String(u.uuid).toLowerCase().includes(assignSearch.toLowerCase())) ||
      (u.mobile && String(u.mobile).includes(assignSearch)) ||
      (u.branchId && String(u.branchId).toLowerCase().includes(assignSearch.toLowerCase())) ||
      (u.id && String(u.id).includes(assignSearch))
  )

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
    const payload = {
      fullName: form.name.trim(),
      mobileNumber: form.mobileNumber?.replace(/\D/g, '').slice(0, 10) || undefined,
      emailId: form.email.trim(),
      branchId: form.branchId?.trim() || undefined,
      branchName: form.branchName?.trim() || undefined,
      commissionSharing: form.commissionSharing !== '' && form.commissionSharing != null ? Number(form.commissionSharing) : undefined,
      permissions: {
        depositManagement: !!form.depositManagement,
        withdrawalManagement: !!form.withdrawalManagement,
        userManagement: !!form.userManagement,
        accountsManagement: !!form.accountsManagement,
      },
    }
    if (form.password && form.password.length >= 8) payload.password = form.password
    setEditSubmitting(true)
    AuthService.patchMasterSubAdmin(selectedAdmin.id, payload)
      .then((res) => {
        if (res?.success && res?.data?.subAdmin) {
          const updated = mapSubAdminFromApi(res.data.subAdmin)
          setSubAdmins((prev) => prev.map((a) => (a.id === selectedAdmin.id ? updated : a)))
          setEditModalOpen(false)
          setSelectedAdmin(null)
          addToast(res?.message || 'Sub-admin updated', 'success')
        } else {
          addToast(res?.message || 'Failed to update', 'error')
        }
      })
      .catch((err) => addToast(err?.response?.data?.message ?? err?.message ?? 'Failed to update', 'error'))
      .finally(() => setEditSubmitting(false))
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'

  return (
    <div className="space-y-6">
      <PageBanner
        title="Sub Admin Management"
        subtitle="Manage sub-admin accounts and permissions"
        icon={HiUserGroup}
      />
      {/* Teal card + filters + Add button row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-200 px-4 py-3 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={listLoading}
            className="p-2 rounded-lg bg-white/80 text-teal-600 hover:bg-white transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
          <span className="font-medium text-gray-800">Sub Admin Management</span>
          <select
            value={isActiveFilter}
            onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
            className="ml-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-sm focus:border-teal-500 focus:outline-none"
          >
            {IS_ACTIVE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => { setForm(emptyAddForm()); setAddModalOpen(true); }}
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
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission Sharing (%)</th>
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
                    {(admin.assignedUsersCount ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <HiUser className="w-4 h-4 text-teal-500" />
                        {admin.assignedUsersCount} user(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-gray-600 text-sm">{admin.commissionSharing ?? '–'}</td>
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
                        <button
                          type="button"
                          onClick={() => openAssignModal(admin)}
                          className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors"
                          title="Assign users"
                        >
                          <HiUserAdd className="w-5 h-5" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => openRemoveModal(admin)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove users"
                        >
                          <HiUserRemove className="w-5 h-5" />
                        </button>
                      )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Rahul Kumar"
                  className={inputClass}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="9876543210"
                  className={inputClass}
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-0.5">10 digits, start with 6–9</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="rahul.branch@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch ID</label>
                <input
                  type="text"
                  value={form.branchId}
                  onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                  placeholder="BR-001"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch name</label>
                <input
                  type="text"
                  value={form.branchName}
                  onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))}
                  placeholder="Mumbai Branch"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Commission sharing (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.commissionSharing}
                  onChange={(e) => setForm((f) => ({ ...f, commissionSharing: e.target.value }))}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.depositManagement} onChange={(e) => setForm((f) => ({ ...f, depositManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Deposit management</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.withdrawalManagement} onChange={(e) => setForm((f) => ({ ...f, withdrawalManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Withdrawal management</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.userManagement} onChange={(e) => setForm((f) => ({ ...f, userManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">User management</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.accountsManagement} onChange={(e) => setForm((f) => ({ ...f, accountsManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Accounts management</span>
                </label>
              </div>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roles (local)</label>
              <div className="flex flex-wrap gap-3">
                {ROLE_OPTIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                    <input type="checkbox" checked={form.roles.includes(key)} onChange={() => toggleRole(key)} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div> */}
          </section>

          {/* Assign Users */}
          {/* <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
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
          </section> */}

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
            {/* <div className="flex flex-wrap gap-4">
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
            </div> */}
          </section>

          {/* Security & status */}
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-teal-500" /> Security & status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password <span className="text-red-500">*</span></label>
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
            <button type="button" onClick={() => setAddModalOpen(false)} disabled={addSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={addSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm disabled:opacity-50">
              {addSubmitting ? 'Creating…' : 'Create Sub Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View modal – premium detail layout */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="" size="md">
        {selectedAdmin && (
          <div className="space-y-0">
            {/* Profile header */}
            <div className="relative -mx-6 -mt-6 px-6 pt-6 pb-8 rounded-t-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white">
              <button type="button" onClick={() => setViewModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:bg-white/20 hover:text-white transition-colors" aria-label="Close">
                <HiX className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur border border-white/30 shadow-lg">
                  <span className="text-2xl font-bold tracking-tight">
                    {(selectedAdmin.name || 'U').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold truncate">{selectedAdmin.name || '—'}</h3>
                  <p className="text-teal-100 text-sm truncate mt-0.5">{selectedAdmin.email || '—'}</p>
                  <span className={`inline-flex mt-2 px-2.5 py-1 rounded-lg text-xs font-medium ${selectedAdmin.status === 'active' ? 'bg-white/25 text-white' : 'bg-white/15 text-teal-100'}`}>
                    {selectedAdmin.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-gray-900 font-medium truncate" title={selectedAdmin.email}>{selectedAdmin.email || '—'}</p>
              </div>
              {selectedAdmin.mobileNumber && (
                <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mobile</p>
                  <p className="text-gray-900 font-medium">{selectedAdmin.mobileNumber}</p>
                </div>
              )}
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Branch</p>
                <p className="text-gray-900 font-medium">{selectedAdmin.branchName || selectedAdmin.branchId || '—'}</p>
              </div>
              <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Created</p>
                <p className="text-gray-900 font-medium">{selectedAdmin.created || '—'}</p>
              </div>
            </div>

            {/* Permissions */}
            {selectedAdmin.permissions && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Permissions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'depositManagement', label: 'Deposit management' },
                    { key: 'withdrawalManagement', label: 'Withdrawal management' },
                    { key: 'userManagement', label: 'User management' },
                    { key: 'accountsManagement', label: 'Accounts management' },
                  ].map(({ key, label }) => (
                    <div key={key} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border ${selectedAdmin.permissions[key] ? 'bg-teal-50 border-teal-100 text-teal-800' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${selectedAdmin.permissions[key] ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {selectedAdmin.permissions[key] ? '✓' : '—'}
                      </span>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer hint */}
            {/* <p className="text-center text-xs text-gray-400 pt-6 pb-1">Branch details</p> */}
          </div>
        )}
      </Modal>

      {/* Edit modal – API fields: fullName, mobileNumber, emailId, password?, branchId, branchName, permissions */}
      <Modal open={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedAdmin(null); }} title="Edit Sub Admin" size="lg" scrollable>
        <form onSubmit={handleEditSubmit} className="space-y-6 pb-2">
          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider flex items-center gap-2"><span className="w-1 h-4 rounded-full bg-teal-500" /> Basic info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} maxLength={100} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile number</label><input type="tel" value={form.mobileNumber} onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="9876543210" className={inputClass} maxLength={10} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Branch ID</label><input type="text" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))} placeholder="BR-001" className={inputClass} /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Branch name</label><input type="text" value={form.branchName} onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))} placeholder="Mumbai Branch" className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Commission sharing (%)</label><input type="number" min={0} max={100} step={0.01} value={form.commissionSharing} onChange={(e) => setForm((f) => ({ ...f, commissionSharing: e.target.value }))} placeholder="0" className={inputClass} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.depositManagement} onChange={(e) => setForm((f) => ({ ...f, depositManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Deposit management</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.withdrawalManagement} onChange={(e) => setForm((f) => ({ ...f, withdrawalManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Withdrawal management</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.userManagement} onChange={(e) => setForm((f) => ({ ...f, userManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">User management</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors">
                  <input type="checkbox" checked={form.accountsManagement} onChange={(e) => setForm((f) => ({ ...f, accountsManagement: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Accounts management</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password (optional)</label>
              <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" className={inputClass} />
              <p className="text-xs text-gray-500 mt-0.5">Min 8 characters if provided</p>
            </div>
          </section>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => { setEditModalOpen(false); setSelectedAdmin(null); }} disabled={editSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={editSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm disabled:opacity-50">{editSubmitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Assign users to sub-admin – POST /api/v1/master/users/assign-sub-admin */}
      <Modal
        open={assignModalOpen}
        onClose={closeAssignModal}
        title={assignSubAdmin ? `Assign users to ${assignSubAdmin.name}` : 'Assign users'}
        size="lg"
        scrollable
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Select users to assign to this sub-admin. They will be able to view and manage only these users.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Search by User ID, name, UUID, mobile, branch…"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={selectAllAssignUsers}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {assignFilteredUserList.length > 0 && assignFilteredUserList.every((u) => assignSelectedIds.includes(u.id))
                ? 'Deselect all'
                : 'Select all'}
            </button>
            {assignSelectedIds.length > 0 && (
              <span className="text-sm text-teal-600 font-medium">{assignSelectedIds.length} selected</span>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-2 space-y-0.5">
            {assignUserListLoading ? (
              <div className="py-8 text-center text-gray-500 text-sm">Loading users…</div>
            ) : assignFilteredUserList.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">No users found.</div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider shrink-0">
                  <span className="w-4 shrink-0" aria-hidden />
                  <span className="shrink-0 w-[140px] font-mono">User ID</span>
                  <span className="min-w-0 flex-1">Full name</span>
                  <span className="shrink-0 max-w-[100px]">UUID</span>
                  <span className="shrink-0 w-24">Mobile</span>
                  <span className="shrink-0 max-w-[80px]">Branch</span>
                  <span className="shrink-0 w-20 text-center">Status</span>
                </div>
                {assignFilteredUserList.map((u) => {
                console.log("🚀 ~ SubAdminManagement ~ u:", u)
                const isAssignedToThisBranch = assignSubAdmin?.assignedUserIds?.includes(u.id)
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={assignSelectedIds.includes(u.id)}
                      onChange={() => toggleAssignUser(u.id)}
                      className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-xs font-mono text-gray-600 truncate shrink-0 w-[140px]" title={u.uuid}>{u.uuid|| '—'}</span>
                    <span className="text-sm font-medium text-gray-900 truncate min-w-0 flex-1">{u.name || '—'}</span>
                    <span className="text-xs text-gray-500 font-mono truncate shrink-0 max-w-[100px]" title={u.uuid}>{u.uuid || '—'}</span>
                    <span className="text-xs text-gray-600 truncate shrink-0 w-24">{u.mobile || '—'}</span>
                    <span className="text-xs text-gray-500 shrink-0 max-w-[80px] truncate" title={u.branchId}>{u.branchId ? `${u.branchId}` : '—'}</span>
                    <span className="shrink-0 w-20 text-center">
                      {isAssignedToThisBranch ? (
                        <span className="text-xs font-medium text-teal-600 whitespace-nowrap" title={assignSubAdmin?.branchId || 'This branch'}>
                          {assignSubAdmin?.branchId ? `✓ ${assignSubAdmin.branchId}` : '✓ This branch'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </span>
                  </label>
                )
              })}
              </>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeAssignModal}
              disabled={assignSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignSubmitting || assignSelectedIds.length === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {assignSubmitting ? 'Assigning…' : `Assign ${assignSelectedIds.length} user(s)`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Remove users from sub-admin – GET assigned-users, POST unassign-sub-admin */}
      <Modal
        open={removeModalOpen}
        onClose={closeRemoveModal}
        title={removeSubAdmin ? `Remove users from ${removeSubAdmin.name}` : 'Remove users'}
        size="lg"
        scrollable
      >
        <form onSubmit={handleRemoveSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Select users to remove from this sub-admin. They will no longer be managed by this sub-admin.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAllRemoveUsers}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {removeUserList.length > 0 && removeUserList.every((u) => removeSelectedIds.includes(u.id))
                ? 'Deselect all'
                : 'Select all'}
            </button>
            {removeSelectedIds.length > 0 && (
              <span className="text-sm text-red-600 font-medium">{removeSelectedIds.length} selected</span>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-2 space-y-0.5">
            {removeUserListLoading ? (
              <div className="py-8 text-center text-gray-500 text-sm">Loading assigned users…</div>
            ) : removeUserList.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">No assigned users to remove.</div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider shrink-0">
                  <span className="w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">Full name</span>
                  <span className="shrink-0 max-w-[100px]">UUID</span>
                  <span className="shrink-0 w-24">Mobile</span>
                  <span className="shrink-0 max-w-[80px]">Branch</span>
                </div>
                {removeUserList.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={removeSelectedIds.includes(u.id)}
                      onChange={() => toggleRemoveUser(u.id)}
                      className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-900 truncate min-w-0 flex-1">{u.name || `User ${u.id}`}</span>
                    <span className="text-xs text-gray-500 font-mono truncate shrink-0 max-w-[100px]" title={u.uuid}>{u.uuid || '—'}</span>
                    <span className="text-xs text-gray-600 truncate shrink-0 w-24">{u.mobile || '—'}</span>
                    <span className="text-xs text-gray-500 shrink-0 max-w-[80px] truncate" title={u.branchId}>{u.branchId || '—'}</span>
                  </label>
                ))}
              </>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeRemoveModal}
              disabled={removeSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={removeSubmitting || removeSelectedIds.length === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {removeSubmitting ? 'Removing…' : `Remove ${removeSelectedIds.length} user(s)`}
            </button>
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
