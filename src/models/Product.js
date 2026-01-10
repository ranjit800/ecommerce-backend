import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    vendor: {
      type: String,
      ref: 'Vendor',
      required: [true, 'Vendor is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      ref: 'Category',
      default: null,
    },
    // Multi-Currency Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      enum: ['INR', 'USD'],
      default: 'INR',
    },
    comparePrice: {
      type: Number, // Original price for discount display
      min: [0, 'Compare price cannot be negative'],
      default: null,
    },
    costPrice: {
      type: Number, // Vendor's cost (for profit calculation)
      min: [0, 'Cost price cannot be negative'],
      default: null,
    },
    // Inventory Management
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    // Images
    images: [
      {
        url: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Product Specifications
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    // Product Variants (Color, Size, etc.)
    variants: [
      {
        name: String, // e.g., "Color", "Size"
        value: String, // e.g., "Red", "Large"
        price: Number, // Additional price for this variant
        stock: Number,
      },
    ],
    // SEO
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    tags: [String],
    // Status
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'],
      default: 'DRAFT',
    },
    // Stats
    viewsCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    // Shipping
    weight: {
      type: Number, // in kg
      default: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch'],
        default: 'cm',
      },
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    // Flags
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Indexes for performance
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });

// Compound indexes
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search

const Product = mongoose.model('Product', productSchema);

export default Product;
