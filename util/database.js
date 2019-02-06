const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;


const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://tonio:s2NCxxk4bwpgCOzt@playground-hox8j.gcp.mongodb.net/test?retryWrites=true')
    .then(client => {
      console.log('Connected');
      callback(client);
    })
    .catch(e => console.log(e));
};

module.exports = mongoConnect;

