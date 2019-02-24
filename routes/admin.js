const path = require('path');
const express = require('express');
const adminController = require('../controllers/admin');
const authenticate = require('../middleware/is-auth');
const router = express.Router();

router.get('/add-product', authenticate, adminController.getAddProduct);

router.get('/products', authenticate, adminController.getProducts);

router.post('/add-product', authenticate, adminController.postAddProduct);

router.get('/edit-product/:productId', authenticate, adminController.getEditProduct);

router.post('/edit-product', authenticate, adminController.postEditProduct);

router.post('/delete-product', authenticate, adminController.postDeleteProduct);

module.exports = router;