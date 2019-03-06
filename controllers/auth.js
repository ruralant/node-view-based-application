const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const {
  validationResult
} = require('express-validator/check');

const transporter = nodemailer.createTransport(sendGridTransport({
  auth: {
    api_key: process.env.SENDGRID_KEY
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      passwordConfirmation: ''
    },
    validationErrors: []
  });
};

exports.postLogin = async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password
      },
      validationErrors: errors.array()
    })
  }

  try {
    const user = await User.findOne({
      email
    });
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid credentials',
        oldInput: {
          email,
          password
        },
        validationErrors: []
      })
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(e => {
        res.redirect('/');
      })
    } else {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid credentials',
        oldInput: {
          email,
          password
        },
        validationErrors: []
      })
    }
  } catch (e) {
    console.log(e)
    res.redirect('/login');
  }
};

exports.postSignup = async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        passwordConfirmation: req.body.passwordConfirmation
      },
      validationErrors: errors.array()
    });
  }

  try {
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
    transporter.sendMail({
      to: email,
      from: process.env.EMAIL_SENDER,
      subject: 'New user created',
      html: '<h1>Welcome to the Node Playground!</h1><br><p>Enjoy the ride</p>'
    });
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

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  const {
    email
  } = req.body;
  crypto.randomBytes(32, async (e, buffer) => {
    try {
      if (e) return res.redirect('/reset')

      const token = buffer.toString('hex');
      const user = await User.findOne({
        email
      });
      if (!user) {
        req.flash('error', 'No user found with the provided email');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExp = Date.now() + 3600000;
      await user.save();
      res.redirect('/');
      transporter.sendMail({
        to: email,
        from: process.env.EMAIL_SENDER,
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click <a href="${process.env.HOSTNAME}/reset/${token}">HERE</a> to reset the password.</p>
          <p>This link will expire in 1 hour.</p>
        `
      });
    } catch (e) {
      console.log(e);
    }
  });
}

exports.getNewPassword = async (req, res, next) => {
  const {
    token
  } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: {
        $gt: Date.now()
      }
    });
    if (!user) {
      req.flash('error', 'The reset password token is invalid');
      return res.redirect('/reset');
    }
    let message = req.flash('error');
    message.length > 0 ? message = message[0] : message = null;
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'Update Password',
      errorMessage: message,
      userId: user._id.toString(),
      token
    });
  } catch (e) {
    console.log(e);
  }
}

exports.postNewPassword = async (req, res, next) => {
  const {
    userId,
    password,
    token
  } = req.body;
  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExp: {
        $gt: Date.now()
      }
    });
    if (!user) {
      req.flash('error', 'The reset password token is invalid');
      return res.redirect('/');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    return res.redirect('/login');
  } catch (e) {
    console.log(e);
  }
}