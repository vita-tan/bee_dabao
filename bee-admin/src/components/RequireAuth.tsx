import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default RequireAuth
