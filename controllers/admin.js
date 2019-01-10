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
  req.user.createProduct({ title, price, imageUrl, description, userId: req.user.id })
    .then(() => {
      console.log('Product successfully created');
      res.redirect('/admin/products');
    })
    .catch(e => console.log(e));
};

exports.getEditProduct = (req, res, next) => {
  const { edit } = req.query;
  if (!edit) return res.redirect('/');
  const { id } = req.params;

  req.user.getProducts({ where: {id} })
    .then(products => {
      const product = products[0];
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
  Product.findByPk(id)
    .then(product => {
      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      return product.save();
    })
    .then(() => {
      console.log('Product updated successfully');
      res.redirect('/admin/products');
    })
    .catch(e => console.log(e));
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
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
  Product.findByPk(id)
    .then(product => {
      return product.destroy();
    })
    .then(() => {
      console.log('Product deleted successfully');
      res.redirect('/admin/products');
    })
    .catch(e => console.log(e));
};
