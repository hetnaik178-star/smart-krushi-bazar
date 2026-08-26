const Order = require('../models/Order');
const Product = require('../models/Product');
const { createNotification } = require('../utils/notificationService');

// @desc    Initiate order (creates pending order before payment)
// @route   POST /api/orders/initiate
// @access  Private (Buyer)
const initiateOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const buyerId = req.user._id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Create pending order (stock NOT reduced yet — only after payment verification or COD confirmation)
    const order = await Order.create({
      productId: product._id,
      productName: product.name,
      buyerId,
      farmerId: product.farmerId,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      status: 'Pending',
      paymentMethod: 'Pending',
      paymentStatus: 'Pending',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('initiateOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate order' });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      paymentMethod = 'COD',
      paymentStatus = 'Pending',
      razorpayOrderId = null,
      razorpayPaymentId = null
    } = req.body;

    const product = await Product.findById(productId);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.quantity < quantity) return res.status(400).json({ message: 'Insufficient quantity available' });
    if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero' });

    product.quantity -= quantity;
    await product.save();

    const order = await Order.create({
      productId: product._id,
      productName: product.name,
      buyerId: req.user._id,
      farmerId: product.farmerId,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      status: paymentStatus === 'Paid' ? 'Accepted' : 'Pending',
      paymentMethod,
      paymentStatus,
      paymentProvider: paymentMethod === 'Razorpay' ? 'Razorpay' : null,
      razorpayOrderId,
      razorpayPaymentId,
      verifiedAt: paymentStatus === 'Paid' ? new Date() : null
    });

    // Notification Trigger: Inform the Farmer
    await createNotification(
      product.farmerId,
      'New Order Received',
      `You received a new order for ${quantity} unit(s) of ${product.name}! Payment: ${paymentMethod} (${paymentStatus})`,
      'Order',
      '/farmer/orders'
    );

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).populate('productId', 'name image').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

const getReceivedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.user._id }).populate('buyerId', 'name phone location').populate('productId', 'name image').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch received orders', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('buyerId', 'name');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Notification to Buyer
    if (oldStatus !== status) {
      let msg = '';
      if (status === 'Accepted') msg = `Your order for ${order.productName} has been accepted!`;
      if (status === 'Completed') msg = `Your order for ${order.productName} is completed.`;
      if (status === 'Cancelled') msg = `Your order for ${order.productName} was cancelled.`;
      
      if (msg) {
        await createNotification(order.buyerId._id, 'Order Update', msg, 'Order', '/buyer/orders');
      }
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus,
  initiateOrder
};
