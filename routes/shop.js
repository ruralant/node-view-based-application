const path = require('path');
const express = require('express');
const shopController = require('../controllers/shop');
const authenticate = require('../middleware/is-auth');
const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', authenticate, shopController.getCart);

router.post('/cart', authenticate, shopController.postCart);

router.post('/cart-delete-item', authenticate, shopController.postCartDeleteProduct);

router.post('/create-order', authenticate, shopController.postOrder);

router.get('/orders', authenticate, shopController.getOrders);

module.exports = router;