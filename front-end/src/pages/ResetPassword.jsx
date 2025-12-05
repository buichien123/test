import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { LockClosedIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Link không hợp lệ')
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, formData.password)
      setSuccess(true)
      toast.success('Đặt lại mật khẩu thành công!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card p-8 animate-fade-in text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Đặt lại mật khẩu thành công!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập...
            </p>

            <Link
              to="/login"
              className="btn btn-primary w-full"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl mb-4">
              <LockClosedIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu
            </h2>
            <p className="text-gray-600">
              Nhập mật khẩu mới của bạn
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Đang xử lý...
                </span>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

