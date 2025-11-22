import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Fetch cart from API when user logs in
  const fetchCart = useCallback(async () => {
    if (!user) {
      // If no user, try to load from localStorage as fallback
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCart(parsedCart)
        } catch (error) {
          console.error('Error parsing saved cart:', error)
          setCart([])
        }
      } else {
        setCart([])
      }
      return
    }

    try {
      setLoading(true)
      const response = await api.get('/cart')
      if (response.data.success) {
        // Transform API response to match frontend format
        const cartItems = response.data.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          price: item.item_price || item.price,
          image_url: item.image_url,
          quantity: item.quantity,
          variant: item.variant_id ? {
            variant_type: item.variant_type,
            variant_value: item.variant_value
          } : null,
          stock: item.available_stock
        }))
        setCart(cartItems)
        // Clear localStorage when syncing with DB
        localStorage.removeItem('cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      // Fallback to localStorage if API fails
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCart(parsedCart)
        } catch (e) {
          setCart([])
        }
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load cart when user changes
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (product, quantity = 1, variantId = null) => {
    if (!user) {
      // If not logged in, use localStorage as fallback
      setCart(prevCart => {
        const existingItem = prevCart.find(
          item => item.product_id === product.id && 
          (!variantId || item.variant_id === variantId)
        )
        
        if (existingItem) {
          const updated = prevCart.map(item =>
            item.product_id === product.id && 
            (!variantId || item.variant_id === variantId)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          localStorage.setItem('cart', JSON.stringify(updated))
          return updated
        }
        
        const newItem = {
          product_id: product.id,
          variant_id: variantId,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity,
          variant: variantId ? product.variant : null
        }
        const updated = [...prevCart, newItem]
        localStorage.setItem('cart', JSON.stringify(updated))
        return updated
      })
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/cart', {
        product_id: product.id,
        quantity,
        variant_id: variantId
      })
      
      if (response.data.success) {
        const cartItems = response.data.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          price: item.item_price || item.price,
          image_url: item.image_url,
          quantity: item.quantity,
          variant: item.variant_id ? {
            variant_type: item.variant_type,
            variant_value: item.variant_value
          } : null,
          stock: item.available_stock
        }))
        setCart(cartItems)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId) => {
    if (!user) {
      // If not logged in, use localStorage
      setCart(prevCart => {
        const updated = prevCart.filter(item => 
          item.id !== cartItemId && item.product_id !== cartItemId
        )
        localStorage.setItem('cart', JSON.stringify(updated))
        return updated
      })
      return
    }

    try {
      setLoading(true)
      const response = await api.delete(`/cart/${cartItemId}`)
      if (response.data.success) {
        const cartItems = response.data.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          price: item.item_price || item.price,
          image_url: item.image_url,
          quantity: item.quantity,
          variant: item.variant_id ? {
            variant_type: item.variant_type,
            variant_value: item.variant_value
          } : null,
          stock: item.available_stock
        }))
        setCart(cartItems)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    if (!user) {
      // If not logged in, use localStorage
      setCart(prevCart => {
        const updated = prevCart.map(item =>
          (item.id === cartItemId || item.product_id === cartItemId)
            ? { ...item, quantity }
            : item
        )
        localStorage.setItem('cart', JSON.stringify(updated))
        return updated
      })
      return
    }

    try {
      setLoading(true)
      const response = await api.put(`/cart/${cartItemId}`, { quantity })
      if (response.data.success) {
        const cartItems = response.data.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          price: item.item_price || item.price,
          image_url: item.image_url,
          quantity: item.quantity,
          variant: item.variant_id ? {
            variant_type: item.variant_type,
            variant_value: item.variant_value
          } : null,
          stock: item.available_stock
        }))
        setCart(cartItems)
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!user) {
      setCart([])
      localStorage.removeItem('cart')
      return
    }

    try {
      setLoading(true)
      await api.delete('/cart')
      setCart([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0
      const qty = item.quantity || 0
      return total + price * qty
    }, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 0), 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

