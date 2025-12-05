import { useState, useEffect } from 'react'
import { locationService } from '../../services/locationService'
import Loading from '../UI/Loading'

const AddressSelector = ({ value, onChange, error }) => {
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [selectedProvince, setSelectedProvince] = useState(value?.province || '')
  const [selectedDistrict, setSelectedDistrict] = useState(value?.district || '')
  const [selectedWard, setSelectedWard] = useState(value?.ward || '')
  const [street, setStreet] = useState(value?.street || '')

  useEffect(() => {
    fetchProvinces()
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince)
    } else {
      setDistricts([])
      setWards([])
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict)
    } else {
      setWards([])
    }
  }, [selectedDistrict])

  useEffect(() => {
    if (onChange && provinces.length > 0) {
      const fullAddress = locationService.getFullAddress(
        provinces.find(p => p.code === selectedProvince)?.name,
        districts.find(d => d.code === selectedDistrict)?.name,
        wards.find(w => w.code === selectedWard)?.name,
        street
      )
      onChange({
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
        street,
        full: fullAddress
      })
    }
  }, [selectedProvince, selectedDistrict, selectedWard, street, provinces, districts, wards])

  const normalizeLocationItems = (items = []) =>
    items.map(({ code, name }) => ({
      code: String(code),
      name
    }))

  const fetchProvinces = async () => {
    setLoading(true)
    try {
      const data = await locationService.getProvinces()
      setProvinces(normalizeLocationItems(data))
    } catch (error) {
      console.error('Error fetching provinces:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDistricts = async (provinceCode) => {
    setLoading(true)
    try {
      const data = await locationService.getDistricts(provinceCode)
      setDistricts(normalizeLocationItems(data))
      setSelectedDistrict('')
      setSelectedWard('')
    } catch (error) {
      console.error('Error fetching districts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWards = async (districtCode) => {
    setLoading(true)
    try {
      const data = await locationService.getWards(districtCode)
      setWards(normalizeLocationItems(data))
      setSelectedWard('')
    } catch (error) {
      console.error('Error fetching wards:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && provinces.length === 0) {
    return <Loading size="sm" />
  }

  return (
    <div className="space-y-4">
      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="input"
          required
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      {selectedProvince && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="input"
            required
            disabled={districts.length === 0}
          >
            <option value="">
              {districts.length === 0 ? 'Đang tải...' : 'Chọn quận/huyện'}
            </option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ward */}
      {selectedDistrict && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="input"
            required
            disabled={wards.length === 0}
          >
            <option value="">
              {wards.length === 0 ? 'Đang tải...' : 'Chọn phường/xã'}
            </option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Street */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số nhà, tên đường <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="input"
          placeholder="Ví dụ: 123 Đường ABC"
          required
        />
      </div>

      {/* Full Address Preview */}
      {selectedProvince && selectedDistrict && selectedWard && street && (
        <div className="p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Địa chỉ đầy đủ:</p>
          <p className="font-medium text-gray-900">
            {locationService.getFullAddress(
              provinces.find(p => p.code === selectedProvince)?.name,
              districts.find(d => d.code === selectedDistrict)?.name,
              wards.find(w => w.code === selectedWard)?.name,
              street
            )}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default AddressSelector

