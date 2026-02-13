import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import Shop from '../models/Shop.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const populateShop = async () => {
  try {
    await connectDatabase();
    const slug = 'techstore-pro';
    
    // Sample Banner Section
    const bannerSection = {
      id: uuidv4(),
      type: 'banner-swiper',
      enabled: true,
      position: 0,
      title: 'Featured Promotions',
      banners: [
        {
          id: uuidv4(),
          image: 'https://images.unsplash.com/photo-1531297461136-8208b5011558?auto=format&fit=crop&w=1200&q=80',
          link: '/products',
          title: 'Summer Tech Sale',
          altText: 'Summer Tech Sale Banner'
        },
        {
          id: uuidv4(),
          image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=1200&q=80',
          link: '/products/laptops',
          title: 'New MacBooks',
          altText: 'New MacBook Banner'
        }
      ]
    };

    // Sample Product Grid
    const productGridSection = {
      id: uuidv4(),
      type: 'product-grid',
      enabled: true,
      position: 1,
      title: 'Best Sellers',
      showSeeAll: true,
      seeAllText: 'View All',
      seeAllLink: '/products',
      
      // Corrected structure based on ProductSection.tsx expectations
      productLayout: {
          type: 'grid',
          columns: 4,
          showCount: 8
      },
      productFilter: {
          limit: 8,
          // category: 'electronics' // Optional
      }
    };

    const result = await Shop.updateOne(
      { slug },
      { 
        $set: { 
          advancedSections: [bannerSection, productGridSection]
        }
      }
    );
    
    if (result.matchedCount === 0) {
        console.log(`❌ Shop with slug "${slug}" not found.`);
    } else {
        console.log(`✅ Shop updated with corrected sections.`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating shop:', error);
    process.exit(1);
  }
};

populateShop();
