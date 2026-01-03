import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1)
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2)
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      // Show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                page === currentPage
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
              aria-label={`Trang ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Trang sau"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

export default Pagination

