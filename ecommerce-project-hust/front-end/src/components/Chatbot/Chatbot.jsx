import { useState, useRef, useEffect } from 'react'
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { toast } from 'react-toastify'
import { formatPrice } from '../../utils/formatPrice'

const Chatbot = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Xin chào! Tôi là trợ lý bán hàng. Tôi có thể giúp bạn tìm sản phẩm, kiểm tra tồn kho, và hướng dẫn đặt hàng. Bạn cần hỗ trợ gì?',
      products: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Build conversation history (exclude initial greeting)
      const conversationHistory = messages
        .slice(1) // Skip initial greeting message
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))

      const res = await api.post('/chatbot/chat', {
        message: userMessage,
        conversation_history: conversationHistory
      })

      setMessages(prev => [...prev, {
        role: 'bot',
        content: res.data.response,
        products: res.data.products || []
      }])
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi tin nhắn')
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
        products: []
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition z-[65]"
          aria-label="Mở chatbot"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[65]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-[70] border border-gray-200">
            <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold">Trợ lý bán hàng</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-700 rounded p-1 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Display product cards if available */}
                    {msg.role === 'bot' && msg.products && msg.products.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Sản phẩm được đề xuất:</p>
                        {msg.products.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              navigate(`/products/${product.id}`)
                              setIsOpen(false)
                            }}
                            className="bg-white border-2 border-gray-200 rounded-xl p-3 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <div className="flex gap-3">
                              {/* Product Image */}
                              <div className="relative flex-shrink-0">
                                <img
                                  src={product.image_url || 'https://via.placeholder.com/100?text=No+Image'}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100?text=No+Image'
                                  }}
                                />
                                {product.stock === 0 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">Hết hàng</span>
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">
                                  {product.name}
                                </h4>
                                <p className="text-primary-600 font-bold text-base mb-1">
                                  {formatPrice(product.price)}
                                </p>
                                <div className="flex items-center gap-2">
                                  {product.stock > 0 ? (
                                    <>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Còn {product.stock} sản phẩm
                                      </span>
                                    </>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      ✗ Hết hàng
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Chatbot

