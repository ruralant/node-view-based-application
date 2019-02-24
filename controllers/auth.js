const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
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