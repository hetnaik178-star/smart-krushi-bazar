const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's shopping cart
// @route   GET /api/cart
// @access  Private (Buyer)
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'name price quantity image category location farmerId'
    });

    if (!cart) {
      cart = { userId: req.user._id, items: [] };
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart', error: error.message });
  }
};

// @desc    Add item to shopping cart
// @route   POST /api/cart
// @access  Private (Buyer)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.quantity} units available in stock` });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId,
        quantity: Number(quantity),
        price: product.price
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price quantity image category location farmerId'
    });

    res.json({ success: true, message: 'Item added to cart', data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add item to cart', error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private (Buyer)
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price quantity image category location farmerId'
    });

    res.json({ success: true, message: 'Cart updated', data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart', error: error.message });
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Buyer)
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price quantity image category location farmerId'
    });

    res.json({ success: true, message: 'Item removed from cart', data: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove cart item', error: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Buyer)
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared', data: { userId: req.user._id, items: [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
