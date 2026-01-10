import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'CASH_ON_DELIVERY', customerNotes } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address with fullName and phone is required',
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Group cart items by vendor
    const vendorGroups = {};
    
    for (const item of cart.items) {
      const vendorId = item.vendor.toString();
      
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          items: [],
          subtotal: 0,
          currency: item.currency,
        };
      }

      // Verify product still available
      if (!item.product || item.product.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product?.name || 'Unknown'}" is no longer available`,
        });
      }

      // Verify stock
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available`,
        });
      }

      vendorGroups[vendorId].items.push({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        currency: item.currency,
        image: item.product.images[0]?.url || null,
      });

      vendorGroups[vendorId].subtotal += item.price * item.quantity;
    }

    // Create separate order for each vendor
    const createdOrders = [];

    for (const [vendorId, orderData] of Object.entries(vendorGroups)) {
      // Get vendor commission rate
      const vendor = await Vendor.findById(vendorId);
      const commissionRate = vendor?.commissionRate || 15;

      // Calculate totals (you can add shipping/tax logic here)
      const shippingFee = 0; // TODO: Calculate based on location/weight
      const tax = 0; // TODO: Calculate based on country tax rules
      const total = orderData.subtotal + shippingFee + tax;

      const order = await Order.create({
        customer: req.user._id,
        vendor: vendorId,
        items: orderData.items,
        subtotal: orderData.subtotal,
        currency: orderData.currency,
        shippingFee,
        tax,
        total,
        commissionRate,
        shippingAddress,
        paymentMethod,
        customerNotes,
        orderStatus: 'PENDING',
        paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
      });

      // Reduce product stock
      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        });
      }

      // Update vendor stats
      await Vendor.findByIdAndUpdate(vendorId, {
        $inc: {
          totalSales: total,
          totalOrders: 1,
          totalEarnings: (total * (100 - commissionRate)) / 100,
        },
      });

      createdOrders.push(order);
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} order(s) created successfully`,
      orders: createdOrders,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
export const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customer: req.user._id };
    if (status) query.orderStatus = status.toUpperCase();

    const orders = await Order.find(query)
      .populate('vendor', 'shopName businessEmail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};

// @desc    Get vendor's orders
// @route   GET /api/orders/vendor/orders
// @access  Private (Vendor)
export const getVendorOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Get vendor profile
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    const query = { vendor: vendor._id };
    if (status) query.orderStatus = status.toUpperCase();

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email mobile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor orders',
    });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email mobile')
      .populate('vendor', 'shopName businessEmail businessPhone')
      .populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization (customer owns order OR vendor owns order OR superadmin)
    const isCustomer = order.customer._id.toString() === req.user._id;
    const vendor = await Vendor.findOne({ user: req.user._id });
    const isVendor = vendor && order.vendor._id.toString() === vendor._id.toString();
    const isSuperAdmin = req.user.role === 'SUPERADMIN';

    if (!isCustomer && !isVendor && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
  }
};

// @desc    Update order status (Vendor only)
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, vendorNotes } = req.body;

    const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify vendor owns this order
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || order.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    // Update status
    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (vendorNotes) order.vendorNotes = vendorNotes;

    // Set timestamps
    if (status === 'SHIPPED' && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (status === 'DELIVERED' && !order.deliveredAt) {
      order.deliveredAt = new Date();
      order.paymentStatus = 'PAID'; // Auto-mark as paid on delivery (for COD)
      order.paidAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer or Vendor)
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Can only cancel if PENDING or CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in this status',
      });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id;
    const vendor = await Vendor.findOne({ user: req.user._id });
    const isVendor = vendor && order.vendor.toString() === vendor._id.toString();

    if (!isCustomer && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, salesCount: -item.quantity },
      });
    }

    // Update vendor stats
    await Vendor.findByIdAndUpdate(order.vendor, {
      $inc: {
        totalSales: -order.total,
        totalOrders: -1,
        totalEarnings: -(order.total * (100 - order.commissionRate)) / 100,
      },
    });

    order.orderStatus = 'CANCELLED';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by user';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
    });
  }
};

// @desc    Get all orders (SuperAdmin only)
// @route   GET /api/orders/all
// @access  Private (SuperAdmin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.orderStatus = status.toUpperCase();

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('vendor', 'shopName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};
