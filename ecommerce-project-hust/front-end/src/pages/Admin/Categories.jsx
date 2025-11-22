import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import Loading from '../../components/UI/Loading'
import Pagination from '../../components/UI/Pagination'
import ConfirmDialog from '../../components/UI/ConfirmDialog'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, categoryId: null })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [page, search])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 20,
        ...(search && { search })
      }
      const res = await api.get('/categories', { params })
      setCategories(res.data.categories)
      setPagination(res.data.pagination)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách danh mục')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || ''
    })
    setShowModal(true)
  }

  const handleDeleteClick = (categoryId) => {
    setDeleteConfirm({ isOpen: true, categoryId })
  }

  const handleDelete = async () => {
    const categoryId = deleteConfirm.categoryId
    try {
      await api.delete(`/categories/${categoryId}`)
      toast.success('Xóa danh mục thành công')
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa danh mục')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData)
        toast.success('Cập nhật danh mục thành công')
      } else {
        await api.post('/categories', formData)
        toast.success('Tạo danh mục thành công')
      }
      setShowModal(false)
      setEditingCategory(null)
      setFormData({
        name: '',
        description: '',
        image_url: ''
      })
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu danh mục')
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Quản lý danh mục
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả danh mục sản phẩm
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({
              name: '',
              description: '',
              image_url: ''
            })
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6 shadow-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={handleSearch}
            className="input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Không có danh mục nào</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="mb-4">
                  <img
                    src={category.image_url || 'https://via.placeholder.com/300x200'}
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 btn btn-outline flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category.id)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
          </div>

          {pagination.total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} danh mục
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
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
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Hủy
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, categoryId: null })}
        onConfirm={handleDelete}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  )
}

export default Categories

