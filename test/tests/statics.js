const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeAcls = require('../../lib');

describe('permission#statics', function () {

  var ASSETS;
  var ResourceModel;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        const resourceSchema = new mongoose.Schema({
          name: {
            type: String,
            required: true
          }
        });

        makeAcls(resourceSchema, {
          permissionScopes: ['manage', 'read', 'update', 'delete']
        });

        ResourceModel = ASSETS.mongooseConnection.model('Resource', resourceSchema);

        ASSETS.ResourceModel = ResourceModel;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('scopeQueryByPermissions(query, identity, scopes)', function () {

    it('should modify the original query to be scoped by identity and the given scopes', function () {

      var query = {
        categories: ['cat1', 'cat2']
      };

      var id = 'identity-1';

      ResourceModel.scopeQueryByPermissions(query, id, [
        'read',
        'manage'
      ]);

      // other properties of the query should remain unmodified
      query.categories.length.should.equal(2);

      query['acls.read'].should.equal(id);
      query['acls.manage'].should.equal(id);

      Object.keys(query).length.should.equal(3);
    });

    it('should require the first argument to be the query object', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByPermissions(undefined, '1', ['read']);
      }, TypeError);
    });

    it('should require the second argument to be a string', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByPermissions({}, undefined, ['read']);
      }, TypeError);
    });

    it('should require the third argument to be an array', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByPermissions({}, '1', 'read');
      }, TypeError);
    });

    it('should require the scopes array NOT to be empty', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByPermissions({}, '1', []);
      }, TypeError);
    });

    it('should require all the scopes defined in the scopes array to be valid', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByPermissions({}, '1', ['invalid-permission-scope']);
      });
    });

  });
});