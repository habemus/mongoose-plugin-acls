const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeAcls = require('../../lib');

describe('methods', function () {

  var ASSETS;

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

        const ResourceModel = ASSETS.mongooseConnection.model('Resource', resourceSchema);

        ASSETS.ResourceModel = ResourceModel;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('grant(identity, scopes)', function () {
    it('add the identity to the ACL of the requested scopes', function () {

      var resource = new ASSETS.ResourceModel();
      var identity1 = 'some-identity-string-1';
      var identity2 = 'some-identity-string-2'

      resource.grant(identity1, ['manage', 'read', 'update']);

      resource.grant(identity2, ['manage', 'read', 'update']);

      var manageACL = resource.get('acls.manage');
      manageACL.length.should.equal(2);
      manageACL[0].should.equal(identity1);
      manageACL[1].should.equal(identity2);

      var readACL = resource.get('acls.read');
      readACL.length.should.equal(2);
      readACL[0].should.equal(identity1);
      readACL[1].should.equal(identity2);

      var updateACL = resource.get('acls.update');
      updateACL.length.should.equal(2);
      updateACL[0].should.equal(identity1);
      updateACL[1].should.equal(identity2);
    });

    it('should be idempotent', function () {

      var resource = new ASSETS.ResourceModel();
      var identity1 = 'some-identity-string-1';

      resource.grant(identity1, ['read']);
      resource.grant(identity1, ['read']);

      resource.get('acls.read').length.should.equal(1);
      resource.get('acls.read')[0].should.equal(identity1);
    });

    it('should require identity', function () {

      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      assert.throws(function () {
        resource.grant(undefined, ['manage']);
      });
    });

    it('should require scopes not to be empty', function () {

      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      assert.throws(function () {
        resource.grant(identity, []);
      });

      assert.throws(function () {
        resource.grant(identity, undefined);
      });

      assert.throws(function () {
        resource.grant(identity, '');
      });
    });

    it('should throw error if the ACL is not predefined', function () {

      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      assert.throws(function () {
        resource.grant(identity, ['scope-that-does-not-exist']);
      });      
    });
  });

  describe('deny(identity, scopes)', function () {
    it('remove the identity from the ACL of the requested scopes', function () {

      var resource = new ASSETS.ResourceModel();
      var identity1 = 'some-identity-string-1';
      var identity2 = 'some-identity-string-2'

      resource.grant(identity1, ['manage', 'read', 'update']);

      resource.grant(identity2, ['manage', 'read', 'update']);

      var manageACL = resource.get('acls.manage');
      manageACL.length.should.equal(2);
      manageACL[0].should.equal(identity1);
      manageACL[1].should.equal(identity2);

      var readACL = resource.get('acls.read');
      readACL.length.should.equal(2);
      readACL[0].should.equal(identity1);
      readACL[1].should.equal(identity2);

      var updateACL = resource.get('acls.update');
      updateACL.length.should.equal(2);
      updateACL[0].should.equal(identity1);
      updateACL[1].should.equal(identity2);

      // deny identity1 from 'read' permission scope
      resource.deny(identity1, ['read']);

      var manageACL = resource.get('acls.manage');
      manageACL.length.should.equal(2);
      manageACL[0].should.equal(identity1);
      manageACL[1].should.equal(identity2);

      var readACL = resource.get('acls.read');
      readACL.length.should.equal(1);
      readACL[0].should.equal(identity2);

      var updateACL = resource.get('acls.update');
      updateACL.length.should.equal(2);
      updateACL[0].should.equal(identity1);
      updateACL[1].should.equal(identity2);
    });

    it('should require identity', function () {

      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      assert.throws(function () {
        resource.deny(undefined, ['manage']);
      });
    });

    it('should require scopes not to be empty', function () {

      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      assert.throws(function () {
        resource.deny(identity, []);
      });

      assert.throws(function () {
        resource.deny(identity, undefined);
      });

      assert.throws(function () {
        resource.deny(identity, '');
      });
    });

    it('should throw error if the ACL is not predefined', function () {

      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      assert.throws(function () {
        resource.deny(identity, ['scope-that-does-not-exist']);
      });      
    });

    it('should be idempotent', function () {

      var resource = new ASSETS.ResourceModel();
      var identity1 = 'some-identity-string-1';

      resource.grant(identity1, ['read']);
      resource.get('acls.read').length.should.equal(1);
      resource.get('acls.read')[0].should.equal(identity1);

      resource.deny(identity1, ['read']);
      resource.get('acls.read').length.should.equal(0);

      resource.deny(identity1, ['read']);
      resource.get('acls.read').length.should.equal(0);
    });
  });

  describe('verifyPermissions(identity, scopes)', function () {

    it('should return false if the identity is not listed in all the required scopes', function () {
      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      resource.grant(identity, ['read', 'update'])

      resource
        .verifyPermissions(identity, ['manage', 'read'])
        .should.equal(false);
    });

    it('should return true if the identity is listed in all required scopes', function () {
      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      resource.grant(identity, ['read', 'update'])

      resource
        .verifyPermissions(identity, ['update', 'read'])
        .should.equal(true);
    });

    it('should throw error if the permission scope is not defined', function () {
      var resource = new ASSETS.ResourceModel();
      var identity = 'some-identity-string';

      resource.grant(identity, ['read', 'update']);

      assert.throws(function () {
        resource
          .verifyPermissions(identity, ['some-random-permission'])
      });
    });

  });
});