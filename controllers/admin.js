const { validationResult } = require('express-validator/check');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title,
        imageUrl,
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user
  });

  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (e) {
    console.log(e);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) return res.redirect('/');

  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);

    if (!product) return res.redirect('/');

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  } catch (e) {
    console.log(e);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const userId = req.user._id;
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  try {
    const product = await Product.findById(prodId);

    if (!product || product.userId.toString() !== userId.toString()) 
      return res.redirect('/');

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;
    await product.save();
    res.redirect('/admin/products');
  } catch (e) {
    console.log(e);
  }
};

exports.getProducts = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const products = await Product.find({ userId });
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  } catch (e) {
    console.log(e);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const userId = req.user._id;
  const prodId = req.body.productId;
  try {
    await Product.deleteOne({
      _id: prodId,
      userId
    });
    res.redirect('/admin/products');
  } catch (e) {
    console.log(e);
  }
};