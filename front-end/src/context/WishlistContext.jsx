import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [wishlistStatus, setWishlistStatus] = useState({}) // { productId: boolean }
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Fetch wishlist items with pagination
  const fetchWishlist = useCallback(async (page = 1, limit = 12) => {
    if (!user) return

    try {
      setLoading(true)
      const res = await api.get('/wishlist', { params: { page, limit } })
      if (res.data.success) {
        setWishlist(res.data.items || [])
        setWishlistCount(res.data.pagination?.total || res.data.items?.length || 0)
        setPagination(res.data.pagination || {
          page,
          limit,
          total: res.data.items?.length || 0,
          totalPages: 1
        })
        
        // Update wishlist status for all products
        const status = {}
        res.data.items.forEach(item => {
          status[item.product_id] = true
        })
        setWishlistStatus(prev => ({ ...prev, ...status }))
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlist([])
      setWishlistCount(0)
      setWishlistStatus({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // fetchWishlist is already memoized with user dependency

  // Check if product is in wishlist (only if not already in local state)
  const checkWishlistStatus = useCallback(async (productId) => {
    if (!user || !productId) return false

    // If we already know the status, don't check again
    if (wishlistStatus[productId] !== undefined) {
      return wishlistStatus[productId] === true
    }

    try {
      const res = await api.get(`/wishlist/check/${productId}`)
      if (res.data.success) {
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: res.data.inWishlist
        }))
        return res.data.inWishlist
      }
    } catch (error) {
      console.error('Check wishlist status error:', error)
    }
    return false
  }, [user, wishlistStatus])

  // Toggle wishlist (add/remove)
  const toggleWishlist = useCallback(async (productId) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để sử dụng tính năng này')
    }

    try {
      const res = await api.post('/wishlist/toggle', { product_id: productId })
      if (res.data.success) {
        const inWishlist = res.data.inWishlist !== undefined ? res.data.inWishlist : res.data.message.includes('thêm')
        
        // Update local state
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: inWishlist
        }))

        // Update wishlist count
        if (inWishlist) {
          setWishlistCount(prev => prev + 1)
          // Refresh wishlist to get full product data
          if (window.location.pathname === '/wishlist') {
            fetchWishlist()
          }
        } else {
          setWishlistCount(prev => Math.max(0, prev - 1))
          // Remove from wishlist array
          setWishlist(prev => prev.filter(item => item.product_id !== productId))
        }

        return { success: true, inWishlist, message: res.data.message }
      }
    } catch (error) {
      console.error('Toggle wishlist error:', error)
      throw error
    }
  }, [user, fetchWishlist])

  // Add to wishlist
  const addToWishlist = async (productId) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để sử dụng tính năng này')
    }

    try {
      const res = await api.post('/wishlist/add', { product_id: productId })
      if (res.data.success) {
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: true
        }))
        setWishlistCount(prev => prev + 1)
        return { success: true, message: res.data.message }
      }
    } catch (error) {
      console.error('Add to wishlist error:', error)
      throw error
    }
  }

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để sử dụng tính năng này')
    }

    try {
      const res = await api.post('/wishlist/remove', { product_id: productId })
      if (res.data.success) {
        setWishlistStatus(prev => ({
          ...prev,
          [productId]: false
        }))
        setWishlistCount(prev => Math.max(0, prev - 1))
        setWishlist(prev => prev.filter(item => item.product_id !== productId))
        return { success: true, message: res.data.message }
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      throw error
    }
  }

  // Clear wishlist
  const clearWishlist = async () => {
    if (!user) return

    try {
      const res = await api.delete('/wishlist/clear')
      if (res.data.success) {
        setWishlist([])
        setWishlistCount(0)
        setWishlistStatus({})
        return { success: true, message: res.data.message }
      }
    } catch (error) {
      console.error('Clear wishlist error:', error)
      throw error
    }
  }

  // Check if product is in wishlist (from local state)
  const isInWishlist = (productId) => {
    return wishlistStatus[productId] === true
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        pagination,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        fetchWishlist,
        checkWishlistStatus
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

