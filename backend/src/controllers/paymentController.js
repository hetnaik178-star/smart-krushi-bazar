const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

const hasValidKeys = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  return (
    keyId.startsWith('rzp_') &&
    !keyId.includes('placeholder') &&
    !keyId.includes('simulator') &&
    keySecret.length > 5 &&
    !keySecret.includes('placeholder')
  );
};

const getRazorpayInstance = () => {
  if (hasValidKeys()) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
};

// ---------- CREATE ORDER (handles cart, product, consultation, COD & Razorpay) ----------
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, orderIds = [], consultationId, paymentMethod = 'Razorpay' } = req.body;

    // ============ COD PATH ============
    if (paymentMethod === 'COD') {
      if (type === 'cart') {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
          return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        const createdOrders = [];
        for (const item of cart.items) {
          const product = item.productId;
          if (!product || product.quantity < item.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${product?.name || 'product'}` });
          }
          const order = await Order.create({
            productId: product._id,
            productName: product.name,
            buyerId: userId,
            farmerId: product.farmerId,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity,
            status: 'Pending',
            paymentMethod: 'COD',
            paymentProvider: null,
            paymentStatus: 'Pending',
          });
          createdOrders.push(order);
          await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -item.quantity } });
        }
        await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

        // Create Payment record for tracking
        await Payment.create({
          userId,
          type: 'cart',
          paymentMethod: 'COD',
          paymentProvider: null,
          amount: createdOrders.reduce((s, o) => s + o.totalPrice, 0),
          status: 'Pending',
          orderIds: createdOrders.map(o => o._id),
        });

        return res.json({ success: true, message: 'COD orders placed successfully', data: { orders: createdOrders } });
      }

      if (type === 'product') {
        // Buy Now COD - order was already initiated or passed
        if (!orderIds.length) return res.status(400).json({ success: false, message: 'Missing order ID' });
        const order = await Order.findOne({ _id: orderIds[0], buyerId: userId });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.paymentMethod = 'COD';
        order.paymentProvider = null;
        order.paymentStatus = 'Pending';
        order.status = 'Pending';
        await order.save();

        // Reduce stock
        await Product.findByIdAndUpdate(order.productId, { $inc: { quantity: -order.quantity } });

        await Payment.create({
          userId,
          type: 'product',
          paymentMethod: 'COD',
          paymentProvider: null,
          amount: order.totalPrice,
          status: 'Pending',
          orderIds: [order._id],
        });

        return res.json({ success: true, message: 'COD order placed successfully', data: { order } });
      }

      if (type === 'consultation') {
        const consultation = await Consultation.findOne({ _id: consultationId, farmerId: userId });
        if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
        consultation.paymentMethod = 'COD';
        consultation.paymentStatus = 'Pending';
        consultation.status = 'Confirmed';
        await consultation.save();
        return res.json({ success: true, message: 'Consultation booked with COD', data: { consultation } });
      }

      return res.status(400).json({ success: false, message: 'Invalid COD type' });
    }

    // ============ RAZORPAY PATH ============
    let amount = 0;

    if (type === 'cart') {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart empty' });
      for (const item of cart.items) {
        const product = item.productId;
        if (!product || product.quantity < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock: ${product?.name}` });
        }
        amount += product.price * item.quantity;
      }
    } else if (type === 'product') {
      if (!orderIds.length) return res.status(400).json({ success: false, message: 'Missing order ID' });
      const order = await Order.findOne({ _id: orderIds[0], buyerId: userId });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (order.paymentStatus === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });
      
      const product = await Product.findById(order.productId);
      if (!product || product.quantity < order.quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      amount = order.totalPrice;
    } else if (type === 'consultation') {
      const consultation = await Consultation.findOne({ _id: consultationId, farmerId: userId });
      if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
      const expert = await User.findById(consultation.expertId);
      amount = expert?.consultationFee || consultation.fee || 0;
      if (amount <= 0) return res.status(400).json({ success: false, message: 'Consultation fee not set' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const rzp = getRazorpayInstance();
    let rzpOrderId;
    let isMock = true;

    if (rzp) {
      try {
        const rzpOrder = await rzp.orders.create({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: `receipt_${Date.now()}_${userId.toString().slice(-6)}`,
          notes: { type, userId: userId.toString() },
        });
        rzpOrderId = rzpOrder.id;
        isMock = false;
      } catch (err) {
        console.warn('Razorpay API warning, using simulator fallback:', err.message);
        rzpOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        isMock = true;
      }
    } else {
      rzpOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      isMock = true;
    }

    const payment = await Payment.create({
      userId,
      type,
      amount,
      currency: 'INR',
      razorpayOrderId: rzpOrderId,
      status: 'Created',
      orderIds: type === 'product' || type === 'cart' ? orderIds : [],
      consultationId: type === 'consultation' ? consultationId : null,
      paymentMethod: 'Razorpay',
      paymentProvider: isMock ? 'Razorpay_Simulator' : 'Razorpay',
    });

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulator',
      razorpayOrderId: rzpOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      paymentId: payment._id,
      isMock,
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// ---------- VERIFY PAYMENT (handles HMAC & test simulation) ----------
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, isMock } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !paymentId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const payment = await Payment.findOne({ _id: paymentId, userId: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ success: false, message: 'Order mismatch' });
    if (payment.status === 'Paid') return res.json({ success: true, message: 'Already verified' });

    const rzp = getRazorpayInstance();
    const shouldVerifyReal = rzp && !isMock && !payment.razorpayOrderId.startsWith('order_sim_');

    if (shouldVerifyReal) {
      if (!razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing payment signature' });
      }
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
      if (expected !== razorpay_signature) {
        payment.status = 'Verification_Failed';
        payment.error = 'Invalid signature';
        await payment.save();
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }

      try {
        const rzpPayment = await rzp.payments.fetch(razorpay_payment_id);
        if (rzpPayment.status !== 'captured') {
          payment.status = 'Failed';
          payment.error = 'Payment not captured';
          await payment.save();
          return res.status(400).json({ success: false, message: 'Payment not captured' });
        }
      } catch (fetchErr) {
        console.error('Razorpay fetch error:', fetchErr);
      }
    }

    // Mark payment as Paid
    payment.status = 'Paid';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature || 'simulated_signature';
    payment.paidAt = new Date();
    payment.verifiedAt = new Date();
    await payment.save();

    // 1) BUY NOW FLOW (Product type)
    if (payment.type === 'product' && payment.orderIds.length) {
      await Order.updateMany(
        { _id: { $in: payment.orderIds }, buyerId: req.user._id },
        {
          $set: {
            paymentStatus: 'Paid',
            status: 'Accepted',
            paymentMethod: 'Razorpay',
            paymentProvider: shouldVerifyReal ? 'Razorpay' : 'Razorpay_Simulator',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: new Date()
          }
        }
      );
      // Reduce stock
      for (const oid of payment.orderIds) {
        const o = await Order.findById(oid);
        if (o) await Product.findByIdAndUpdate(o.productId, { $inc: { quantity: -o.quantity } });
      }
    }
    // 2) CART FLOW
    else if (payment.type === 'cart') {
      if (!payment.orderIds || payment.orderIds.length === 0) {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        if (cart) {
          const created = [];
          for (const item of cart.items) {
            const p = item.productId;
            if (!p) continue;
            const o = await Order.create({
              productId: p._id,
              productName: p.name,
              buyerId: req.user._id,
              farmerId: p.farmerId,
              quantity: item.quantity,
              unitPrice: p.price,
              totalPrice: p.price * item.quantity,
              status: 'Accepted',
              paymentMethod: 'Razorpay',
              paymentProvider: shouldVerifyReal ? 'Razorpay' : 'Razorpay_Simulator',
              paymentStatus: 'Paid',
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              verifiedAt: new Date(),
            });
            created.push(o._id);
            await Product.findByIdAndUpdate(p._id, { $inc: { quantity: -item.quantity } });
          }
          payment.orderIds = created;
          await payment.save();
          await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } });
        }
      } else {
        await Order.updateMany(
          { _id: { $in: payment.orderIds }, buyerId: req.user._id },
          {
            $set: {
              paymentStatus: 'Paid',
              status: 'Accepted',
              paymentMethod: 'Razorpay',
              paymentProvider: shouldVerifyReal ? 'Razorpay' : 'Razorpay_Simulator',
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              verifiedAt: new Date()
            }
          }
        );
        for (const oid of payment.orderIds) {
          const o = await Order.findById(oid);
          if (o) await Product.findByIdAndUpdate(o.productId, { $inc: { quantity: -o.quantity } });
        }
        await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } });
      }
    }
    // 3) CONSULTATION FLOW
    else if (payment.type === 'consultation') {
      await Consultation.findByIdAndUpdate(payment.consultationId, {
        paymentStatus: 'Paid',
        paymentMethod: 'Razorpay',
        status: 'Confirmed',
        paymentId: payment._id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    res.json({ success: true, message: 'Payment verified and order confirmed successfully' });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// ---------- FAILURE HANDLER + ADMIN LIST ----------
const handleFailure = async (req, res) => {
  try {
    const { paymentId, error } = req.body;
    await Payment.findOneAndUpdate(
      { _id: paymentId, userId: req.user._id, status: 'Created' },
      { $set: { status: 'Failed', error: error?.description || 'Payment Failed' } }
    );
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to record failure' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { method, status } = req.query;
    const filter = {};
    if (method && method !== 'All') filter.paymentMethod = method;
    if (status && status !== 'All') filter.status = status;
    const payments = await Payment.find(filter)
      .populate('userId', 'name email')
      .populate('orderIds')
      .populate('consultationId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments, count: payments.length });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
  }
};

module.exports = { createOrder, verifyPayment, handleFailure, getAllPayments };
