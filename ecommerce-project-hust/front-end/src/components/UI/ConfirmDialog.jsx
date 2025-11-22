import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger' // 'danger' or 'warning'
}) => {
  if (!isOpen) return null

  const bgColor = type === 'danger' 
    ? 'bg-red-50 border-red-200' 
    : 'bg-yellow-50 border-yellow-200'
  const iconColor = type === 'danger'
    ? 'text-red-600'
    : 'text-yellow-600'
  const buttonColor = type === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-yellow-600 hover:bg-yellow-700'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in">
        <div className={`p-6 border-b ${bgColor}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${iconColor} bg-white`}>
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">{message}</p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`px-4 py-2 rounded-lg text-white ${buttonColor} transition-colors font-medium shadow-md hover:shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

