const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeAcls = require('../../lib');

describe('querying using #scopeQueryByPermissions', function () {

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

        var id1 = 'id1';
        var id2 = 'id2';

        // create some resources in the database
        var res1 = new ResourceModel({
          name: 'res1',
          status: {
            value: 'ready',
            reason: 'TEST',
          }
        });
        var res2 = new ResourceModel({
          name: 'res2',
          status: {
            value: 'ready',
            reason: 'TEST',
          }
        });
        var res3 = new ResourceModel({
          name: 'res3',
          status: {
            value: 'ready',
            reason: 'TEST',
          }
        });
        var res4 = new ResourceModel({
          name: 'res4',
          status: {
            value: 'ready',
            reason: 'TEST',
          }
        });

        res1.grant(id1, ['read']);
        res1.grant(id2, ['manage']);

        res2.grant(id1, ['manage', 'update']);
        // res2.grant(id2, []);

        res3.grant(id1, ['read']);
        res3.grant(id2, ['manage']);

        res4.grant(id1, ['read', 'delete']);
        res4.grant(id2, ['manage']);

        return Promise.all([
          res1.save(),
          res2.save(),
          res3.save(),
          res4.save()
        ]);
      })
      .then((resources) => {
        ASSETS.resources = resources;
      })
      .catch((err) => {
        console.log(err);

        throw err;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('find', function () {

    it('should return the results scoped by permissions', function () {

      var query = {};
      
      ResourceModel.scopeQueryByPermissions(query, 'id1', ['read']);

      return ResourceModel.find(query).then((results) => {
        results.length.should.equal(3);
      });
    });

    it('should scope for multiple permissions as well', function () {

      return ResourceModel.find(
        ResourceModel.scopeQueryByPermissions({}, 'id1', ['read', 'delete'])
      )
      .then((results) => {
        results.length.should.equal(1);
      });
    });

    it('should return an empty array of results if no permissions match the required', function () {
      
      return ResourceModel.find(
        ResourceModel.scopeQueryByPermissions({}, 'id1', ['read', 'delete', 'manage'])
      )
      .then((results) => {
        results.length.should.equal(0);
      });
    });
  });

  describe('findOne', function () {
    it('should return `null` if no permissions match the required', function () {
      return ResourceModel.findOne(
        ResourceModel.scopeQueryByPermissions({}, 'id2', ['update'])
      )
      .then((result) => {
        should(result).equal(null);
      });
    });

    it('should return the item if it matches', function () {
      return ResourceModel.findOne(
        ResourceModel.scopeQueryByPermissions({}, 'id1', ['update'])
      )
      .then((result) => {
        result._id.toString()
          .should.equal(ASSETS.resources[1]._id.toString());
      });
    });
  });
  
});