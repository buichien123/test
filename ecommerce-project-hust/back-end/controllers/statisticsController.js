const statisticsService = require('../services/statisticsService');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = await statisticsService.getDashboardStats();

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const startDate = req.query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = req.query.end_date || new Date().toISOString().split('T')[0];

    const stats = await statisticsService.getRevenueStats(startDate, endDate);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Get product statistics
const getProductStats = async (req, res) => {
  try {
    const stats = await statisticsService.getProductStats();

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const stats = await statisticsService.getCategoryStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const stats = await statisticsService.getCustomerStats();

    res.json({
      success: true,
      customers: stats
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueStats,
  getProductStats,
  getCategoryStats,
  getCustomerStats
};

