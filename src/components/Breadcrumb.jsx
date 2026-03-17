import { Link, useLocation } from 'react-router-dom'
import { HiChevronRight, HiHome } from 'react-icons/hi'

const routeNames = {
  '': 'Dashboard',
  users: 'User List',
  'sub-admins': 'Sub Admin Management',
  wallets: 'Wallets',
  games: 'Games',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  transactions: 'Transactions',
  bonuses: 'Bonuses',
  referrals: 'Referrals',
  'risk-fraud': 'Risk & Fraud',
  reports: 'Reports',
  cms: 'CMS',
  support: 'Support',
  notifications: 'Notifications',
  'audit-logs': 'Admin Logs',
  'deposit-accounts': 'Deposit Accounts',
  profile: 'Profile',
  settings: 'Settings',
}

export default function Breadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const isUserDetails = segments[0] === 'users' && segments[1] && segments.length === 2
  const items = [{ path: '/', label: 'Dashboard' }, ...segments.map((s, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/')
    let label = routeNames[s] || s
    if (isUserDetails && i === 1) label = 'User Details'
    return { path, label }
  })]

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.path} className="flex items-center gap-1.5">
          {i > 0 && <HiChevronRight className="text-gray-400 w-4 h-4 flex-shrink-0" />}
          {i === items.length - 1 ? (
            <span className="text-teal-600 font-medium flex items-center gap-1.5">
              {i === 0 && <HiHome className="w-4 h-4" />}
              {item.label}
            </span>
          ) : (
            <Link to={item.path} className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
              {i === 0 && <HiHome className="w-4 h-4" />}
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
