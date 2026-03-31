import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiShieldExclamation } from 'react-icons/hi'

export default function ProtectedRoute({ children, requiredPermission, requiredRole }) {
  const { isLoggedIn, loading, user, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const AccessDenied = ({ message = "You don't have permission to view this page." }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md rounded-xl bg-white border border-gray-200 p-6 text-center shadow-sm">
        <HiShieldExclamation className="w-12 h-12 text-teal-500 mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-gray-900">Access denied</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )

  // if (requiredPermission && !hasPermission(requiredPermission)) {
  //   return <AccessDenied />
  // }

  // if (requiredRole && user?.role !== requiredRole) {
  //   return <AccessDenied message="This page is restricted to a specific role." />
  // }

  return children
}
