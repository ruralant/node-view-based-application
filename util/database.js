const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node-playground',
  password: 'iTkbaaxcL,V?Bx7Fkn9J',
});

module.exports = pool.promise();