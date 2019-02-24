const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;
  console.log(message);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  try {
    const user = await User.findOne({
      email
    });
    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(e => {
        res.redirect('/');
      })
    } else {
      req.flash('error', 'Invalid credentials');
      res.redirect('/login');
    }
  } catch (e) {
    console.log(e)
    res.redirect('/login');
  }
};

exports.postSignup = async (req, res, next) => {
  const {
    email,
    password,
    passwordConfirmation
  } = req.body;

  try {
    const user = await User.findOne({
      email
    });
    if (user) {
      req.flash('error', 'Email already in use. Please use a different one');
      return res.redirect('/signup');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
      cart: {
        Items: []
      }
    });
    await newUser.save();
    res.redirect('/login');
  } catch (e) {
    console.log(e);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};