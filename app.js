const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequalize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(e => console.log(e));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

// creates the appropriate tables if they do not exist
sequalize.sync() // force: to be removed in production
  .then(() => User.findByPk(1))
  .then(user => {
    if (!user) User.create({ name: 'Admin', email: 'admin@admin.com' });
    return Promise.resolve(user);
  })
  .then(user => {
    // console.log(user);
    app.listen(3000);
  })
  .catch(e => console.log(e));
