import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await forgotPassword(email)
      setSent(true)
      toast.success('Email đặt lại mật khẩu đã được gửi!')
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl mb-4">
              <EnvelopeIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Quên mật khẩu?
            </h2>
            <p className="text-gray-600">
              {sent 
                ? 'Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn'
                : 'Nhập email của bạn để nhận link đặt lại mật khẩu'
              }
            </p>
          </div>

          {!sent ? (
            <>
              {/* Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="your@email.com"
                    />
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
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi link đặt lại mật khẩu'
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
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Vui lòng kiểm tra hộp thư email của bạn
                  </p>
                  <p className="text-sm text-gray-500">
                    Nếu không thấy email, hãy kiểm tra thư mục spam
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Gửi lại email
                  </button>
                  <Link
                    to="/login"
                    className="block text-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

