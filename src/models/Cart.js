import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
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
    vendor: {
      type: String,
      ref: 'Vendor',
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    user: {
      type: String,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    // Group subtotals by currency (since vendors can be in different countries)
    subtotals: {
      INR: {
        type: Number,
        default: 0,
      },
      USD: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  // Calculate total items
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotals by currency
  this.subtotals = {
    INR: 0,
    USD: 0,
  };

  this.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    if (item.currency === 'INR') {
      this.subtotals.INR += itemTotal;
    } else if (item.currency === 'USD') {
      this.subtotals.USD += itemTotal;
    }
  });

  next();
});

// Index for faster queries
cartSchema.index({ user: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
