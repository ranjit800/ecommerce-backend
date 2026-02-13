import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import Shop from '../models/Shop.js';

dotenv.config();

const checkShop = async () => {
  try {
    await connectDatabase();
    const slug = 'techstore-pro';
    const shop = await Shop.findOne({ slug });
    
    if (!shop) {
        console.log(`❌ Shop with slug "${slug}" not found.`);
    } else {
        console.log(`✅ Shop found: ${slug}`);
        console.log('Display Name:', shop.displayName);
        console.log('Is Published:', shop.isPublished);
        console.log('Owner:', shop.vendor);
        console.log('Theme Colors:', shop.storeDesign?.colors);
        console.log('Advanced Sections:', JSON.stringify(shop.advancedSections, null, 2));
    }
    process.exit(0);
  } catch (error) {
    console.error('Error checking shop:', error);
    process.exit(1);
  }
};

checkShop();
