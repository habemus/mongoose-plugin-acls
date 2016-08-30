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

  it('should throw error upon schema property conflict', function () {
    assert.throws(function () {
      var schema = new mongoose.Schema({
        // acls is the default property
        acls: String,
      });

      makeAcls(schema, { permissionScopes: ['perm1', 'perm2'] });
    });

    assert.throws(function () {
      var schema = new mongoose.Schema({
        prefixedAcls: String,
      });

      makeAcls(schema, {
        prefix: 'prefixed',
        permissionScopes: ['perm1', 'perm2']
      });
    });

  });

  it('should throw error upon method name conflict', function () {
    assert.throws(function () {
      var schema = new mongoose.Schema();

      schema.methods.verifyPermissions = function () {};

      makeAcls(schema, {
        permissionScopes: ['perm1', 'perm2']
      });
    });

    assert.throws(function () {
      var schema = new mongoose.Schema();

      schema.methods.grant = function () {};

      makeAcls(schema, {
        permissionScopes: ['perm1', 'perm2']
      });
    });

    assert.throws(function () {
      var schema = new mongoose.Schema();

      schema.methods.deny = function () {};

      makeAcls(schema, {
        permissionScopes: ['perm1', 'perm2']
      });
    });

  });

  it('should throw error upon static method name conflict', function () {
    assert.throws(function () {
      var schema = new mongoose.Schema();

      schema.statics.scopeQueryByPermissions = function () {};

      makeAcls(schema, {
        permissionScopes: ['perm1', 'perm2']
      });
    });
  });
});