import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    address: ''
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(profileData)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      toast.error(error.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setPasswordLoading(true)

    try {
      await changePassword(passwordData.old_password, passwordData.new_password)
      toast.success('Đổi mật khẩu thành công')
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      toast.error(error.message || 'Đổi mật khẩu thất bại')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Thông tin cá nhân
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Đổi mật khẩu
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Thông tin cá nhân
              </h2>
              <p className="text-sm text-gray-600">
                Cập nhật thông tin cá nhân của bạn
              </p>
            </div>

            {/* User Info Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Tên đăng nhập</p>
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                {user.role && (
                  <div className="flex items-center">
                    <div className="h-5 w-5 mr-3 flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vai trò</p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="input pl-10"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input pl-10"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="input pl-10"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfileData({
                      full_name: user.full_name || '',
                      phone: user.phone || '',
                      address: user.address || ''
                    })
                  }}
                  className="btn btn-secondary flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex items-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đổi mật khẩu
              </h2>
              <p className="text-sm text-gray-600">
                Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="old_password"
                    name="old_password"
                    type="password"
                    required
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className="input pl-10"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="input pl-10"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="input pl-10"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Mẹo tạo mật khẩu mạnh:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Sử dụng ít nhất 6 ký tự</li>
                  <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                  <li>• Không chia sẻ mật khẩu với người khác</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/40 border-t-white"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5" />
                      Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

