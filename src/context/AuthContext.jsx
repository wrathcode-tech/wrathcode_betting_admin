import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { getPermissionsForRole, getPermissionsForRoles } from '../constants/roles'

const AUTH_KEY = 'casino_admin_auth'
const SUB_ADMINS_KEY = 'casino_sub_admins'

const defaultUser = {
  id: 1,
  email: 'admin@crownbet.com',
  name: 'Admin User',
  role: 'super_admin',
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
        setUser(parsed.user || { ...defaultUser, ...parsed })
      } else {
        setUser(null)
      }
    } catch (_) {
      setUser(null)
    }
    setLoading(false)
  }, [])

  function login(token = 'ok', loginUser = null) {
    const u = loginUser || defaultUser
    setUser(u)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user: u }))
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  function hasPermission(permission) {
    if (!user) return false
    return permissions.includes(permission)
  }

  function hasAnyPermission(...perms) {
    return perms.some((p) => hasPermission(p))
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
