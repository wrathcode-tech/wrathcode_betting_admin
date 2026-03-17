/**
 * Admin Logs – GET /api/v1/master/admin-logs (same as Dashboard). Activity filter, pagination, table.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  HiClipboardList,
  HiChevronLeft,
  HiChevronRight,
  HiRefresh,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

function formatLogDateTime(iso) {
  if (!iso) return '–'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return iso
  }
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [activity, setActivity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { hasPermission } = useAuth()
  const canView = hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)

  const fetchLogs = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit }
    if (activity) params.activity = activity
    AuthService.getMasterAdminLogs(params)
      .then((res) => {
        if (res?.success && res?.data) {
          setLogs(res.data.logs || [])
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(null)
        } else {
          setLogs([])
          setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
          setError(res?.message || 'Failed to load admin logs')
        }
      })
      .catch(() => {
        setLogs([])
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 })
        setError('Failed to load admin logs')
      })
      .finally(() => setLoading(false))
  }, [page, limit, activity])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    setPage(1)
  }, [activity, limit])

  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const total = pagination.total

  const handleReset = () => {
    setActivity('')
    setPage(1)
    setLimit(20)
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
      <PageBanner title="Admin Logs" subtitle="View admin activity logs and audit trail" icon={HiClipboardList} />

      <div className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <HiClipboardList className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
        </div>

        {/* Filters – same as Dashboard */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
          >
            <option value="">All activity</option>
            <option value="login">Login</option>
          </select>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <HiRefresh className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Table – same columns as Dashboard */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-5 text-center text-gray-500 text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-5 text-center text-gray-500 text-sm">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((row, index) => (
                    <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-5 text-sm text-gray-600">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm font-medium text-gray-900">{row.activity || '–'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm text-gray-700">
                        {row.admin?.fullName || row.admin?.email || '–'}
                        {row.admin?.email && row.admin?.fullName && (
                          <span className="block text-gray-500 text-xs">{row.admin.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-sm text-gray-600 font-mono">{row.ipAddress || '–'}</td>
                      <td className="py-3 px-5 text-sm text-gray-500">{formatLogDateTime(row.dateTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && logs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
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
                  Next <HiChevronRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
