/**
 * Admin Logs – reference layout: green banner, Activity Logs section, filters (Search, Admin ID, Action type, Per page, Reset),
 * table ADMIN, ACTION, DETAILS, IP, STATUS, TIME, pagination.
 */
import { useState, useMemo, useEffect } from 'react'
import {
  HiTrash,
  HiClipboardList,
  HiChevronLeft,
  HiChevronRight as HiNext,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getAuditLogs } from '../services/api'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatLogTime(iso) {
  if (!iso) return '–'
  const d = new Date(iso)
  const day = d.getDate()
  const month = MONTHS[d.getMonth()]
  const year = d.getFullYear()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${day} ${month} ${year}, ${String(h).padStart(2, '0')}:${m} ${ampm}`
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [adminIdFilter, setAdminIdFilter] = useState('')
  const [actionTypeFilter, setActionTypeFilter] = useState('')
  const [perPage, setPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const { hasPermission } = useAuth()
  const canView = hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)

  useEffect(() => {
    getAuditLogs().then((r) => setLogs(r.data || []))
  }, [])

  const filtered = useMemo(() => {
    let list = [...logs]
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(
        (l) =>
          (l.admin && l.admin.toLowerCase().includes(term)) ||
          (l.action && l.action.toLowerCase().includes(term)) ||
          (l.details && String(l.details).toLowerCase().includes(term)) ||
          (l.ip && l.ip.toLowerCase().includes(term))
      )
    }
    if (adminIdFilter.trim()) {
      list = list.filter((l) => String(l.adminType || '').includes(adminIdFilter.trim()))
    }
    if (actionTypeFilter.trim()) {
      list = list.filter((l) => l.action && l.action.toLowerCase().includes(actionTypeFilter.toLowerCase()))
    }
    return list
  }, [logs, search, adminIdFilter, actionTypeFilter])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(page, totalPages)
  const slice = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage, perPage])

  const handleReset = () => {
    setSearch('')
    setAdminIdFilter('')
    setActionTypeFilter('')
    setPage(1)
  }

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">You don&apos;t have permission to view admin logs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <PageBanner title="Admin Logs" subtitle="View admin activity logs and audit trail – PlayAdd / BetFury" icon={HiClipboardList} />

      {/* Activity Logs section */}
      <div className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <HiClipboardList className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="User email, UUID, target..."
            className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none w-full sm:w-56"
          />
          <input
            type="text"
            value={adminIdFilter}
            onChange={(e) => setAdminIdFilter(e.target.value)}
            placeholder="Filter by admin ID"
            className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:outline-none w-full sm:w-44"
          />
          <input
            type="text"
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            placeholder="e.g. KYC_DOCUMENT_API"
            className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:outline-none w-full sm:w-48"
          />
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500">Per page</span>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {log.admin}
                      <span className="text-gray-500 font-normal"> Type {log.adminType}</span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{log.action}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{log.details ?? '–'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.ip}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {log.status === 'success' ? 'success' : 'failure'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatLogTime(log.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
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
      </div>
    </div>
  )
}
