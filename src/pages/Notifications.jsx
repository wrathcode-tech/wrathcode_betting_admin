/**
 * Notification Management – Send to user, bulk, announce to all; list notifications from API.
 * APIs: POST send-user, POST send-bulk, POST send-all, GET notifications (list).
 */
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  HiBell,
  HiUser,
  HiUserGroup,
  HiSpeakerphone,
  HiViewList,
  HiPaperAirplane,
  HiSearch,
  HiRefresh,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

const TABS = [
  { key: 'send-user', label: 'Send to User', icon: HiUser },
  { key: 'bulk', label: 'Bulk Notification', icon: HiUserGroup },
  { key: 'announce', label: 'Announce To All', icon: HiSpeakerphone },
  { key: 'list', label: 'Notification List', icon: HiViewList },
]

const LIST_LIMIT = 20

export default function Notifications() {
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [userSearchDebounced, setUserSearchDebounced] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState('send-user')
  const [form, setForm] = useState({ title: '', message: '', link: '' })
  const [bulkForm, setBulkForm] = useState({ userIdsStr: '', title: '', message: '', link: '' })
  const [announceForm, setAnnounceForm] = useState({ title: '', message: '', link: '' })
  const [sending, setSending] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  const [listTotal, setListTotal] = useState(0)
  const [listPage, setListPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState(null)

  const dropdownRef = useRef(null)
  const { addToast } = useToast()
  const { hasPermission, getAssignedUserIds } = useAuth()
  const canSend = hasPermission(PERMISSIONS.SEND_NOTIFICATIONS)

  // Debounce user search
  useEffect(() => {
    const t = setTimeout(() => setUserSearchDebounced(userSearch), 300)
    return () => clearTimeout(t)
  }, [userSearch])

  // Fetch users for dropdown (send-user tab)
  useEffect(() => {
    if (activeTab !== 'send-user') return
    setUsersLoading(true)
    AuthService.getMasterUsers({ search: userSearchDebounced.trim() || undefined, limit: 20 })
      .then((res) => {
        let list = res?.data?.users ?? res?.data ?? []
        if (!Array.isArray(list)) list = []
        const assignedIds = getAssignedUserIds()
        if (assignedIds?.length > 0) list = list.filter((u) => assignedIds.includes(u._id ?? u.id))
        setUsers(list)
      })
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false))
  }, [activeTab, userSearchDebounced, getAssignedUserIds])

  // Fetch notifications list
  const fetchNotifications = useCallback(() => {
    setListLoading(true)
    setListError(null)
    const params = {
      page: listPage,
      limit: LIST_LIMIT,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
    }
    AuthService.getMasterNotifications(params)
      .then((res) => {
        if (res?.success && res?.data) {
          const d = res.data
          setNotifications(Array.isArray(d.notifications) ? d.notifications : [])
          setTotalNotifications(d.totalNotifications ?? 0)
          setActiveCount(d.active ?? 0)
          setInactiveCount(d.inactive ?? 0)
          setListTotal(d.total ?? 0)
          setListError(null)
        } else {
          setNotifications([])
          setListError(res?.message || 'Failed to load notifications')
        }
      })
      .catch(() => {
        setNotifications([])
        setListError('Failed to load notifications')
      })
      .finally(() => setListLoading(false))
  }, [listPage, statusFilter, typeFilter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    setListPage(1)
  }, [statusFilter, typeFilter])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userMatches = useMemo(() => {
    if (!userSearch.trim()) return users.slice(0, 10)
    const q = userSearch.toLowerCase()
    return users.filter(
      (u) =>
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (String(u._id || u.id).toLowerCase().includes(q)) ||
        (u.mobile && String(u.mobile).includes(q))
    ).slice(0, 10)
  }, [users, userSearch])

  function handleSendToUser(e) {
    e.preventDefault()
    const userId = selectedUser?._id ?? selectedUser?.id
    if (!userId) {
      addToast('Please select a user', 'error')
      return
    }
    if (!form.title.trim() || !form.message.trim()) {
      addToast('Title and message are required', 'error')
      return
    }
    setSending(true)
    AuthService.postMasterNotificationSendUser({
      userId: String(userId),
      title: form.title.trim(),
      message: form.message.trim(),
      link: form.link?.trim() || undefined,
    })
      .then((res) => {
        if (res?.success) {
          setForm({ title: '', message: '', link: '' })
          setSelectedUser(null)
          setUserSearch('')
          addToast(res?.data?.message || res?.message || 'Notification sent', 'success')
          fetchNotifications()
        } else {
          addToast(res?.message || 'Failed to send', 'error')
        }
      })
      .catch((err) => addToast(err?.response?.data?.message ?? err?.message ?? 'Failed to send', 'error'))
      .finally(() => setSending(false))
  }

  function handleBulkSubmit(e) {
    e.preventDefault()
    const userIds = bulkForm.userIdsStr.split(',').map((s) => s.trim()).filter(Boolean)
    if (!userIds.length || !bulkForm.title.trim() || !bulkForm.message.trim()) {
      addToast('Enter at least one user ID and title & message', 'error')
      return
    }
    setSending(true)
    AuthService.postMasterNotificationSendBulk({
      userIds,
      title: bulkForm.title.trim(),
      message: bulkForm.message.trim(),
      link: bulkForm.link?.trim() || undefined,
    })
      .then((res) => {
        if (res?.success) {
          addToast(res?.data?.message || res?.message || `Sent to ${res?.data?.recipientCount ?? userIds.length} user(s)`, 'success')
          setBulkForm({ userIdsStr: '', title: '', message: '', link: '' })
          fetchNotifications()
        } else {
          addToast(res?.message || 'Failed to send', 'error')
        }
      })
      .catch((err) => addToast(err?.response?.data?.message ?? err?.message ?? 'Failed to send', 'error'))
      .finally(() => setSending(false))
  }

  function handleAnnounceSubmit(e) {
    e.preventDefault()
    if (!announceForm.title.trim() || !announceForm.message.trim()) {
      addToast('Title and message are required', 'error')
      return
    }
    setSending(true)
    AuthService.postMasterNotificationSendAll({
      title: announceForm.title.trim(),
      message: announceForm.message.trim(),
      link: announceForm.link?.trim() || undefined,
    })
      .then((res) => {
        if (res?.success) {
          addToast(res?.data?.message || res?.message || 'Announcement sent to all users', 'success')
          setAnnounceForm({ title: '', message: '', link: '' })
          fetchNotifications()
        } else {
          addToast(res?.message || 'Failed to send', 'error')
        }
      })
      .catch((err) => addToast(err?.response?.data?.message ?? err?.message ?? 'Failed to send', 'error'))
      .finally(() => setSending(false))
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'
  const btnPrimary = 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50'

  function formatDate(iso) {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  const listTotalPages = Math.max(1, Math.ceil(listTotal / LIST_LIMIT))

  return (
    <div className="space-y-0">
      <PageBanner title="Notification Management" subtitle="Send and manage platform notifications" icon={HiBell} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Notifications</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalNotifications}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{activeCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-bold text-red-600 mt-0.5">{inactiveCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === key ? 'bg-teal-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Send to User form */}
      {activeTab === 'send-user' && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <HiUser className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800">Send Notification to User</span>
          </div>
          <form onSubmit={handleSendToUser} className="p-5 space-y-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select User <span className="text-red-500">*</span></label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={selectedUser ? `${selectedUser.fullName || selectedUser.name || ''} (${selectedUser.email || selectedUser.mobile || ''})` : userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); setUserDropdownOpen(true) }}
                  onFocus={() => !selectedUser && setUserDropdownOpen(true)}
                  placeholder="Search by name, email, mobile or ID"
                  className={inputClass + ' pl-10'}
                  readOnly={!!selectedUser}
                />
                {selectedUser && (
                  <button type="button" onClick={() => { setSelectedUser(null); setUserSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                    ×
                  </button>
                )}
              </div>
              {userDropdownOpen && !selectedUser && (
                <ul className="absolute z-10 w-full mt-1 py-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {usersLoading ? (
                    <li className="px-4 py-3 text-sm text-gray-500">Loading…</li>
                  ) : userMatches.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-500">No users found</li>
                  ) : (
                    userMatches.map((u) => (
                      <li key={u._id || u.id}>
                        <button
                          type="button"
                          onClick={() => { setSelectedUser(u); setUserSearch(''); setUserDropdownOpen(false) }}
                          className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-gray-900 text-sm"
                        >
                          {u.fullName || u.name || '—'} — {u.email || u.mobile || u._id || u.id}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Enter notification title" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Enter notification message" className={inputClass + ' resize-y min-h-[100px]'} rows={4} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (optional)</label>
              <input type="url" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://app.example.com/wallet" className={inputClass} />
            </div>
            {canSend && (
              <button type="submit" disabled={sending} className={btnPrimary}>
                <HiPaperAirplane className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Notification'}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Bulk Notification */}
      {activeTab === 'bulk' && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <HiUserGroup className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800">Bulk Notification</span>
          </div>
          <form onSubmit={handleBulkSubmit} className="p-5 space-y-4">
            <p className="text-sm text-gray-500">Enter user IDs (MongoDB ObjectIds) comma-separated. Same notification will be sent to all.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">User IDs (comma-separated) <span className="text-red-500">*</span></label>
              <input type="text" value={bulkForm.userIdsStr} onChange={(e) => setBulkForm((f) => ({ ...f, userIdsStr: e.target.value }))} placeholder="64a1b2c3..., 64a2b3c4..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input type="text" value={bulkForm.title} onChange={(e) => setBulkForm((f) => ({ ...f, title: e.target.value }))} placeholder="Enter notification title" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea value={bulkForm.message} onChange={(e) => setBulkForm((f) => ({ ...f, message: e.target.value }))} placeholder="Enter notification message" className={inputClass} rows={4} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (optional)</label>
              <input type="url" value={bulkForm.link} onChange={(e) => setBulkForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://..." className={inputClass} />
            </div>
            {canSend && <button type="submit" disabled={sending} className={btnPrimary}><HiPaperAirplane className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Bulk'}</button>}
          </form>
        </div>
      )}

      {/* Announce To All */}
      {activeTab === 'announce' && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <HiSpeakerphone className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800">Announce To All</span>
          </div>
          <form onSubmit={handleAnnounceSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input type="text" value={announceForm.title} onChange={(e) => setAnnounceForm((f) => ({ ...f, title: e.target.value }))} placeholder="Enter announcement title" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea value={announceForm.message} onChange={(e) => setAnnounceForm((f) => ({ ...f, message: e.target.value }))} placeholder="Enter announcement message" className={inputClass} rows={4} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (optional)</label>
              <input type="url" value={announceForm.link} onChange={(e) => setAnnounceForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://app.example.com/live" className={inputClass} />
            </div>
            {canSend && <button type="submit" disabled={sending} className={btnPrimary}><HiPaperAirplane className="w-4 h-4" /> {sending ? 'Sending…' : 'Announce To All'}</button>}
          </form>
        </div>
      )}

      {/* Notification List */}
      {activeTab === 'list' && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
            <HiViewList className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800">Notification List</span>
            <div className="flex flex-wrap gap-2 ml-auto">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:border-teal-500 focus:outline-none">
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:border-teal-500 focus:outline-none">
                <option value="all">All types</option>
                <option value="single">Single</option>
                <option value="bulk">Bulk</option>
                <option value="announce">Announce</option>
              </select>
              <button type="button" onClick={fetchNotifications} disabled={listLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50">
                <HiRefresh className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
          {listError && <div className="px-5 py-2 bg-red-50 text-red-700 text-sm">{listError}</div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Date</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Type</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Title</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Message</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Recipients</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">Loading…</td></tr>
                ) : notifications.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">No notifications found.</td></tr>
                ) : (
                  notifications.map((n) => (
                    <tr key={n._id || n.id || Math.random()} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 text-gray-600 text-sm">{formatDate(n.createdAt || n.sentAt || n.date)}</td>
                      <td className="py-4 px-5 text-sm capitalize">{n.type || '—'}</td>
                      <td className="py-4 px-5 font-medium text-gray-900">{n.title || '—'}</td>
                      <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate" title={n.message}>{n.message || '—'}</td>
                      <td className="py-4 px-5 text-gray-600 text-sm">{n.recipientCount != null ? n.recipientCount : '—'}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${(n.status || '').toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {n.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {listTotalPages > 1 && !listLoading && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                Showing {(listPage - 1) * LIST_LIMIT + 1}-{Math.min(listPage * LIST_LIMIT, listTotal)} of {listTotal}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setListPage((p) => Math.max(1, p - 1))} disabled={listPage <= 1} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-100 flex items-center gap-1">
                  <HiChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button type="button" onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))} disabled={listPage >= listTotalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-100 flex items-center gap-1">
                  Next <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
