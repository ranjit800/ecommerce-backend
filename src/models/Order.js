import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      ref: 'Product',
      required: true,
    },
    name: String, // Store product name in case product deleted
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ['INR', 'USD'],
    },
    image: String, // Primary product image
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: String,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: String,
      ref: 'Vendor',
      required: true,
    },
    items: [orderItemSchema],
    // Pricing
    subtotal: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ['INR', 'USD'],
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    // Platform Commission
    commissionRate: {
      type: Number,
      required: true,
      default: 15,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    vendorEarnings: {
      type: Number,
      required: true,
    },
    // Shipping Address
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Payment
    paymentMethod: {
      type: String,
      enum: ['CASH_ON_DELIVERY', 'RAZORPAY', 'STRIPE', 'UPI'],
      default: 'CASH_ON_DELIVERY',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentId: String, // From payment gateway
    paidAt: Date,
    // Order Status
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    // Tracking
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    // Notes
    customerNotes: String,
    vendorNotes: String,
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Generate order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    // Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20241201-12345)
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }

  // Calculate commission and vendor earnings
  if (this.isModified('total') || this.isModified('commissionRate')) {
    this.commissionAmount = (this.total * this.commissionRate) / 100;
    this.vendorEarnings = this.total - this.commissionAmount;
  }

  next();
});

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Compound indexes
orderSchema.index({ vendor: 1, orderStatus: 1 });
orderSchema.index({ customer: 1, orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
