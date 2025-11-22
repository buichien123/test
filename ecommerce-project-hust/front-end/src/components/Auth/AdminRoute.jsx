import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../UI/Loading'

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute

