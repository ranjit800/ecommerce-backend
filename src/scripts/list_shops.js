import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import Shop from '../models/Shop.js';

dotenv.config();

const listShops = async () => {
  try {
    await connectDatabase();
    const shops = await Shop.find({}, 'displayName slug storeDesign.colors');
    
    if (shops.length === 0) {
        console.log('\nNo shops found in the database.');
    } else {
        console.log('\n--- AVAILABLE SHOPS ---');
        shops.forEach(shop => {
            console.log(`- ${shop.displayName} (slug: ${shop.slug})`);
            console.log(`  Colors: Primary=${shop.storeDesign?.colors?.primary}, BG=${shop.storeDesign?.colors?.background}`);
            console.log(`  URL: http://localhost:3000/app/${shop.slug}`);
            console.log('-----------------------');
        });
        console.log('\n');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error listing shops:', error);
    process.exit(1);
  }
};

listShops();
