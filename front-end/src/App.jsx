import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'

import Layout from './components/Layout/Layout'
import ScrollToTop from './components/Layout/ScrollToTop'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import PublicRoute from './components/Auth/PublicRoute'
import AdminRoute from './components/Auth/AdminRoute'
import AdminLayout from './components/Admin/AdminLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import PaymentCallback from './pages/PaymentCallback'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminUsers from './pages/Admin/Users'
import AdminProducts from './pages/Admin/Products'
import AdminCategories from './pages/Admin/Categories'
import AdminCoupons from './pages/Admin/Coupons'
import AdminOrders from './pages/Admin/Orders'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              
              {/* Auth Routes - Only accessible when NOT logged in */}
              <Route 
                path="login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } 
              />
              <Route 
                path="reset-password" 
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                } 
              />
              
              {/* Protected Routes - Only accessible when logged in */}
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="wishlist" 
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="orders/:id" 
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Payment Callback Routes */}
              <Route path="payment/callback" element={<PaymentCallback />} />
              <Route path="payment/success" element={<PaymentCallback />} />
              <Route path="payment/failed" element={<PaymentCallback />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="admin/products"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="admin/categories"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="admin/coupons"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminCoupons />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

