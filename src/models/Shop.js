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
    // Store Builder & Design Configuration
    storeDesign: {
      colors: {
        primary: { type: String, default: '#3B82F6' },
        secondary: { type: String, default: '#8B5CF6' },
        background: { type: String, default: '#FFFFFF' },
        text: { type: String, default: '#1F2937' },
      },
      fonts: {
        heading: { type: String, default: 'Inter' },
        body: { type: String, default: 'Inter' },
      },
      logo: { type: String },
      banner: { type: String },
      tagline: { type: String },
    },

    // Fixed Components Configuration
    components: {
      header: {
        showLogo: { type: Boolean, default: true },
        showSearch: { type: Boolean, default: true },
        showCart: { type: Boolean, default: true },
      },
      hero: {
        enabled: { type: Boolean, default: false },
        image: String,
        title: String,
        subtitle: String,
        ctaText: String,
        ctaLink: String,
      },
      about: {
        enabled: { type: Boolean, default: false },
        story: String,
        image: String,
      },
      testimonials: {
        enabled: { type: Boolean, default: false },
        reviews: [
          {
            name: String,
            comment: String,
            rating: { type: Number, min: 1, max: 5 },
          },
        ],
      },
    },

    // Advanced Dynamic Sections (Swipers, Grids, etc.)
    advancedSections: [
      {
        id: {
          type: String,
          default: () => uuidv4(),
        },
        type: {
          type: String,
          enum: [
            'banner-swiper',
            'product-swiper', // Formerly deals-swiper
            'product-grid',   // Formerly deals-grid
            'featured-products',
            'main-products',
            'hero-banner'
          ],
          required: true,
        },
        title: {
          type: String, // Dynamic title: "Deals For You", "Hot Deal", etc.
        },
        position: {
          type: Number,
          default: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
        // Banner Swiper Data
        banners: [
          {
            image: String,
            link: String,
            altText: String,
          },
        ],
        autoPlaySpeed: {
          type: Number,
          default: 3000,
        },
        // Product Section Data
        productLayout: {
          type: {
            type: String,
            enum: ['swiper', 'grid'],
            default: 'swiper',
          },
          columns: {
            type: Number,
            default: 2, // 2x2, 3x3, etc.
          },
          rows: {
            type: Number,
            default: 1,
          },
          showCount: {
            type: Number,
            default: 4,
          },
        },
        productFilter: {
          category: String,
          onSale: Boolean,
          featured: Boolean,
          newArrivals: Boolean,
        },
        // CTA
        showSeeAll: {
          type: Boolean,
          default: true,
        },
        seeAllText: {
          type: String,
          default: 'See All',
        },
        seeAllLink: String,
      },
    ],

    // Product Listing Page Filters
    productFilters: {
      showPriceFilter: { type: Boolean, default: true },
      showCategoryFilter: { type: Boolean, default: true },
      showColorFilter: { type: Boolean, default: false },
      showSizeFilter: { type: Boolean, default: false },
      showStockFilter: { type: Boolean, default: true },
      showSaleFilter: { type: Boolean, default: true },
      defaultSort: { type: String, default: '-createdAt' },
      defaultView: { type: String, enum: ['grid', 'list'], default: 'grid' },
      gridColumns: { type: Number, default: 3 },
      productsPerPage: { type: Number, default: 12 },
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
    isPublished: {
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
