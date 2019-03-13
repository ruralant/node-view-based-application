const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
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
  try {
    const products = await Product.find();
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
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

exports.postOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items.map(i => {
      return {
        quantity: i.quantity,
        product: { ...i.productId._doc }
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    });
    await order.save();
    await req.user.clearCart();
    res.redirect('/orders');
  } catch (e) {
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