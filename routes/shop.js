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

router.get('/checkout', authenticate, shopController.getCheckout);

router.get('/orders', authenticate, shopController.getOrders);

router.get('/orders/:orderId', authenticate, shopController.getInvoice);

module.exports = router;