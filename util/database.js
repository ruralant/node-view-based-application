const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect('')
    .then(client => {
      console.log('Connected');
      callback(client);
    })
    .catch(e => {
      throw e;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

module.exports = mongoConnect;
exports.getDb = getDb;
