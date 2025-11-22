import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import {
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/statistics/overview')
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Không thể tải thống kê. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.users || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Tổng sản phẩm',
      value: stats?.products || 0,
      icon: CubeIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tổng đơn hàng',
      value: stats?.orders || 0,
      icon: ShoppingBagIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(stats?.revenue || 0),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Tổng quan
        </h1>
        <p className="text-gray-600">
          Chào mừng đến với trang quản trị
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-gray-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-md`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thống kê nhanh
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Đơn hàng hôm nay</span>
              <span className="font-semibold text-gray-900">
                {stats?.today_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Doanh thu hôm nay</span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(stats?.today_revenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Sản phẩm đang hoạt động</span>
              <span className="font-semibold text-gray-900">
                {stats?.active_products || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hành động nhanh
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/products"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-all duration-200 group"
            >
              <span className="text-primary-700 font-semibold">
                + Thêm sản phẩm mới
              </span>
              <ArrowRightIcon className="h-5 w-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/admin/categories"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <span className="text-green-700 font-semibold">
                + Thêm danh mục mới
              </span>
              <ArrowRightIcon className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/admin/coupons"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all duration-200 group"
            >
              <span className="text-yellow-700 font-semibold">
                + Tạo mã giảm giá
              </span>
              <ArrowRightIcon className="h-5 w-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

