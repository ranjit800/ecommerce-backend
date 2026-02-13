import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import Shop from '../models/Shop.js';

dotenv.config();

const updateShop = async () => {
  try {
    await connectDatabase();
    const slug = 'techstore-pro';
    
    const result = await Shop.updateOne(
      { slug },
      { 
        $set: { 
          isPublished: true,
          displayName: 'TechStore Pro'
        }
      }
    );
    
    if (result.matchedCount === 0) {
        console.log(`❌ Shop with slug "${slug}" not found.`);
    } else {
        console.log(`✅ Shop updated successfully.`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error updating shop:', error);
    process.exit(1);
  }
};

updateShop();
