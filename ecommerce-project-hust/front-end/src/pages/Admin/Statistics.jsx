import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { formatPrice } from '../../utils/formatPrice'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CubeIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

const Statistics = () => {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // 7, 30, 90, 365
  const [revenueStats, setRevenueStats] = useState([])
  const [productStats, setProductStats] = useState({ top_selling: [], low_stock: [] })
  const [categoryStats, setCategoryStats] = useState([])
  const [customerStats, setCustomerStats] = useState([])

  useEffect(() => {
    fetchAllStats()
  }, [dateRange])

  const fetchAllStats = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      // Fetch all statistics in parallel
      const [revenueRes, productRes, categoryRes, customerRes, dashboardRes] = await Promise.all([
        api.get('/statistics/revenue', { params: { start_date: startDate, end_date: endDate } }),
        api.get('/statistics/products'),
        api.get('/statistics/categories'),
        api.get('/statistics/customers'),
        api.get('/statistics/overview')
      ])

      setRevenueStats(revenueRes.data.stats || [])
      setProductStats(productRes.data || { top_selling: [], low_stock: [] })
      setCategoryStats(categoryRes.data.stats || [])
      setCustomerStats(customerRes.data.customers || [])
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast.error('Không thể tải thống kê. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }

  // Format number for Y-axis (abbreviate large numbers)
  const formatYAxis = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}T`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Format number for X-axis in bar chart
  const formatXAxis = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0'
    }
    const numValue = Number(value)
    if (numValue >= 1000000000) {
      return `${(numValue / 1000000000).toFixed(1)}T`
    }
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(1)}M`
    }
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}K`
    }
    return Math.round(numValue).toString()
  }

  if (loading) {
    return <Loading />
  }

  // Prepare data for charts
  const revenueChartData = revenueStats.map(stat => ({
    date: formatDate(stat.date),
    doanh_thu: parseFloat(stat.revenue || 0),
    don_hang: parseInt(stat.order_count || 0),
    giam_gia: parseFloat(stat.total_discount || 0)
  }))

  const topProductsData = productStats.top_selling?.slice(0, 10).map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    doanh_thu: parseFloat(product.total_revenue || 0),
    so_luong: parseInt(product.total_sold || 0)
  })) || []

  const categoryChartData = categoryStats.slice(0, 8).map(cat => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
    value: parseFloat(cat.revenue || 0),
    products: parseInt(cat.product_count || 0),
    sold: parseInt(cat.total_sold || 0)
  }))

  const totalRevenue = revenueChartData.reduce((sum, item) => sum + item.doanh_thu, 0)
  const totalOrders = revenueChartData.reduce((sum, item) => sum + item.don_hang, 0)
  const totalDiscount = revenueChartData.reduce((sum, item) => sum + item.giam_gia, 0)

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Báo cáo thống kê
          </h1>
          <p className="text-gray-600">
            Phân tích và theo dõi hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Khoảng thời gian:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
            <option value="365">1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-2">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-2">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-green-900">{totalOrders}</p>
            </div>
            <ShoppingBagIcon className="h-12 w-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-2">Tổng giảm giá</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatPrice(totalDiscount)}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 mb-2">Sản phẩm bán chạy</p>
              <p className="text-2xl font-bold text-yellow-900">
                {productStats.top_selling?.length || 0}
              </p>
            </div>
            <CubeIcon className="h-12 w-12 text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
          Doanh thu theo thời gian
        </h2>
        <ResponsiveContainer width="100%" height={480}>
          <AreaChart data={revenueChartData} margin={{ top: 10, right: 20, left: 10, bottom: 100 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={100}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickFormatter={formatYAxis}
              width={100}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              formatter={(value, name) => {
                if (name === 'doanh_thu' || name === 'giam_gia') {
                  return [formatPrice(value), name === 'doanh_thu' ? 'Doanh thu' : 'Giảm giá']
                }
                return [value, name === 'don_hang' ? 'Đơn hàng' : name]
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="doanh_thu"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Doanh thu"
            />
            <Area
              type="monotone"
              dataKey="giam_gia"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              name="Giảm giá"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBagIcon className="h-6 w-6 text-primary-600" />
          Số lượng đơn hàng theo thời gian
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 11 }}
              width={60}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="don_hang"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 4 }}
              name="Số đơn hàng"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CubeIcon className="h-6 w-6 text-primary-600" />
            Top 10 sản phẩm bán chạy
          </h2>
          {topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 40, left: 180, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  stroke="#6B7280"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={formatXAxis}
                  width={100}
                  domain={['auto', 'auto']}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={170}
                  stroke="#6B7280"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={0}
                  tickFormatter={(value) => {
                    // Show full name in tooltip, but truncate in chart if too long
                    if (value.length > 25) {
                      return value.substring(0, 22) + '...'
                    }
                    return value
                  }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value, name, props) => {
                    const productName = props.payload?.name || ''
                    if (name === 'doanh_thu') {
                      return [
                        <div key="tooltip" className="space-y-1">
                          <div className="font-semibold text-gray-900">{productName}</div>
                          <div className="text-primary-600">{formatPrice(value)}</div>
                        </div>,
                        'Doanh thu'
                      ]
                    }
                    return [value, 'Số lượng']
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="left"
                  wrapperStyle={{
                    paddingTop: '10px',
                    paddingLeft: '0',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    display: 'flex'
                  }}
                  iconSize={12}
                />
                <Bar dataKey="doanh_thu" fill="#3B82F6" name="Doanh thu" radius={[0, 4, 4, 0]} />
                <Bar dataKey="so_luong" fill="#10B981" name="Số lượng" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chưa có dữ liệu sản phẩm
            </div>
          )}
        </div>

        {/* Category Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
            Doanh thu theo danh mục
          </h2>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' }}
                  formatter={(value, name, props) => {
                    const percent = ((props.payload.value / categoryChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
                    return [
                      <div key="tooltip">
                        <div className="font-semibold">{props.payload.name}</div>
                        <div className="text-primary-600">{formatPrice(value)}</div>
                        <div className="text-gray-500 text-sm">{percent}%</div>
                      </div>
                    ]
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={80}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value, entry) => {
                    const item = categoryChartData.find(d => d.name === value)
                    const total = categoryChartData.reduce((sum, d) => sum + d.value, 0)
                    const percent = item ? ((item.value / total) * 100).toFixed(1) : '0'
                    return `${value} (${percent}%)`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chưa có dữ liệu danh mục
            </div>
          )}
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-primary-600" />
          Top 10 khách hàng
        </h2>
        {customerStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerStats.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.full_name || customer.username || 'Khách hàng'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.order_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                      {formatPrice(parseFloat(customer.total_spent || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Chưa có dữ liệu khách hàng
          </div>
        )}
      </div>

      {/* Low Stock Products */}
      {productStats.low_stock && productStats.low_stock.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CubeIcon className="h-6 w-6 text-red-600" />
            Sản phẩm sắp hết hàng
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productStats.low_stock.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {product.stock} sản phẩm
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics
