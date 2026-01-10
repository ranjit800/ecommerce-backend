import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const shopSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    vendor: {
      type: String,
      ref: 'Vendor',
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Social Media Links
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      website: String,
    },
    // Shop Policies
    policies: {
      returnPolicy: {
        type: String,
        maxlength: 1000,
      },
      shippingPolicy: {
        type: String,
        maxlength: 1000,
      },
      privacyPolicy: {
        type: String,
        maxlength: 1000,
      },
    },
    // Operating Hours
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    // Shop Stats
    totalViews: {
      type: Number,
      default: 0,
    },
    totalFollowers: {
      type: Number,
      default: 0,
    },
    // Verification Badge
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Indexes automatically created by unique fields

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;
