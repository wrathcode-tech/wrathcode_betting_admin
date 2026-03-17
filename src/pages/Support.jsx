/**
 * Support Management – Admin tickets from GET/POST/PATCH /api/v1/support/admin/tickets
 * List (search, status, pagination), open ticket (detail + messages), reply, set resolved/closed.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  HiSearch,
  HiChat,
  HiReply,
  HiCheck,
  HiDownload,
  HiSupport,
  HiTicket,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]
const LIMIT = 20

function formatDateTime(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusConfig = {
  open: { label: 'Open', className: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  closed: { label: 'Closed', className: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
}

function getStatusKey(status) {
  const s = (status || 'open').toLowerCase().replace(/\s/g, '_')
  return statusConfig[s] ? s : 'open'
}

export default function Support() {
  const [tickets, setTickets] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [statusSubmitting, setStatusSubmitting] = useState(false)

  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canReply = hasPermission(PERMISSIONS.REPLY_TICKETS)
  const canClose = hasPermission(PERMISSIONS.CLOSE_TICKETS)

  const fetchTickets = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit: LIMIT }
    if (searchDebounced.trim()) params.search = searchDebounced.trim()
    if (statusFilter) params.status = statusFilter
    AuthService.getSupportAdminTickets(params)
      .then((res) => {
        if (res?.success && res?.data) {
          const list = res.data.data || []
          setTickets(list)
          setTotal(res.data.total ?? 0)
          setTotalPages(res.data.totalPages ?? 1)
          setError(null)
        } else {
          setTickets([])
          setTotal(0)
          setTotalPages(1)
          setError(res?.message || 'Failed to load tickets')
        }
      })
      .catch(() => {
        setTickets([])
        setTotal(0)
        setTotalPages(1)
        setError('Failed to load tickets')
      })
      .finally(() => setLoading(false))
  }, [page, statusFilter, searchDebounced])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchDebounced])

  const openDetail = (ticket) => {
    const ticketId = ticket.ticketId || ticket._id
    if (!ticketId) return
    setDetailOpen(true)
    setSelectedTicket(null)
    setReplyText('')
    setDetailLoading(true)
    AuthService.getSupportAdminTicketDetail(ticketId)
      .then((res) => {
        if (res?.success && res?.data) {
          setSelectedTicket(res.data)
        } else {
          addToast(res?.message || 'Failed to load ticket', 'error')
          setDetailOpen(false)
        }
      })
      .catch(() => {
        addToast('Failed to load ticket', 'error')
        setDetailOpen(false)
      })
      .finally(() => setDetailLoading(false))
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedTicket(null)
    setReplyText('')
    fetchTickets()
  }

  const handleReply = (e) => {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim() || replySubmitting) return
    const ticketId = selectedTicket.ticketId || selectedTicket._id
    setReplySubmitting(true)
    AuthService.postSupportAdminTicketReply(ticketId, { message: replyText.trim() })
      .then((res) => {
        if (res?.success && res?.data) {
          setSelectedTicket((prev) => ({
            ...prev,
            messages: [...(prev?.messages || []), res.data],
          }))
          setReplyText('')
          addToast(res?.message || 'Reply sent', 'success')
        } else {
          addToast(res?.message || 'Failed to send reply', 'error')
        }
      })
      .catch((err) => {
        addToast(err?.response?.data?.message || err?.message || 'Failed to send reply', 'error')
      })
      .finally(() => setReplySubmitting(false))
  }

  const updateStatus = (ticketId, newStatus) => {
    if (!ticketId || statusSubmitting) return
    setStatusSubmitting(true)
    AuthService.patchSupportAdminTicketStatus(ticketId, newStatus)
      .then((res) => {
        if (res?.success) {
          addToast(res?.message || `Ticket ${newStatus}`, 'success')
          setSelectedTicket((prev) => (prev && (prev.ticketId === ticketId || prev._id === ticketId) ? { ...prev, status: newStatus, closedAt: res?.data?.closedAt ?? prev.closedAt } : prev))
          fetchTickets()
          if (newStatus === 'closed' || newStatus === 'resolved') closeDetail()
        } else {
          addToast(res?.message || 'Failed to update status', 'error')
        }
      })
      .catch((err) => {
        addToast(err?.response?.data?.message || err?.message || 'Failed to update status', 'error')
      })
      .finally(() => setStatusSubmitting(false))
  }

  const handleExport = () => {
    addToast('Export started', 'success')
  }

  const stats = {
    total,
    open: tickets.filter((t) => (t.status || '').toLowerCase() === 'open').length,
    resolved: tickets.filter((t) => (t.status || '').toLowerCase() === 'resolved').length,
    closed: tickets.filter((t) => (t.status || '').toLowerCase() === 'closed').length,
  }

  return (
    <div className="space-y-0">
      <PageBanner title="Support Management" subtitle="Manage customer support tickets and queries" icon={HiSupport} />

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
          <HiTicket className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-800">Issue List ({total})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID, subject, category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value || 'all'} value={s.value}>{s.label}</option>
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

      <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mt_card_space">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Ticket ID</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">User</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Subject</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Category</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Priority</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider"></th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 text-sm">Loading…</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 text-sm">No tickets found.</td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const statusKey = getStatusKey(t.status)
                  const cfg = statusConfig[statusKey] || statusConfig.open
                  const user = t.user
                  const userLabel = user ? (user.fullName || user.mobile || user.username || user.uuid || '—') : '—'
                  return (
                    <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 text-gray-700 text-sm whitespace-nowrap">{formatDateTime(t.createdAt)}</td>
                      <td className="py-4 px-5 font-mono text-sm text-gray-800">{t.ticketId || t._id}</td>
                      <td className="py-4 px-5 text-gray-700 text-sm">
                        {userLabel}
                        {user?.mobile && <span className="block text-xs text-gray-500">{user.mobile}</span>}
                      </td>
                      <td className="py-4 px-5 font-medium text-gray-900 max-w-[180px] truncate" title={t.subject}>{t.subject || '—'}</td>
                      <td className="py-4 px-5 text-gray-600 text-sm capitalize">{t.category || '—'}</td>
                      <td className="py-4 px-5 text-gray-600 text-sm capitalize">{t.priority || '—'}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {t.hasUnreadForAdmin && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Unread</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {(statusKey === 'open' || statusKey === 'in_progress') && canClose && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateStatus(t.ticketId || t._id, 'closed')}
                                disabled={statusSubmitting}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                              >
                                Close
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(t.ticketId || t._id, 'resolved')}
                                disabled={statusSubmitting}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
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
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50">
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <span className="flex items-center px-2 text-sm text-gray-600">{page} / {totalPages}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50">
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {tickets.length === 0 && !loading && (
        <EmptyState title="No tickets found" message={error ? 'Try changing search or status filter.' : 'No support tickets yet.'} />
      )}

      <Modal open={detailOpen} onClose={closeDetail} title={selectedTicket ? `${selectedTicket.ticketId || selectedTicket._id} – ${selectedTicket.subject}` : 'Ticket'} size="lg" scrollable>
        {detailLoading ? (
          <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
        ) : selectedTicket ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[getStatusKey(selectedTicket.status)]?.className || statusConfig.open.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[getStatusKey(selectedTicket.status)]?.dot || 'bg-amber-500'}`} />
                {(statusConfig[getStatusKey(selectedTicket.status)] || statusConfig.open).label}
              </span>
              <span className="text-gray-500 text-sm">
                {selectedTicket.user?.fullName || selectedTicket.user?.mobile || '—'} · {selectedTicket.user?.mobile || selectedTicket.user?.email || ''}
              </span>
              {selectedTicket.description && <p className="text-gray-600 text-sm w-full mt-1">{selectedTicket.description}</p>}
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50/50">
              {(selectedTicket.messages || []).map((msg) => (
                <div
                  key={msg._id}
                  className={`p-3 rounded-xl text-sm ${
                    msg.senderType === 'admin' ? 'bg-teal-50 border border-teal-200 ml-4' : msg.senderType === 'user' ? 'bg-white border border-gray-200 mr-4' : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  <p className="text-xs text-gray-500 capitalize">{msg.senderType || 'system'} · {formatDateTime(msg.createdAt)}</p>
                  <p className="text-gray-700 mt-1">{msg.message}</p>
                </div>
              ))}
            </div>
            {canReply && getStatusKey(selectedTicket.status) !== 'closed' && (
              <form onSubmit={handleReply} className="pt-2 border-t border-gray-200">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Type your reply..."
                  required
                  maxLength={5000}
                />
                <div className="flex gap-2 mt-2">
                  <button type="submit" disabled={replySubmitting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50">
                    <HiReply className="w-5 h-5" /> {replySubmitting ? 'Sending…' : 'Send Reply'}
                  </button>
                  {(getStatusKey(selectedTicket.status) === 'open' || getStatusKey(selectedTicket.status) === 'in_progress') && canClose && (
                    <>
                      <button type="button" onClick={() => updateStatus(selectedTicket.ticketId || selectedTicket._id, 'resolved')} disabled={statusSubmitting} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">
                        <HiCheck className="w-4 h-4" /> Resolve
                      </button>
                      <button type="button" onClick={() => updateStatus(selectedTicket.ticketId || selectedTicket._id, 'closed')} disabled={statusSubmitting} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                        Close
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
