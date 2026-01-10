import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug price currency stock images status',
      })
      .populate({
        path: 'items.vendor',
        select: 'shopName',
      });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Get product details
    const product = await Product.findById(productId).populate('vendor');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check product status
    if (product.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
        currency: product.currency,
        vendor: product.vendor._id,
      });
    }

    await cart.save();

    // Populate cart for response
    await cart.populate([
      {
        path: 'items.product',
        select: 'name slug price currency stock images',
      },
      {
        path: 'items.vendor',
        select: 'shopName',
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add item to cart',
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed

    await cart.save();

    await cart.populate([
      {
        path: 'items.product',
        select: 'name slug price currency stock images',
      },
      {
        path: 'items.vendor',
        select: 'shopName',
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Remove item
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate([
      {
        path: 'items.product',
        select: 'name slug price currency stock images',
      },
      {
        path: 'items.vendor',
        select: 'shopName',
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
};

// @desc    Get cart grouped by vendor (for checkout)
// @route   GET /api/cart/grouped
// @access  Private
export const getCartGroupedByVendor = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug price currency stock images',
      })
      .populate({
        path: 'items.vendor',
        select: 'shopName businessAddress currency commissionRate',
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Group items by vendor
    const vendorGroups = {};

    cart.items.forEach((item) => {
      const vendorId = item.vendor._id;

      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendor: item.vendor,
          items: [],
          subtotal: 0,
          currency: item.currency,
          itemCount: 0,
        };
      }

      vendorGroups[vendorId].items.push(item);
      vendorGroups[vendorId].subtotal += item.price * item.quantity;
      vendorGroups[vendorId].itemCount += item.quantity;
    });

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        totalItems: cart.totalItems,
        subtotals: cart.subtotals,
        vendorGroups: Object.values(vendorGroups),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grouped cart',
    });
  }
};
