import { useState, useMemo } from 'react'
import { HiSearch, HiExclamation, HiCheckCircle, HiShieldExclamation, HiCog } from 'react-icons/hi'
import Modal from '../components/Modal'
import PageBanner from '../components/PageBanner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'

const SEVERITY = ['Critical', 'High', 'Medium', 'Low']
const STATUSES = ['Open', 'Investigating', 'Resolved', 'Dismissed']

const initialAlerts = [
  { id: 1, userId: 101, userName: 'Rahul K.', type: 'Multiple accounts', severity: 'High', status: 'Open', detectedAt: '2024-01-15 10:30', description: 'Same device/IP across 3 accounts' },
  { id: 2, userId: 104, userName: 'Sneha M.', type: 'Unusual withdrawal pattern', severity: 'Medium', status: 'Investigating', detectedAt: '2024-01-14 16:00', description: '5 withdrawals in 2 hours' },
  { id: 3, userId: 102, userName: 'Priya S.', type: 'Bonus abuse', severity: 'Critical', status: 'Resolved', detectedAt: '2024-01-13 09:15', description: 'Same card used for multiple welcome bonuses' },
  { id: 4, userId: 105, userName: 'Vikram J.', type: 'Velocity check', severity: 'Low', status: 'Dismissed', detectedAt: '2024-01-12 14:20', description: 'High bet frequency – verified legitimate' },
]

const riskRules = [
  { id: 1, name: 'Max withdrawal per day', value: '₹1,00,000', enabled: true },
  { id: 2, name: 'New account withdrawal hold', value: '24 hours', enabled: true },
  { id: 3, name: 'Same device multiple accounts', value: 'Alert', enabled: true },
  { id: 4, name: 'Large deposit from new user', value: 'Manual review above ₹50,000', enabled: true },
]

export default function RiskFraud() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canResolve = hasPermission(PERMISSIONS.RESOLVE_ALERTS)
  const canManageRules = hasPermission(PERMISSIONS.MANAGE_RISK_RULES)

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchSearch = !search.trim() || a.userName.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
      const matchSeverity = severityFilter === 'All' || a.severity === severityFilter
      const matchStatus = statusFilter === 'All' || a.status === statusFilter
      return matchSearch && matchSeverity && matchStatus
    })
  }, [alerts, search, severityFilter, statusFilter])

  function openDetail(a) {
    setSelectedAlert(a)
    setDetailOpen(true)
  }

  function updateAlertStatus(id, status) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    setDetailOpen(false)
    setSelectedAlert(null)
    addToast(`Alert marked as ${status}`, 'success')
  }

  const severityColors = { Critical: 'bg-red-500/20 text-red-400', High: 'bg-amber-500/20 text-amber-400', Medium: 'bg-yellow-500/20 text-yellow-400', Low: 'bg-gray-200 text-gray-600' }
  const statusColors = { Open: 'bg-amber-500/20 text-amber-400', Investigating: 'bg-blue-500/20 text-blue-400', Resolved: 'bg-emerald-500/20 text-emerald-400', Dismissed: 'bg-gray-200 text-gray-600' }

  return (
    <div className="space-y-6">
      <PageBanner title="Risk & Fraud" subtitle="Alerts, rules, and fraud detection – PlayAdd / BetFury" icon={HiShieldExclamation} />
      {canManageRules && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setRulesOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-teal-500/50 hover:text-teal-600 transition-colors">
            <HiCog className="w-5 h-5" /> Risk Rules
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user or type..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none">
            <option value="All">All severity</option>
            {SEVERITY.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-teal-500 focus:outline-none">
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">User / Type</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Severity</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th>
                <th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Detected</th>
                <th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-5">
                    <p className="text-gray-900 font-medium">{a.userName}</p>
                    <p className="text-gray-500 text-sm">{a.type}</p>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${severityColors[a.severity] || 'bg-gray-200 text-gray-600'}`}>{a.severity}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[a.status] || 'bg-gray-200 text-gray-600'}`}>{a.status}</span>
                  </td>
                  <td className="py-4 px-5 text-gray-500 text-sm">{a.detectedAt}</td>
                  <td className="py-4 px-5 text-right">
                    <button type="button" onClick={() => openDetail(a)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && <EmptyState title="No alerts" message="No alerts match your filters." />}

      <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedAlert(null); }} title={selectedAlert ? `Alert – ${selectedAlert.type}` : 'Alert'} size="md">
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <HiShieldExclamation className="w-10 h-10 text-teal-500" />
              <div>
                <p className="font-medium text-gray-900">{selectedAlert.userName}</p>
                <p className="text-gray-500 text-sm">{selectedAlert.type}</p>
                <p className="text-gray-400 text-xs mt-0.5">{selectedAlert.detectedAt}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{selectedAlert.description}</p>
            <div className="flex gap-2">
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${severityColors[selectedAlert.severity]}`}>{selectedAlert.severity}</span>
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[selectedAlert.status]}`}>{selectedAlert.status}</span>
            </div>
            {selectedAlert.status !== 'Resolved' && selectedAlert.status !== 'Dismissed' && canResolve && (
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => updateAlertStatus(selectedAlert.id, 'Resolved')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500">
                  <HiCheckCircle className="w-5 h-5" /> Resolve
                </button>
                <button type="button" onClick={() => updateAlertStatus(selectedAlert.id, 'Dismissed')} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={rulesOpen} onClose={() => setRulesOpen(false)} title="Risk Rules" size="md">
        <div className="space-y-3">
          {riskRules.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <p className="text-gray-900 font-medium">{r.name}</p>
                <p className="text-gray-500 text-sm">{r.value}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${r.enabled ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-200 text-gray-600'}`}>{r.enabled ? 'On' : 'Off'}</span>
            </div>
          ))}
          <p className="text-gray-400 text-xs">Configure rules via System Settings or API.</p>
        </div>
      </Modal>
    </div>
  )
}
