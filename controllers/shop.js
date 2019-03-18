const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require("stripe")(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;

  try {
    totalProducts = await Product.find().countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;

  try {
    totalProducts = await Product.find().countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = await user.cart.items;
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products,
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const product = await Product.findById(prodId);
    await req.user.addToCart(product);
    res.redirect('/cart');
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await req.user.removeFromCart(prodId);
    res.redirect('/cart');
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = await user.cart.items;
    let total = 0;
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    });
    res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products: products,
      totalAmount: total
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.postOrder = async (req, res, next) => {
  try {
    const { stripeToken } = req.body;
    let totalAmount = 0;

    const user = await req.user.populate('cart.items.productId').execPopulate();

    user.cart.items.forEach(p => {
      totalAmount += p.quantity * p.productId.price;
    });

    const products = user.cart.items.map(i => {
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc }
      };
    });
    let order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    });
    order = await order.save();

    await stripe.charges.create({
      amount: totalAmount * 100,
      currency: 'gbp',
      description: 'Demo Order',
      source: stripeToken,
      metadata: { order_id: order._id.toString() }
    });

    await req.user.clearCart();
    res.redirect('/orders');
  } catch (e) {
    console.log(e);
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      'user.userId': req.user._id
    });
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  const user = req.user._id;
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join('data', 'invoices', invoiceName);
  const pdfDoc = new PDFDocument();

  try {
    const order = await Order.findById(orderId);
    if (!order) next(new Error('Oder not found'));

    if (order.user.userId.toString() !== user.toString())
      return next(new Error('Unouthorised'));
      
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; fileName="${invoiceName}"`);

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', { underline: true });
    pdfDoc.text('--------------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(`${prod.product.title} - x ${prod.quantity} - £${prod.product.price}`);
    });
    pdfDoc.text('--------------');
    pdfDoc.fontSize(18).text(`Total Price: £${totalPrice}`);

    pdfDoc.end();
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};