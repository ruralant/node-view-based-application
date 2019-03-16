const express = require('express');
const adminController = require('../controllers/admin');
const authenticate = require('../middleware/is-auth');
const { body } = require('express-validator/check');
const router = express.Router();

router.get('/add-product', authenticate, adminController.getAddProduct);

router.get('/products', authenticate, adminController.getProducts);

router.post('/add-product', [
  body('title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('price')
    .isFloat(),
  body('description')
    .isLength({ min: 8, max: 255 })
    .trim()
], authenticate, adminController.postAddProduct);

router.get('/edit-product/:productId', authenticate, adminController.getEditProduct);

router.post('/edit-product', [
  body('title')
    .isLength({ min: 3 })
    .trim(),
  body('price')
    .isFloat(),
  body('description')
    .isLength({ min: 8, max: 255 })
    .trim()
], authenticate, adminController.postEditProduct);

router.delete('/product/:productId', authenticate, adminController.deleteProduct);

module.exports = router;