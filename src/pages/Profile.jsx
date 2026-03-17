/**
 * Logged-in user's own profile – name, email, role (read-only).
 * No special permission; any authenticated user can view.
 */
import { useAuth } from '../context/AuthContext'
import PageBanner from '../components/PageBanner'
import { HiUser, HiMail, HiShieldCheck } from 'react-icons/hi'

export default function Profile() {
  const { user } = useAuth()

  const roleLabel = (user?.role || 'super_admin').replace(/_/g, ' ')

  return (
    <div className="space-y-6">
      <PageBanner title="My Profile" subtitle="Your account details" icon={HiUser} />

      <div className="max-w-lg">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-emerald-600/20 flex items-center justify-center text-teal-600 text-2xl font-bold border border-teal-500/20">
              {(user?.name || 'U')[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-500 text-sm capitalize">{roleLabel}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3">
              <HiUser className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Name</p>
                <p className="text-gray-800">{user?.name || '–'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiMail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                <p className="text-gray-800">{user?.email || '–'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HiShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Role</p>
                <p className="text-gray-800 capitalize">{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
