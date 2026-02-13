import Shop from '../models/Shop.js';
import Product from '../models/Product.js';

export const getShopBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const shop = await Shop.findOne({ slug, isPublished: true });
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Optionally fetch some products for the shop to display initially?
    // Or let the frontend fetch products separately.
    // For now, just return the shop profile.

    res.status(200).json({ shop });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
