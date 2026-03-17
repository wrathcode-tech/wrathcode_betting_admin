/**
 * Light theme sidebar – reference style: uppercase section labels (MAIN, PLATFORM, …),
 * teal active state with left bar, red Logout at bottom.
 */
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  HiChartBar,
  HiUsers,
  HiCash,
  HiArrowDown,
  HiArrowUp,
  HiCurrencyDollar,
  HiCollection,
  HiTicket,
  HiGift,
  HiUserGroup,
  HiShieldExclamation,
  HiDocumentReport,
  HiDocumentText,
  HiSupport,
  HiBell,
  HiClipboardList,
  HiCog,
  HiCreditCard,
  HiChevronLeft,
  HiLogout,
} from 'react-icons/hi'
import { useLayout } from '../context/LayoutContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PERMISSIONS } from '../constants/roles'
import AuthService from '../api/services/AuthService'

const navSections = [
  { key: 'main', label: 'MAIN', pill: 'ACTIVE', items: [{ to: '/', label: 'Dashboard', icon: HiChartBar, permission: PERMISSIONS.VIEW_DASHBOARD }] },
  { key: 'platform', label: 'PLATFORM', pill: 'ACTIVE', items: [{ to: '/settings', label: 'Settings', icon: HiCog, permission: PERMISSIONS.VIEW_SETTINGS }] },
  { key: 'admin', label: 'ADMIN', items: [{ to: '/sub-admins', label: 'Sub Admin Management', icon: HiUsers, permission: PERMISSIONS.MANAGE_ROLES }, { to: '/audit-logs', label: 'Admin Logs', icon: HiClipboardList, permission: PERMISSIONS.VIEW_AUDIT_LOG }, { to: '/deposit-accounts', label: 'Deposit Accounts', icon: HiCreditCard, permission: PERMISSIONS.VIEW_DEPOSITS }] },
  { key: 'traders', label: 'TRADERS', items: [{ to: '/users', label: 'User List', icon: HiUsers, permission: PERMISSIONS.VIEW_USERS }] },
  { key: 'wallets', label: 'WALLETS & MONEY', items: [{ to: '/wallets', label: 'Wallets', icon: HiCash, permission: PERMISSIONS.VIEW_WALLETS }, { to: '/deposits', label: 'Deposits', icon: HiArrowDown, permission: PERMISSIONS.VIEW_DEPOSITS }, { to: '/withdrawals', label: 'Withdrawals', icon: HiArrowUp, permission: PERMISSIONS.VIEW_WITHDRAWALS }, { to: '/transactions', label: 'Transactions', icon: HiCurrencyDollar, permission: PERMISSIONS.VIEW_TRANSACTIONS }, { to: '/account-settlement', label: 'Account Statement', icon: HiDocumentReport, permission: PERMISSIONS.VIEW_ACCOUNT_STATEMENT }] },
  { key: 'gaming', label: 'GAMING', pill: 'ON', items: [{ to: '/games', label: 'Games', icon: HiCollection, permission: PERMISSIONS.VIEW_GAMES }, { to: '/bets', label: 'Bets', icon: HiTicket, permission: PERMISSIONS.MANAGE_BETTING }, { to: '/casino-history', label: 'Games History', icon: HiTicket, permission: PERMISSIONS.VIEW_CASINO_HISTORY }, { to: '/referrals', label: 'Referrals', icon: HiUserGroup, permission: PERMISSIONS.VIEW_REFERRALS }] },
  { key: 'risk', label: 'RISK & REPORTS', items: [{ to: '/reports', label: 'Reports', icon: HiDocumentReport, permission: PERMISSIONS.VIEW_REPORTS }] },
  { key: 'content', label: 'CONTENT & SUPPORT', items: [{ to: '/support', label: 'Support', icon: HiSupport, permission: PERMISSIONS.VIEW_TICKETS }, { to: '/notifications', label: 'Notifications', icon: HiBell, permission: PERMISSIONS.VIEW_NOTIFICATIONS }] },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, closeMobileSidebar } = useLayout()
  const { hasPermission, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [pendingDeposits, setPendingDeposits] = useState(0)
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0)
  const [pendingTickets, setPendingTickets] = useState(0)

  useEffect(() => {
    if (hasPermission(PERMISSIONS.VIEW_DEPOSITS)) {
      AuthService.getMasterDepositRequestsPending({ page: 1, limit: 1 })
        .then((res) => {
          if (res?.success && res?.data?.pagination != null) setPendingDeposits(res.data.pagination.total ?? 0)
        })
        .catch(() => setPendingDeposits(0))
    }
    if (hasPermission(PERMISSIONS.VIEW_WITHDRAWALS)) {
      AuthService.getMasterWithdrawalRequestsPending({ page: 1, limit: 1 })
        .then((res) => {
          if (res?.success && res?.data?.pagination != null) setPendingWithdrawals(res.data.pagination.total ?? 0)
        })
        .catch(() => setPendingWithdrawals(0))
    }
    if (hasPermission(PERMISSIONS.VIEW_TICKETS)) {
      AuthService.getSupportAdminTickets({ status: 'open', page: 1, limit: 1 })
        .then((res) => {
          if (res?.success && res?.data != null) setPendingTickets(res.data.total ?? 0)
        })
        .catch(() => setPendingTickets(0))
    }
  }, [hasPermission])

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm font-medium transition-all duration-200 border-l-4 ${isActive ? 'bg-teal-50 text-teal-700 border-l-teal-500' : 'border-l-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  function handleLogout() {
    logout()
    addToast('Logged out successfully', 'success')
    navigate('/login')
  }

  return (
    <>
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={closeMobileSidebar} aria-hidden />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 h-screen w-64 flex flex-col overflow-hidden
          bg-gray-100 border-r border-gray-200
          transition-transform duration-300 ease-in-out lg:transition-none
          ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-gray-200 flex items-center gap-3 shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            C
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight truncate">Crownbet</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav: section labels + links (scrollable when many items) */}
        <nav className="flex-1 min-h-0 py-4 px-3 overflow-y-auto overflow-x-hidden space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => hasPermission(item.permission))
            if (visibleItems.length === 0) return null
            const pillLabel = section.pill
            return (
              <div key={section.key} className="space-y-0.5">
                {/* Uppercase section label + optional pill (ACTIVE / ON) */}
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.label}
                    </span>
                    {pillLabel && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                        {pillLabel}
                      </span>
                    )}
                  </div>
                )}
                {/* Links */}
                {sidebarCollapsed ? (
                  visibleItems.map((item) => {
                    const Icon = item.icon
                    const count = item.to === '/deposits' ? pendingDeposits : item.to === '/withdrawals' ? pendingWithdrawals : item.to === '/support' ? pendingTickets : null
                    const title = count != null && count > 0 ? `${item.label} (${count} pending)` : item.label
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={closeMobileSidebar}
                        title={title}
                        className={({ isActive }) =>
                          `flex items-center justify-center p-2.5 rounded-lg text-sm font-medium transition-all relative ${isActive ? 'bg-teal-50 text-teal-600 border-l-4 border-l-teal-500' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        {count != null && count > 0 && (
                          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </NavLink>
                    )
                  })
                ) : (
                  visibleItems.map(({ to, label, icon: Icon }) => {
                    const count = to === '/deposits' ? pendingDeposits : to === '/withdrawals' ? pendingWithdrawals : to === '/support' ? pendingTickets : null
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        onClick={closeMobileSidebar}
                        className={linkClass}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0 text-gray-500" />
                        <span className="flex-1 min-w-0 truncate">{label}</span>
                        {count != null && count > 0 && (
                          <span className="flex-shrink-0 min-w-[22px] h-5 px-1.5 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </NavLink>
                    )
                  })
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom: collapse + Logout */}
        <div className="p-3 border-t border-gray-200 shrink-0 space-y-1.5">
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors text-xs"
              title="Collapse sidebar"
            >
              <HiChevronLeft className="w-4 h-4" /> Collapse
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors text-sm shadow-sm"
          >
            <HiLogout className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
