import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { getPermissionsForRole, getPermissionsForRoles } from '../constants/roles'

const AUTH_KEY = 'casino_admin_auth'
const SUB_ADMINS_KEY = 'casino_sub_admins'
const TOKEN_KEY = 'token'

const defaultUser = {
  id: 1,
  email: 'admin@Betgugly.com',
  name: 'Admin User',
  role: 'super_admin',
}

/** Map API admin shape { _id, fullName, email, isActive, ... } to app shape { id, name, email, role, ... } */
function normalizeAdmin(apiAdmin) {
  if (!apiAdmin) return null
  return {
    id: apiAdmin._id ?? apiAdmin.id,
    email: apiAdmin.email ?? '',
    name: apiAdmin.fullName ?? apiAdmin.name ?? apiAdmin.email ?? 'Admin',
    role: apiAdmin.role || 'super_admin',
    ...apiAdmin,
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const permissions = useMemo(() => {
    if (!user) return []
    if (user.role === 'sub_admin' && Array.isArray(user.roles) && user.roles.length > 0) {
      return getPermissionsForRoles(user.roles)
    }
    return getPermissionsForRole(user.role)
  }, [user])
  const isLoggedIn = !!user

  const isMasterAdmin = useCallback(() => user?.role === 'super_admin', [user?.role])
  const getAssignedUserIds = useCallback(() => (user?.role === 'super_admin' ? null : (user?.assignedUserIds || [])), [user?.role, user?.assignedUserIds])

  const getSubAdminCapabilities = useCallback(
    () => {
      if (user?.role === 'super_admin') {
        return {
          maxGameExposure: null,
          canManageUserAccounts: true,
          canManagePersonalLimits: true,
          canAdjustWallets: true,
          maxAdjustAmount: null,
        }
      }
      if (user?.role === 'sub_admin') {
        return {
          maxGameExposure: user.maxGameExposure != null ? Number(user.maxGameExposure) : 100000,
          canManageUserAccounts: user.canManageUserAccounts !== false,
          canManagePersonalLimits: user.canManagePersonalLimits !== false,
          canAdjustWallets: user.canAdjustWallets !== false,
          maxAdjustAmount: user.maxAdjustAmount != null && user.maxAdjustAmount !== '' ? Number(user.maxAdjustAmount) : null,
        }
      }
      return {
        maxGameExposure: null,
        canManageUserAccounts: false,
        canManagePersonalLimits: false,
        canAdjustWallets: false,
        maxAdjustAmount: null,
      }
    },
    [user?.role, user?.maxGameExposure, user?.canManageUserAccounts, user?.canManagePersonalLimits, user?.canAdjustWallets, user?.maxAdjustAmount]
  )

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const userData = parsed.user || { ...defaultUser, ...parsed }
        setUser(userData)
        const accessToken = parsed.accessToken ?? parsed.token
        if (accessToken) sessionStorage.setItem(TOKEN_KEY, accessToken)
      } else {
        setUser(null)
        sessionStorage.removeItem(TOKEN_KEY)
      }
    } catch (_) {
      setUser(null)
      sessionStorage.removeItem(TOKEN_KEY)
    }
    setLoading(false)
  }, [])

  /** login(accessToken, adminUser, refreshToken?) – after master login API; syncs token to sessionStorage for API calls */
  function login(accessToken = 'ok', loginUser = null, refreshToken = null) {
    const u = loginUser ? normalizeAdmin(loginUser) : defaultUser
    setUser(u)
    const payload = { accessToken: accessToken || undefined, refreshToken: refreshToken || undefined, user: u }
    if (accessToken) sessionStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload))
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  /** UI access: all authenticated users pass (role-based permission list not enforced in admin panel). */
  function hasPermission(_permission) {
    if (!user) return false
    return true
  }

  function hasAnyPermission(..._perms) {
    if (!user) return false
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        permissions,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        isMasterAdmin,
        getAssignedUserIds,
        getSubAdminCapabilities,
        SUB_ADMINS_KEY,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
