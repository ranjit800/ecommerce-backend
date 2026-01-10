import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import Category from '../models/Category.js';

// Helper function to generate product slug
const generateSlug = (name, vendorId) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${vendorId.substring(0, 8)}`;
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subcategory,
      price,
      comparePrice,
      costPrice,
      stock,
      sku,
      images,
      specifications,
      variants,
      tags,
      weight,
      dimensions,
      freeShipping,
      metaTitle,
      metaDescription,
    } = req.body;

    // Get vendor profile
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    // Check if vendor is approved
    if (vendor.approvalStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account must be approved before adding products',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Generate unique slug
    const slug = generateSlug(name, vendor._id);

    // Get currency from vendor
    const currency = vendor.currency || 'INR';

    // Create product
    const product = await Product.create({
      vendor: vendor._id,
      name,
      slug,
      description,
      shortDescription,
      category,
      subcategory,
      price,
      currency,
      comparePrice,
      costPrice,
      stock,
      sku,
      images,
      specifications,
      variants,
      tags,
      weight,
      dimensions,
      freeShipping,
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || shortDescription,
      status: stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      vendor,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      status = 'ACTIVE',
    } = req.query;

    const query = {};

    // Filter by status (default to ACTIVE for public)
    if (status) query.status = status;

    // Filter by category
    if (category) query.category = category;

    // Filter by vendor
    if (vendor) query.vendor = vendor;

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate('vendor', 'shopName rating')
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-costPrice'); // Don't expose cost price publicly

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'shopName businessEmail rating totalReviews')
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Increment view count
    product.viewsCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

// @desc    Get vendor's own products
// @route   GET /api/products/vendor/my-products
// @access  Private (Vendor only)
export const getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    const query = { vendor: vendor._id };

    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor products',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor only - own products)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Verify vendor owns this product
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'description',
      'shortDescription',
      'category',
      'subcategory',
      'price',
      'comparePrice',
      'costPrice',
      'stock',
      'images',
      'specifications',
      'variants',
      'tags',
      'weight',
      'dimensions',
      'freeShipping',
      'metaTitle',
      'metaDescription',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Auto-update status based on stock
    if (req.body.stock !== undefined) {
      if (req.body.stock > 0 && product.status === 'OUT_OF_STOCK') {
        product.status = 'ACTIVE';
      } else if (req.body.stock === 0) {
        product.status = 'OUT_OF_STOCK';
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor only - own products)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Verify vendor owns this product
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
};
