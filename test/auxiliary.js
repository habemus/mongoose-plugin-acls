// third-party dependencies
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

// constant
const TEST_DB_URI = 'mongodb://localhost:27017/mongoose-make-acls-test-db';

// set mongoose to debug mode
if (process.env.DEBUG === 'TRUE') {
  mongoose.set('debug', true);
}

var TEARDOWN_CALLBACKS = [];

exports.TEST_DB_URI = TEST_DB_URI;

/**
 * Sets up an assets object that is ready for the tests
 * @return {[type]} [description]
 */
exports.setup = function () {

  var _assets = {
    dbURI: TEST_DB_URI,
  };

  return Promise.all([
      MongoClient.connect(TEST_DB_URI),
      mongoose.createConnection(TEST_DB_URI),
    ])
    .then((results) => {

      _assets.db = results[0];
      _assets.mongooseConnection = results[1];

      // register mongoose connection teardown
      exports.registerTeardown(function () {
        return _assets.mongooseConnection.close();
      });

      // register database teardown
      exports.registerTeardown(function () {
        return _assets.db.dropDatabase().then(() => {
          return _assets.db.close();
        });
      });

      return Promise.all([
        _assets.db.dropDatabase(),
      ]);
    })
    .then(() => {
      return _assets;
    });

};

/**
 * Register a teardown function to be executed by the teardown
 * The function should return a promise
 */
exports.registerTeardown = function (teardown) {
  TEARDOWN_CALLBACKS.push(teardown);
};

/**
 * Executes all functions listed at TEARDOWN_CALLBACKS
 */
exports.teardown = function () {
  return Promise.all(TEARDOWN_CALLBACKS.map((fn) => {
    return fn();
  }))
  .then(() => {
    TEARDOWN_CALLBACKS = [];
  });
};