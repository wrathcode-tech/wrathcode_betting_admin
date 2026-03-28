import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiSearch, HiBell, HiUser, HiCog, HiMenu, HiViewGrid, HiChevronDown } from 'react-icons/hi'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { useLayout } from '../context/LayoutContext'
import { PERMISSIONS } from '../constants/roles'
import Breadcrumb from './Breadcrumb'

const notifications = [
  { id: 1, text: 'New user Rahul K. registered', time: '2 min ago', read: false },
  { id: 2, text: 'Large win on Aviator – ₹15,000', time: '15 min ago', read: false },
  { id: 3, text: 'Withdrawal ₹12,000 processed', time: '1 hr ago', read: true },
]

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, hasPermission } = useAuth()
  const { toggleSidebar, setSidebarMobileOpen, setCommandPaletteOpen } = useLayout()
  const canViewSettings = hasPermission(PERMISSIONS.VIEW_SETTINGS)
  const canViewReports = hasPermission(PERMISSIONS.VIEW_REPORTS)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && notifRef.current && !notifRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function handleProfile() {
    setDropdownOpen(false)
    navigate('/profile')
  }

  function handleSettings() {
    setDropdownOpen(false)
    navigate('/settings')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/users?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button type="button" onClick={() => setSidebarMobileOpen(true)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden" title="Open menu">
          <HiMenu className="w-5 h-5" />
        </button>
        <button type="button" onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors hidden lg:block" title="Toggle sidebar">
          <HiMenu className="w-5 h-5" />
        </button>
        <Breadcrumb />
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, games, transactions..."
              className="w-full pl-9 pr-20 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none transition-colors"
            />
            <button type="button" onClick={() => setCommandPaletteOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded bg-gray-200 text-gray-500 text-xs hover:text-teal-600 transition-colors" title="Quick open (Ctrl+K)">
              <HiViewGrid className="w-3.5 h-3.5" /> <kbd className="hidden sm:inline">⌘K</kbd>
            </button>
          </div>
        </form>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:ring-2 focus:ring-teal-500/50 focus:outline-none relative"
            title="Notifications"
            aria-expanded={notifOpen}
          >
            <HiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" aria-hidden />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 py-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <span className="text-xs text-gray-500">{notifications.filter((n) => !n.read).length} new</span>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-teal-50/50' : ''}`}>
                    <p className="text-sm text-gray-800">{n.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                  </li>
                ))}
              </ul>
              {canViewReports && (
                <div className="px-4 py-2 border-t border-gray-200">
                  <button type="button" onClick={() => { setNotifOpen(false); navigate('/reports'); }} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                    View all →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
            aria-expanded={dropdownOpen}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
              {(user?.name || 'A')[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Betgugly Admin</p>
            </div>
            <HiChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 py-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
              <button type="button" onClick={handleProfile} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <HiUser className="w-4 h-4" />
                Profile
              </button>
              {canViewSettings && (
                <button type="button" onClick={handleSettings} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <HiCog className="w-4 h-4" />
                  Settings
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
