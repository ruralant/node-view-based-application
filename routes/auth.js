const express = require('express');
const authController = require('../controllers/auth');
const User = require('../models/user');
const {
  check,
  body
} = require('express-validator/check');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.'),
    body('password', 'Password has to be valid.')
    .isLength({
      min: 5
    })
    .isAlphanumeric()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom(async (value, {
      req
    }) => {
      const user = await User.findOne({
        email: value
      });
      if (user) {
        throw new Error('Email already in use. Please use a different one')
      }
    }),
    body('password', 'The password should be alphanumeric and at least 5 characters long')
    .isLength({
      min: 5
    })
    .isAlphanumeric(),
    body('passwordConfirmation').custom((value, {
      req
    }) => {
      if (value !== req.body.password) {
        throw new Error('The passwords have to match');
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;