// Vietnam Administrative Divisions API Service
// Using public API: https://provinces.open-api.vn/

const API_BASE = 'https://provinces.open-api.vn/api'

export const locationService = {
  // Get all provinces
  async getProvinces() {
    try {
      const response = await fetch(`${API_BASE}/p/`)
      if (!response.ok) throw new Error('Failed to fetch provinces')
      return await response.json()
    } catch (error) {
      console.error('Error fetching provinces:', error)
      // Return fallback data
      return getFallbackProvinces()
    }
  },

  // Get districts by province code
  async getDistricts(provinceCode) {
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`)
      if (!response.ok) throw new Error('Failed to fetch districts')
      const data = await response.json()
      return data.districts || []
    } catch (error) {
      console.error('Error fetching districts:', error)
      return []
    }
  },

  // Get wards by district code
  async getWards(districtCode) {
    try {
      const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`)
      if (!response.ok) throw new Error('Failed to fetch wards')
      const data = await response.json()
      return data.wards || []
    } catch (error) {
      console.error('Error fetching wards:', error)
      return []
    }
  },

  // Get full address string
  getFullAddress(province, district, ward, street) {
    const parts = [street, ward, district, province].filter(Boolean)
    return parts.join(', ')
  }
}

// Fallback data if API fails
const getFallbackProvinces = () => [
  { code: '01', name: 'Hà Nội' },
  { code: '79', name: 'Hồ Chí Minh' },
  { code: '31', name: 'Hải Phòng' },
  { code: '48', name: 'Đà Nẵng' },
  { code: '92', name: 'Cần Thơ' },
  { code: '75', name: 'An Giang' },
  { code: '77', name: 'Bà Rịa - Vũng Tàu' },
  { code: '24', name: 'Bắc Giang' },
  { code: '06', name: 'Bắc Kạn' },
  { code: '95', name: 'Bạc Liêu' },
  { code: '27', name: 'Bắc Ninh' },
  { code: '83', name: 'Bến Tre' },
  { code: '52', name: 'Bình Định' },
  { code: '74', name: 'Bình Dương' },
  { code: '70', name: 'Bình Phước' },
  { code: '60', name: 'Bình Thuận' },
  { code: '96', name: 'Cà Mau' },
  { code: '04', name: 'Cao Bằng' },
  { code: '89', name: 'Đắk Lắk' },
  { code: '67', name: 'Đắk Nông' },
  { code: '66', name: 'Điện Biên' },
  { code: '87', name: 'Đồng Nai' },
  { code: '64', name: 'Đồng Tháp' },
  { code: '68', name: 'Gia Lai' },
  { code: '02', name: 'Hà Giang' },
  { code: '35', name: 'Hà Nam' },
  { code: '42', name: 'Hà Tĩnh' },
  { code: '30', name: 'Hải Dương' },
  { code: '93', name: 'Hậu Giang' },
  { code: '17', name: 'Hòa Bình' },
  { code: '33', name: 'Hưng Yên' },
  { code: '56', name: 'Khánh Hòa' },
  { code: '91', name: 'Kiên Giang' },
  { code: '62', name: 'Kon Tum' },
  { code: '12', name: 'Lai Châu' },
  { code: '68', name: 'Lâm Đồng' },
  { code: '20', name: 'Lạng Sơn' },
  { code: '10', name: 'Lào Cai' },
  { code: '80', name: 'Long An' },
  { code: '36', name: 'Nam Định' },
  { code: '40', name: 'Nghệ An' },
  { code: '37', name: 'Ninh Bình' },
  { code: '58', name: 'Ninh Thuận' },
  { code: '25', name: 'Phú Thọ' },
  { code: '54', name: 'Phú Yên' },
  { code: '44', name: 'Quảng Bình' },
  { code: '49', name: 'Quảng Nam' },
  { code: '51', name: 'Quảng Ngãi' },
  { code: '22', name: 'Quảng Ninh' },
  { code: '45', name: 'Quảng Trị' },
  { code: '94', name: 'Sóc Trăng' },
  { code: '14', name: 'Sơn La' },
  { code: '72', name: 'Tây Ninh' },
  { code: '34', name: 'Thái Bình' },
  { code: '19', name: 'Thái Nguyên' },
  { code: '38', name: 'Thanh Hóa' },
  { code: '46', name: 'Thừa Thiên Huế' },
  { code: '82', name: 'Tiền Giang' },
  { code: '84', name: 'Trà Vinh' },
  { code: '08', name: 'Tuyên Quang' },
  { code: '86', name: 'Vĩnh Long' },
  { code: '26', name: 'Vĩnh Phúc' },
  { code: '15', name: 'Yên Bái' }
]

