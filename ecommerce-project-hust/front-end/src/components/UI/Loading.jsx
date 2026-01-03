const Loading = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className={`inline-block animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}></div>
    </div>
  )
}

export default Loading

