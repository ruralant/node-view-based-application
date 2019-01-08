const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-playground', 'root', 'iTkbaaxcL,V?Bx7Fkn9J', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;