import { Link } from 'react-router-dom'
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { label: 'Về chúng tôi', to: '/about' },
      { label: 'Tuyển dụng', to: '/careers' },
      { label: 'Liên hệ', to: '/contact' },
      { label: 'Tin tức', to: '/news' }
    ],
    support: [
      { label: 'Hướng dẫn mua hàng', to: '/help' },
      { label: 'Chính sách đổi trả', to: '/return-policy' },
      { label: 'Vận chuyển', to: '/shipping' },
      { label: 'Bảo hành', to: '/warranty' }
    ],
    legal: [
      { label: 'Điều khoản sử dụng', to: '/terms' },
      { label: 'Chính sách bảo mật', to: '/privacy' },
      { label: 'Chính sách cookie', to: '/cookies' }
    ]
  }

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🛍️</span>
              </div>
              <span className="text-2xl font-display font-bold">TechStore</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Địa chỉ mua sắm công nghệ hàng đầu với đa dạng sản phẩm chất lượng cao và dịch vụ chăm sóc khách hàng tận tâm.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                aria-label="Facebook"
              >
                <span className="text-lg">📘</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                aria-label="Instagram"
              >
                <span className="text-lg">📷</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                aria-label="Twitter"
              >
                <span className="text-lg">🐦</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                aria-label="YouTube"
              >
                <span className="text-lg">📺</span>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Đường ABC, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <a
                  href="tel:1900123456"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  1900-123-456
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <a
                  href="mailto:support@techstore.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  support@techstore.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Đăng ký nhận tin</h4>
              <form className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} TechStore. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
