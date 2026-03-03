/**
 * Notification Management – Teal banner, summary cards (Total / Active / Inactive),
 * tabs: Send to User | Bulk Notification | Announce To All | Notification List.
 * Send to User: search user, title, message, link. Data from getNotifications, getUsers, sendNotificationToUser.
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import {
  HiBell,
  HiUser,
  HiUserGroup,
  HiSpeakerphone,
  HiViewList,
  HiPaperAirplane,
  HiSearch,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getNotifications, getUsers, sendNotificationToUser, sendBulkNotification, sendAnnouncementToAll } from '../services/api'

const TABS = [
  { key: 'send-user', label: 'Send to User', icon: HiUser },
  { key: 'bulk', label: 'Bulk Notification', icon: HiUserGroup },
  { key: 'announce', label: 'Announce To All', icon: HiSpeakerphone },
  { key: 'list', label: 'Notification List', icon: HiViewList },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('send-user')
  const [userSearch, setUserSearch] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({ title: '', message: '', link: '' })
  const [bulkForm, setBulkForm] = useState({ userIds: [], title: '', message: '' })
  const [announceForm, setAnnounceForm] = useState({ title: '', message: '' })
  const [sending, setSending] = useState(false)
  const dropdownRef = useRef(null)
  const { addToast } = useToast()
  const { hasPermission, getAssignedUserIds } = useAuth()
  const canSend = hasPermission(PERMISSIONS.SEND_NOTIFICATIONS)

  useEffect(() => {
    getNotifications().then((r) => setNotifications(Array.isArray(r.data) ? r.data : []))
    getUsers().then((r) => {
      let list = Array.isArray(r.data) ? r.data : []
      const assignedIds = getAssignedUserIds()
      if (assignedIds && assignedIds.length > 0) list = list.filter((u) => assignedIds.includes(u.id))
      setUsers(list)
    })
  }, [getAssignedUserIds])

  const stats = useMemo(() => {
    const active = notifications.filter((n) => (n.status || '').toLowerCase() === 'active').length
    const inactive = notifications.filter((n) => (n.status || '').toLowerCase() === 'inactive').length
    return { total: notifications.length, active, inactive }
  }, [notifications])

  const userMatches = useMemo(() => {
    if (!userSearch.trim()) return users.slice(0, 10)
    const q = userSearch.toLowerCase()
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (String(u.id).includes(q)) ||
        (u.uuid && u.uuid.includes(q))
    ).slice(0, 10)
  }, [users, userSearch])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSendToUser(e) {
    e.preventDefault()
    if (!selectedUser) {
      addToast('Please select a user', 'error')
      return
    }
    if (!form.title.trim() || !form.message.trim()) {
      addToast('Title and message are required', 'error')
      return
    }
    setSending(true)
    sendNotificationToUser(selectedUser.id, { title: form.title, message: form.message, link: form.link || null })
      .then((r) => {
        setNotifications((prev) => [...prev, r.data])
        setForm({ title: '', message: '', link: '' })
        setSelectedUser(null)
        setUserSearch('')
        addToast('Notification sent', 'success')
      })
      .finally(() => setSending(false))
  }

  function handleBulkSubmit(e) {
    e.preventDefault()
    if (!bulkForm.userIds.length || !bulkForm.title.trim() || !bulkForm.message.trim()) {
      addToast('Select users and enter title & message', 'error')
      return
    }
    setSending(true)
    sendBulkNotification(bulkForm).then(() => {
      addToast(`Notification sent to ${bulkForm.userIds.length} users`, 'success')
      setBulkForm({ userIds: [], title: '', message: '' })
      setSending(false)
    })
  }

  function handleAnnounceSubmit(e) {
    e.preventDefault()
    if (!announceForm.title.trim() || !announceForm.message.trim()) {
      addToast('Title and message are required', 'error')
      return
    }
    setSending(true)
    sendAnnouncementToAll(announceForm).then(() => {
      addToast('Announcement sent to all users', 'success')
      setAnnounceForm({ title: '', message: '' })
      setSending(false)
    })
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'
  const btnPrimary = 'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50'

  return (
    <div className="space-y-0">
      <PageBanner title="Notification Management" subtitle="Send and manage platform notifications – PlayAdd / BetFury" icon={HiBell} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Notifications</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.inactive}</p>
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
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt_card_space">
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
                  value={selectedUser ? `${selectedUser.name} (${selectedUser.email})` : userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); setUserDropdownOpen(true) }}
                  onFocus={() => !selectedUser && setUserDropdownOpen(true)}
                  placeholder="Search by name, email, or ID"
                  className={inputClass + ' pl-10'}
                  readOnly={!!selectedUser}
                />
                {selectedUser && (
                  <button type="button" onClick={() => { setSelectedUser(null); setUserSearch('') }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                    ×
                  </button>
                )}
              </div>
              {userDropdownOpen && userMatches.length > 0 && !selectedUser && (
                <ul className="absolute z-10 w-full mt-1 py-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {userMatches.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedUser(u); setUserSearch(''); setUserDropdownOpen(false) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-gray-900 text-sm"
                      >
                        {u.name} — {u.email}
                      </button>
                    </li>
                  ))}
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
              <input type="text" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="Enter link URL" className={inputClass} />
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
            <p className="text-sm text-gray-500">Select multiple users and send the same notification. (Demo: add user IDs comma-separated below.)</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">User IDs (comma-separated)</label>
              <input type="text" value={bulkForm.userIds.join(', ')} onChange={(e) => setBulkForm((f) => ({ ...f, userIds: e.target.value.split(',').map((s) => Number(s.trim())).filter(Boolean) }))} placeholder="e.g. 1, 2, 5" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input type="text" value={bulkForm.title} onChange={(e) => setBulkForm((f) => ({ ...f, title: e.target.value }))} placeholder="Enter notification title" className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea value={bulkForm.message} onChange={(e) => setBulkForm((f) => ({ ...f, message: e.target.value }))} placeholder="Enter notification message" className={inputClass} rows={4} required />
            </div>
            {canSend && <button type="submit" disabled={sending} className={btnPrimary}><HiPaperAirplane className="w-4 h-4" /> Send Bulk</button>}
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
            {canSend && <button type="submit" disabled={sending} className={btnPrimary}><HiPaperAirplane className="w-4 h-4" /> Announce To All</button>}
          </form>
        </div>
      )}

      {/* Notification List */}
      {activeTab === 'list' && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <HiViewList className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800">Notification List</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Date</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Title</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Message</th>
                  <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-5 text-gray-600 text-sm">{n.sentAt || '—'}</td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-gray-900">{n.userName}</p>
                      <p className="text-gray-500 text-sm">{n.userEmail}</p>
                    </td>
                    <td className="py-4 px-5 font-medium text-gray-900">{n.title}</td>
                    <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate">{n.message}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${(n.status || '').toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {n.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notifications.length === 0 && <p className="text-center text-gray-500 py-8">No notifications sent yet.</p>}
        </div>
      )}
    </div>
  )
}
