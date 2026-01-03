// PageContainer component for consistent page layout
const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`min-h-[calc(100vh-4rem)] ${className}`}>
      {children}
    </div>
  )
}

export default PageContainer

