import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import Pagination from '../../components/UI/Pagination'
import { formatPrice } from '../../utils/formatPrice'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import RichTextEditor from '../../components/Editor/RichTextEditor'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    status: 'active'
  })
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [page, search, categoryFilter])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 20,
        include_inactive: true,
        ...(search && { search }),
        ...(categoryFilter && { category_id: categoryFilter })
      }
      const res = await api.get('/products', { params })
      setProducts(res.data.products)
      setPagination(res.data.pagination)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sản phẩm')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleEdit = async (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      status: product.status || 'active'
    })

    // Fetch full product details including variants and images
    try {
      const res = await api.get(`/products/${product.id}`)
      const fullProduct = res.data.product
      
      // Load variants
      if (fullProduct.variants && fullProduct.variants.length > 0) {
        setVariants(fullProduct.variants.map(v => ({
          type: v.variant_type,
          value: v.variant_value,
          price_adjustment: v.price_adjustment || 0,
          stock: v.stock || 0,
          sku: v.sku || ''
        })))
      } else {
        setVariants([])
      }
      
      // Load images
      if (fullProduct.images && fullProduct.images.length > 0) {
        setImages(fullProduct.images.map(img => ({
          url: img.image_url,
          is_primary: img.is_primary === 1 || img.is_primary === true,
          display_order: img.display_order || 0
        })))
      } else {
        // If no images in product_images table, use image_url from product
        if (product.image_url) {
          setImages([{
            url: product.image_url,
            is_primary: true,
            display_order: 0
          }])
        } else {
          setImages([])
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
      setVariants([])
      setImages([])
    }

    setShowModal(true)
  }

  const handleDeleteClick = (productId) => {
    setDeleteConfirm({ isOpen: true, productId })
  }

  const handleDelete = async () => {
    const productId = deleteConfirm.productId
    try {
      await api.delete(`/products/${productId}`)
      toast.success('Xóa sản phẩm thành công')
      setDeleteConfirm({ isOpen: false, productId: null })
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm')
      // Don't close modal on error so user can retry
    }
  }

  const addVariant = () => {
    setVariants([...variants, {
      type: '',
      value: '',
      price_adjustment: 0,
      stock: 0,
      sku: ''
    }])
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  // Image management functions
  const addImage = () => {
    setImages([...images, {
      url: '',
      is_primary: images.length === 0, // First image is primary by default
      display_order: images.length
    }])
  }

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index)
    // If we removed the primary image, make the first one primary
    if (images[index].is_primary && updated.length > 0) {
      updated[0].is_primary = true
    }
    // Reorder display_order
    updated.forEach((img, i) => {
      img.display_order = i
    })
    setImages(updated)
  }

  const updateImage = (index, field, value) => {
    const updated = [...images]
    updated[index] = { ...updated[index], [field]: value }
    setImages(updated)
  }

  const setPrimaryImage = (index) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }))
    setImages(updated)
  }

  const moveImage = (index, direction) => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === images.length - 1) return

    const updated = [...images]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    // Update display_order
    updated.forEach((img, i) => {
      img.display_order = i
    })
    setImages(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validate images
      const validImages = images.filter(img => img.url && img.url.trim() !== '')
      if (validImages.length === 0) {
        toast.error('Vui lòng thêm ít nhất một hình ảnh cho sản phẩm')
        return
      }

      // Ensure at least one image is primary
      const hasPrimary = validImages.some(img => img.is_primary)
      if (!hasPrimary) {
        validImages[0].is_primary = true
      }

      // Set image_url to primary image URL for backward compatibility
      const primaryImage = validImages.find(img => img.is_primary) || validImages[0]

      const submitData = {
        ...formData,
        image_url: primaryImage.url,
        images: validImages.map((img, index) => ({
          url: img.url,
          is_primary: img.is_primary,
          display_order: index
        })),
        variants: variants.filter(v => v.type && v.value) // Only include variants with type and value
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, submitData)
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        await api.post('/products', submitData)
        toast.success('Tạo sản phẩm thành công')
      }
      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        status: 'active'
      })
      setVariants([])
      setImages([])
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu sản phẩm')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setPage(1)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Quản lý sản phẩm
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả sản phẩm trong hệ thống
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              stock: '',
              category_id: '',
              image_url: '',
              status: 'active'
            })
            setVariants([])
            setImages([])
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={handleSearch}
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="input md:w-64"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {(search || categoryFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <XMarkIcon className="h-4 w-4" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tồn kho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Không có sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/60x60'}
                            alt={product.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {product.description
                              ? product.description.replace(/<[^>]*>/g, '').substring(0, 100) + (product.description.replace(/<[^>]*>/g, '').length > 100 ? '...' : '')
                              : 'Chưa có mô tả'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatPrice(parseFloat(product.price))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {product.status === 'active' ? 'Hoạt động' : 'Ngừng bán'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} sản phẩm
              </div>
              {pagination.pages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-all animate-scale-in">
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingProduct(null)
                  setVariants([])
                  setImages([])
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} id="product-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="input"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngừng bán</option>
                    </select>
                  </div>
                </div>

                {/* Images Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Hình ảnh sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addImage}
                      className="btn btn-outline btn-sm flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Thêm ảnh
                    </button>
                  </div>

                  {images.length === 0 ? (
                    <p className="text-sm text-gray-500 italic mb-3">Chưa có hình ảnh nào. Nhấn "Thêm ảnh" để thêm.</p>
                  ) : (
                    <div className="space-y-3">
                      {images.map((image, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Ảnh #{index + 1}</span>
                              {image.is_primary && (
                                <span className="px-2 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded">
                                  Ảnh chính
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!image.is_primary && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(index)}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                  Đặt làm ảnh chính
                                </button>
                              )}
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'up')}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Di chuyển lên"
                                >
                                  ↑
                                </button>
                              )}
                              {index < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, 'down')}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Di chuyển xuống"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                URL hình ảnh <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="url"
                                value={image.url}
                                onChange={(e) => updateImage(index, 'url', e.target.value)}
                                className="input input-sm"
                                placeholder="https://example.com/image.jpg"
                                required
                              />
                            </div>
                            {image.url && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Xem trước
                                </label>
                                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  <img
                                    src={image.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/200x200?text=Invalid+URL'
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variants Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Biến thể sản phẩm (Size, Color, v.v.)
                    </label>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="btn btn-outline btn-sm flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Thêm biến thể
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Chưa có biến thể nào. Nhấn "Thêm biến thể" để thêm.</p>
                  ) : (
                    <div className="space-y-3">
                      {variants.map((variant, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-medium text-gray-700">Biến thể #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Loại (Size/Color/Storage) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={variant.type}
                                onChange={(e) => updateVariant(index, 'type', e.target.value)}
                                className="input input-sm"
                                placeholder="VD: size, color, storage"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Giá trị <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={variant.value}
                                onChange={(e) => updateVariant(index, 'value', e.target.value)}
                                className="input input-sm"
                                placeholder="VD: 41mm, Midnight, 256GB"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Điều chỉnh giá (₫)
                              </label>
                              <input
                                type="number"
                                value={variant.price_adjustment}
                                onChange={(e) => updateVariant(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                className="input input-sm"
                                placeholder="0"
                                step="1000"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Tồn kho
                              </label>
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                className="input input-sm"
                                placeholder="0"
                                min="0"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                SKU (Mã sản phẩm)
                              </label>
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                className="input input-sm"
                                placeholder="VD: PROD-SIZE-COLOR"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingProduct(null)
                  setVariants([])
                  setImages([])
                }}
                className="flex-1 btn btn-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="product-form"
                className="flex-1 btn btn-primary"
              >
                {editingProduct ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  )
}

export default Products

