/**
 * Format price to Vietnamese currency format
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string
 * 
 * Examples:
 * formatPrice(27990000) => "27.990.000 ₫"
 * formatPrice("18990000.00") => "18.990.000 ₫"
 * formatPrice(1000000) => "1.000.000 ₫"
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₫'
  
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) return '0 ₫'
  
  // Round to remove decimals if they're .00
  const roundedPrice = Math.round(numPrice)
  
  // Format with Vietnamese locale (uses dots as thousand separators)
  return roundedPrice.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

/**
 * Format price without currency symbol (just number with separators)
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string without currency symbol
 * 
 * Examples:
 * formatPriceNumber(27990000) => "27.990.000"
 * formatPriceNumber("18990000.00") => "18.990.000"
 */
export const formatPriceNumber = (price) => {
  if (!price && price !== 0) return '0'
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) return '0'
  
  const roundedPrice = Math.round(numPrice)
  
  return roundedPrice.toLocaleString('vi-VN')
}

