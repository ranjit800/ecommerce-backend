import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const vendorSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    user: {
      type: String,
      ref: 'User',
      required: true,
      unique: true, // One vendor profile per user
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      unique: true,
    },
    shopDescription: {
      type: String,
      required: [true, 'Shop description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    shopLogo: {
      type: String, // Cloudinary URL
      default: null,
    },
    shopBanner: {
      type: String, // Cloudinary URL
      default: null,
    },
    businessEmail: {
      type: String,
      required: [true, 'Business email is required'],
      trim: true,
    },
    businessPhone: {
      type: String,
      required: [true, 'Business phone is required'],
      trim: true,
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        required: true,
        enum: ['India', 'USA'],
        default: 'India',
      },
    },
    // Multi-Country Support
    currency: {
      type: String,
      required: true,
      enum: ['INR', 'USD'],
      default: 'INR',
    },
    // Tax Information (Country-specific)
    gstNumber: {
      type: String,
      trim: true,
      // For India - GST format validation can be added
    },
    taxId: {
      type: String,
      trim: true,
      // For USA - EIN or Tax ID
    },
    // Bank Details (Country-specific)
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      branchName: String,
      // India-specific
      ifscCode: String,
      // USA-specific
      routingNumber: String,
      swiftCode: String, // For international transfers
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    commissionRate: {
      type: Number,
      default: 15, // Platform commission percentage (default from env)
      min: 0,
      max: 100,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    approvedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Index for faster queries (unique fields already have indexes)
vendorSchema.index({ approvalStatus: 1 });

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
