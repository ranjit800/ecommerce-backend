import Vendor from '../models/Vendor.js';
import Shop from '../models/Shop.js';
import User from '../models/User.js';

// Helper function to generate shop slug
const generateSlug = (shopName) => {
  return shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Apply to become a vendor (update user role + create vendor profile)
// @route   POST /api/vendor/apply
// @access  Private (authenticated users only)
export const applyAsVendor = async (req, res) => {
  try {
    const {
      shopName,
      shopDescription,
      businessEmail,
      businessPhone,
      businessAddress,
      gstNumber,
      taxId,
    } = req.body;

    // Check if user already has a vendor profile
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied as a vendor',
        vendorStatus: existingVendor.approvalStatus,
      });
    }

    // Check if shop name is already taken
    const shopExists = await Vendor.findOne({ shopName });
    if (shopExists) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is already taken',
      });
    }

    // Determine currency based on country
    const country = businessAddress?.country || 'India';
    const currency = country === 'India' ? 'INR' : 'USD';

    // Create vendor profile
    const vendor = await Vendor.create({
      user: req.user._id,
      shopName,
      shopDescription,
      businessEmail,
      businessPhone,
      businessAddress,
      currency,
      gstNumber: country === 'India' ? gstNumber : undefined,
      taxId: country === 'USA' ? taxId : undefined,
      approvalStatus: 'PENDING',
      commissionRate: process.env.DEFAULT_COMMISSION_RATE || 15,
    });

    // Create shop profile with slug
    const slug = generateSlug(shopName);
    await Shop.create({
      vendor: vendor._id,
      slug,
    });

    // Update user role to VENDOR
    await User.findByIdAndUpdate(req.user._id, { role: 'VENDOR' });

    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully. Awaiting approval.',
      vendor: {
        _id: vendor._id,
        shopName: vendor.shopName,
        approvalStatus: vendor.approvalStatus,
        shopUrl: `/shop/${slug}`,
      },
    });
  } catch (error) {
    console.error('Vendor application error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit vendor application',
    });
  }
};

// @desc    Get vendor profile (own)
// @route   GET /api/vendor/profile
// @access  Private (Vendor only)
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate(
      'user',
      'email firstName lastName'
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    const shop = await Shop.findOne({ vendor: vendor._id });

    res.status(200).json({
      success: true,
      vendor,
      shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile',
    });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendor/profile
// @access  Private (Vendor only)
export const updateVendorProfile = async (req, res) => {
  try {
    const {
      shopDescription,
      businessEmail,
      businessPhone,
      businessAddress,
      taxId,
      bankDetails,
    } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    // Update allowed fields
    if (shopDescription) vendor.shopDescription = shopDescription;
    if (businessEmail) vendor.businessEmail = businessEmail;
    if (businessPhone) vendor.businessPhone = businessPhone;
    if (businessAddress) vendor.businessAddress = businessAddress;
    if (taxId) vendor.taxId = taxId;
    if (bankDetails) vendor.bankDetails = bankDetails;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully',
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile',
    });
  }
};

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/stats
// @access  Private (Vendor only)
export const getVendorStats = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    const stats = {
      totalSales: vendor.totalSales,
      totalEarnings: vendor.totalEarnings,
      totalOrders: vendor.totalOrders,
      rating: vendor.rating,
      totalReviews: vendor.totalReviews,
      commissionRate: vendor.commissionRate,
      approvalStatus: vendor.approvalStatus,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor stats',
    });
  }
};

// @desc    Update shop settings
// @route   PUT /api/vendor/shop
// @access  Private (Vendor only)
export const updateShopSettings = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    const shop = await Shop.findOne({ vendor: vendor._id });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop profile not found',
      });
    }

    const { socialMedia, policies, operatingHours } = req.body;

    // Initialize nested objects if they don't exist
    if (!shop.socialMedia) shop.socialMedia = {};
    if (!shop.policies) shop.policies = {};
    if (!shop.operatingHours) shop.operatingHours = {};

    // Update nested objects
    if (socialMedia) {
      shop.socialMedia = { ...shop.socialMedia.toObject(), ...socialMedia };
    }
    if (policies) {
      shop.policies = { ...shop.policies.toObject(), ...policies };
    }
    if (operatingHours) {
      shop.operatingHours = { ...shop.operatingHours.toObject(), ...operatingHours };
    }

    await shop.save();

    res.status(200).json({
      success: true,
      message: 'Shop settings updated successfully',
      shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update shop settings',
    });
  }
};
