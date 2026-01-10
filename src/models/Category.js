import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    parent: {
      type: String,
      ref: 'Category',
      default: null, // null for top-level categories
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// Index for faster queries (slug and unique fields create indexes automatically)
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
