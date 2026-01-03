import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../UI/Loading'

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  // If user is logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PublicRoute

