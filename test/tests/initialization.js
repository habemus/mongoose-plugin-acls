const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeAcls = require('../../lib');

describe('makeAcls(schema, options)', function () {

  var ASSETS;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  it('should require the first argument to be instanceof mongoose.Schema', function () {

    var fakeSchema = {};

    assert.throws(function () {

      makeAcls(fakeSchema, {
        permissionScopes: ['enabled', 'disabled']
      });

    });
  });

  it('should require options.permissionScopes', function () {

    var schema = new mongoose.Schema({});

    assert.throws(function () {
      makeAcls(schema, undefined);
    });

    assert.throws(function () {
      makeAcls(schema, {
        permissionScopes: undefined
      });
    });
  });
});