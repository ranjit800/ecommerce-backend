import dotenv from 'dotenv';
import connectDatabase from '../config/database.js';
import Product from '../models/Product.js';

dotenv.config();

const checkProducts = async () => {
  try {
    await connectDatabase();
    
    const count = await Product.countDocuments();
    console.log(`✅ Total Products Found: ${count}`);

    if (count > 0) {
        const products = await Product.find().limit(3).select('name price slug images');
        console.log('Sample Products:', JSON.stringify(products, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking products:', error);
    process.exit(1);
  }
};

checkProducts();
