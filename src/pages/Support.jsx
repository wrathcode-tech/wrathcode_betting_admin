/**
 * Support Management – Teal banner, summary cards (Total / Open / Resolved / Closed),
 * Issue List table: DATE, ISSUE IMAGE, USER ID, EMAIL ID, SUBJECT, DESCRIPTION (Read More), STATUS, ACTIONS.
 * Matches reference: Close (red), Resolve (green), Chat (teal).
 */
import { useState, useMemo, useEffect } from 'react'
import {
  HiSearch,
  HiChat,
  HiReply,
  HiCheck,
  HiDownload,
  HiSupport,
  HiTicket,
  HiPhotograph,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getTickets } from '../services/api'

const STATUSES = ['All', 'Open', 'Resolved', 'Closed']
const DESC_MAX = 60

export default function Support() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canReply = hasPermission(PERMISSIONS.REPLY_TICKETS)
  const canClose = hasPermission(PERMISSIONS.CLOSE_TICKETS)

  useEffect(() => {
    getTickets().then((r) => setTickets(Array.isArray(r.data) ? r.data : []))
  }, [])

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !search.trim() ||
        (t.subject && t.subject.toLowerCase().includes(search.toLowerCase())) ||
        (t.user && t.user.toLowerCase().includes(search.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
        (t.id && t.id.toLowerCase().includes(search.toLowerCase())) ||
        (t.userIdentifier && t.userIdentifier.toLowerCase().includes(search.toLowerCase()))
      const s = (t.status || 'open').toLowerCase()
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Open' && s === 'open') ||
        (statusFilter === 'Resolved' && s === 'resolved') ||
        (statusFilter === 'Closed' && s === 'closed')
      return matchSearch && matchStatus
    })
  }, [tickets, search, statusFilter])

  const stats = useMemo(() => {
    const open = tickets.filter((t) => (t.status || '').toLowerCase() === 'open').length
    const resolved = tickets.filter((t) => (t.status || '').toLowerCase() === 'resolved').length
    const closed = tickets.filter((t) => (t.status || '').toLowerCase() === 'closed').length
    return { total: tickets.length, open, resolved, closed }
  }, [tickets])

  function openDetail(t) {
    setSelectedTicket(t)
    setReplyText('')
    setDetailOpen(true)
  }

  function handleReply(e) {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim()) return
    const newMsg = { from: 'agent', text: replyText.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    const updatedTicket = { ...selectedTicket, messages: [...(selectedTicket.messages || []), newMsg] }
    setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    setSelectedTicket(updatedTicket)
    setReplyText('')
    addToast('Reply sent', 'success')
  }

  function updateStatus(id, status) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: status.toLowerCase() } : t)))
    if (selectedTicket?.id === id) setSelectedTicket((t) => (t ? { ...t, status: status.toLowerCase() } : null))
    setDetailOpen(false)
    setSelectedTicket(null)
    addToast(`Ticket ${status.toLowerCase()}`, 'success')
  }

  function handleExport() {
    addToast('Export started', 'success')
  }

  const statusConfig = {
    open: { label: 'Open', className: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
    resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    closed: { label: 'Closed', className: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  }
  const getStatus = (t) => (t.status || 'open').toLowerCase()
  const replies = selectedTicket && selectedTicket.messages ? selectedTicket.messages : []

  return (
    <div className="space-y-0">
      <PageBanner title="Support Management" subtitle="Manage customer support tickets and queries – PlayAdd / BetFury" icon={HiSupport} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open</p>
          <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.open}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.resolved}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Closed</p>
          <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.closed}</p>
        </div>
      </div>

      {/* Issue List section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiTicket className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-gray-800">Issue List ({filtered.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, user, email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            <HiDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mt_card_space">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Issue Image</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">User ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Email ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Subject</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Description</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const statusKey = getStatus(t)
                const cfg = statusConfig[statusKey] || statusConfig.open
                const desc = t.description || ''
                const isLong = desc.length > DESC_MAX
                const showFull = expandedId === t.id
                const descShow = showFull ? desc : desc.slice(0, DESC_MAX) + (isLong ? '...' : '')
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-5 text-gray-700 text-sm whitespace-nowrap">{t.createdAt || '—'}</td>
                    <td className="py-4 px-5">
                      {t.issueImage ? (
                        <img src={t.issueImage} alt="" className="w-12 h-12 rounded object-cover border border-gray-200" />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-gray-400 text-sm">
                          <HiPhotograph className="w-4 h-4" /> No Image
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 font-mono text-sm text-gray-800">{t.userIdentifier || t.userId || '—'}</td>
                    <td className="py-4 px-5 text-gray-700 text-sm">{t.email || '—'}</td>
                    <td className="py-4 px-5 font-medium text-gray-900">{t.subject || '—'}</td>
                    <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px]">
                      <span>{descShow}</span>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                          className="ml-1 text-teal-600 hover:text-teal-700 font-medium"
                        >
                          {showFull ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {(statusKey === 'open') && canClose && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateStatus(t.id, 'Closed')}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(t.id, 'Resolved')}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => openDetail(t)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 flex items-center gap-1.5"
                        >
                          <HiChat className="w-4 h-4" /> Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No tickets found" message={tickets.length === 0 ? 'No support tickets yet.' : 'Try changing search or status filter.'} />
      )}

      {/* Chat / Detail modal */}
      <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedTicket(null); }} title={selectedTicket ? `${selectedTicket.id} – ${selectedTicket.subject}` : 'Ticket'} size="lg">
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[getStatus(selectedTicket)]?.className || statusConfig.open.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[getStatus(selectedTicket)]?.dot || 'bg-amber-500'}`} />
                {(statusConfig[getStatus(selectedTicket)] || statusConfig.open).label}
              </span>
              <span className="text-gray-500 text-sm">{selectedTicket.user} · {selectedTicket.email}</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {replies.map((r, i) => (
                <div key={i} className={`p-3 rounded-xl ${r.from === 'agent' ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className="text-xs text-gray-500">{r.from === 'agent' ? 'Support' : selectedTicket.user} · {r.time}</p>
                  <p className="text-gray-700 text-sm mt-1">{r.text}</p>
                </div>
              ))}
            </div>
            {canReply && getStatus(selectedTicket) !== 'closed' && (
              <form onSubmit={handleReply} className="pt-2 border-t border-gray-200">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Type your reply..."
                  required
                />
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600">
                    <HiReply className="w-5 h-5" /> Send Reply
                  </button>
                  {getStatus(selectedTicket) === 'open' && canClose && (
                    <>
                      <button type="button" onClick={() => updateStatus(selectedTicket.id, 'Resolved')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                        <HiCheck className="w-4 h-4" /> Resolve
                      </button>
                      <button type="button" onClick={() => updateStatus(selectedTicket.id, 'Closed')} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600">
                        Close
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
