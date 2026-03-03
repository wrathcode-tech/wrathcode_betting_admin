import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiChartBar, HiUsers, HiUser, HiCash, HiCollection, HiArrowUp, HiArrowDown, HiCurrencyDollar, HiGift, HiUserGroup, HiShieldExclamation, HiDocumentText, HiSupport, HiBell, HiClipboardList, HiCog, HiSearch } from 'react-icons/hi'
import { useLayout } from '../context/LayoutContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'

const allCommands = [
  { path: '/', label: 'Dashboard', icon: HiChartBar, keywords: 'home overview', permission: PERMISSIONS.VIEW_DASHBOARD },
  { path: '/profile', label: 'My Profile', icon: HiUser, keywords: 'profile account me', permission: null },
  { path: '/users', label: 'Users', icon: HiUsers, keywords: 'users players', permission: PERMISSIONS.VIEW_USERS },
  { path: '/wallets', label: 'Wallets', icon: HiCash, keywords: 'wallets balance fiat', permission: PERMISSIONS.VIEW_WALLETS },
  { path: '/games', label: 'Games', icon: HiCollection, keywords: 'games teen patti rummy', permission: PERMISSIONS.VIEW_GAMES },
  { path: '/deposits', label: 'Deposits', icon: HiArrowDown, keywords: 'deposits', permission: PERMISSIONS.VIEW_DEPOSITS },
  { path: '/withdrawals', label: 'Withdrawals', icon: HiArrowUp, keywords: 'withdrawals payout', permission: PERMISSIONS.VIEW_WITHDRAWALS },
  { path: '/transactions', label: 'Transactions', icon: HiCurrencyDollar, keywords: 'transactions', permission: PERMISSIONS.VIEW_TRANSACTIONS },
  { path: '/bonuses', label: 'Bonuses', icon: HiGift, keywords: 'bonuses promo', permission: PERMISSIONS.VIEW_BONUSES },
  { path: '/referrals', label: 'Referrals', icon: HiUserGroup, keywords: 'referrals', permission: PERMISSIONS.VIEW_REFERRALS },
  { path: '/risk-fraud', label: 'Risk & Fraud', icon: HiShieldExclamation, keywords: 'risk fraud alerts', permission: PERMISSIONS.VIEW_RISK },
  { path: '/reports', label: 'Reports', icon: HiChartBar, keywords: 'reports analytics', permission: PERMISSIONS.VIEW_REPORTS },
  { path: '/cms', label: 'CMS', icon: HiDocumentText, keywords: 'cms content pages', permission: PERMISSIONS.VIEW_CMS },
  { path: '/support', label: 'Support', icon: HiSupport, keywords: 'support tickets', permission: PERMISSIONS.VIEW_TICKETS },
  { path: '/notifications', label: 'Notifications', icon: HiBell, keywords: 'notifications send alert', permission: PERMISSIONS.VIEW_NOTIFICATIONS },
  { path: '/audit-logs', label: 'Audit Logs', icon: HiClipboardList, keywords: 'audit logs', permission: PERMISSIONS.VIEW_AUDIT_LOG },
  { path: '/settings', label: 'Settings', icon: HiCog, keywords: 'settings config', permission: PERMISSIONS.VIEW_SETTINGS },
]

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useLayout()
  const { hasPermission } = useAuth()
  const open = commandPaletteOpen
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()

  const commands = useMemo(() => allCommands.filter((c) => c.permission == null || hasPermission(c.permission)), [hasPermission])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter((c) => c.label.toLowerCase().includes(q) || (c.keywords && c.keywords.includes(q)))
  }, [commands, query])

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((o) => !o)
        setQuery('')
        setSelected(0)
      }
      if (!open) return
      if (e.key === 'Escape') setCommandPaletteOpen(false)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => (s + 1) % filtered.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => (s - 1 + filtered.length) % filtered.length)
      }
      if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault()
        navigate(filtered[selected].path)
        setCommandPaletteOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, filtered, selected, navigate, setCommandPaletteOpen])

  useEffect(() => {
    setSelected(0)
  }, [query])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setCommandPaletteOpen(false)} aria-hidden />
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <HiSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
            autoFocus
          />
          <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs">ESC</kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-gray-500 text-sm">No results</li>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon
              return (
                <li key={cmd.path}>
                  <button
                    type="button"
                    onClick={() => { navigate(cmd.path); setCommandPaletteOpen(false); }}
                    onMouseEnter={() => setSelected(i)}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      i === selected ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                    {cmd.label}
                  </button>
                </li>
              )
            })
          )}
        </ul>
        <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>⌘K to open</span>
        </div>
      </div>
    </>
  )
}
