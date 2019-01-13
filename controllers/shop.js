const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products'
      });
    })
    .catch(e => console.log(e));
};

exports.getProduct = (req, res, next) => {
  const { id } = req.params;
  // Product.findAll({where: { id }})
  Product.findByPk(id)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(e => console.log(e));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
};

exports.postCart = (req, res, next) => {
  const { id } = req.body;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id } });
    })
    .then(products => {
      let product;
      if (products.length > 0) product = products[0];
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(id);
    })
    .then(product => {
      return fetchedCart.addProduct(product, { 
        through: { quantity: newQuantity } 
      });
    })
    .then(() => res.redirect('/cart'))
    .catch(e => console.log(e));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { id } = req.body;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id } });
    })
    .then(products => {
      const product = products[0];
      product.cartItem.destroy();
    })
    .then(() => res.redirect('/cart'))
    .catch(e => console.log(e));
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
