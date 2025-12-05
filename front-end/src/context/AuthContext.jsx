import { createContext, useState, useContext, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        try {
          // Verify token is still valid by calling /auth/me
          const res = await api.get('/auth/me')
          if (res.data.success && res.data.user) {
            setUser(res.data.user)
            localStorage.setItem('user', JSON.stringify(res.data.user))
          } else {
            throw new Error('Invalid response')
          }
        } catch (error) {
          // Token is invalid or expired - silently clear and continue
          console.log('Token verification failed, clearing auth data')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        // No token or user, ensure clean state
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Đăng nhập thất bại')
      }

      const { token, user } = res.data
      
      if (!token || !user) {
        throw new Error('Phản hồi từ server không hợp lệ')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      return res.data
    } catch (error) {
      // Re-throw with proper error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData)
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Đăng ký thất bại')
      }

      const { token, user } = res.data
      
      if (!token || !user) {
        throw new Error('Phản hồi từ server không hợp lệ')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      return res.data
    } catch (error) {
      // Re-throw with proper error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData)
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Cập nhật thất bại')
      }

      const updatedUser = res.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return res.data
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await api.put('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      })
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Đổi mật khẩu thất bại')
      }

      return res.data
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email })
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Gửi email thất bại')
      }

      return res.data
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      })
      
      if (!res.data.success) {
        throw new Error(res.data.message || 'Đặt lại mật khẩu thất bại')
      }

      return res.data
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        logout, 
        loading,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

