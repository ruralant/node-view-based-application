const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  Product.create({ title, price, imageUrl, description })
    .then(() => console.log('Product successfully created'))
    .catch(e => console.log(e));
};

exports.getEditProduct = (req, res, next) => {
  const { edit } = req.query;
  if (!edit) return res.redirect('/');
  const { id } = req.params;
  Product.findById(id, product => {
    if (!product) return res.redirect('/');
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: edit,
      product: product
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { id, title, price, imageUrl, description } = req.body;
  const updatedProduct = new Product(id, title, imageUrl, description, price);
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(e => console.log(e));
};

exports.postDeleteProduct = (req, res, next) => {
  const { id } = req.body;
  Product.deleteById(id);
  res.redirect('/admin/products');
};
