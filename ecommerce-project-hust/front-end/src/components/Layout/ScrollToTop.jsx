import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top immediately when route changes
    // Using instant scroll for better UX when navigating
    window.scrollTo(0, 0)
    
    // Also scroll the main element if it exists
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTop = 0
    }
  }, [pathname])

  return null
}

export default ScrollToTop

