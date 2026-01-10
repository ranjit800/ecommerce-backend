import Vendor from '../models/Vendor.js';
import User from '../models/User.js';

// @desc    Get all vendor applications (for approval)
// @route   GET /api/superadmin/vendors
// @access  Private (SuperAdmin only)
export const getAllVendors = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.approvalStatus = status.toUpperCase();
    }

    const vendors = await Vendor.find(query)
      .populate('user', 'email firstName lastName mobile')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Vendor.countDocuments(query);

    res.status(200).json({
      success: true,
      vendors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
    });
  }
};

// @desc    Get vendor details by ID
// @route   GET /api/superadmin/vendors/:id
// @access  Private (SuperAdmin only)
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'email firstName lastName mobile createdAt')
      .populate('approvedBy', 'firstName lastName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    res.status(200).json({
      success: true,
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor details',
    });
  }
};

// @desc    Approve vendor application
// @route   PUT /api/superadmin/vendors/:id/approve
// @access  Private (SuperAdmin only)
export const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    if (vendor.approvalStatus === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Vendor is already approved',
      });
    }

    vendor.approvalStatus = 'APPROVED';
    vendor.approvedBy = req.user._id;
    vendor.approvedAt = new Date();
    vendor.rejectionReason = null;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve vendor',
    });
  }
};

// @desc    Reject vendor application
// @route   PUT /api/superadmin/vendors/:id/reject
// @access  Private (SuperAdmin only)
export const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason',
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    vendor.approvalStatus = 'REJECTED';
    vendor.rejectionReason = reason;
    vendor.approvedBy = req.user._id;
    vendor.approvedAt = new Date();

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor application rejected',
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject vendor',
    });
  }
};

// @desc    Suspend vendor
// @route   PUT /api/superadmin/vendors/:id/suspend
// @access  Private (SuperAdmin only)
export const suspendVendor = async (req, res) => {
  try {
    const { reason } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    vendor.approvalStatus = 'SUSPENDED';
    vendor.rejectionReason = reason || 'Suspended by SuperAdmin';
    vendor.isActive = false;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor suspended successfully',
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to suspend vendor',
    });
  }
};

// @desc    Update vendor commission rate
// @route   PUT /api/superadmin/vendors/:id/commission
// @access  Private (SuperAdmin only)
export const updateVendorCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body;

    if (!commissionRate || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid commission rate. Must be between 0-100',
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    vendor.commissionRate = commissionRate;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Commission rate updated successfully',
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update commission rate',
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/superadmin/stats
// @access  Private (SuperAdmin only)
export const getPlatformStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ approvalStatus: 'PENDING' });
    const approvedVendors = await Vendor.countDocuments({ approvalStatus: 'APPROVED' });
    const rejectedVendors = await Vendor.countDocuments({ approvalStatus: 'REJECTED' });
    const suspendedVendors = await Vendor.countDocuments({ approvalStatus: 'SUSPENDED' });

    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'CUSTOMER' });
    const vendorCount = await User.countDocuments({ role: 'VENDOR' });

    // Calculate total platform sales and commission
    const vendors = await Vendor.find({ approvalStatus: 'APPROVED' });
    let totalPlatformSales = 0;
    let totalPlatformCommission = 0;

    vendors.forEach((vendor) => {
      totalPlatformSales += vendor.totalSales;
      totalPlatformCommission += (vendor.totalSales * vendor.commissionRate) / 100;
    });

    res.status(200).json({
      success: true,
      stats: {
        vendors: {
          total: totalVendors,
          pending: pendingVendors,
          approved: approvedVendors,
          rejected: rejectedVendors,
          suspended: suspendedVendors,
        },
        users: {
          total: totalUsers,
          customers: customerCount,
          vendors: vendorCount,
        },
        sales: {
          totalPlatformSales,
          totalPlatformCommission,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform stats',
    });
  }
};
