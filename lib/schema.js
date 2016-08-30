// own
const aux = require('./auxiliary');

/**
 * Default ACLs
 *
 * The default ACLs should be used to perform basic resource
 * permission checks.
 *
 * The actual implementation of the verification is outside the scope
 * of this module and should be of the module consumer's responsibility.
 *
 * That is due to the fact that what "manage", "read", "update" and "delete"
 * means may differ from application to application.
 *
 * Uses for the permission scopes are suggested and SHOULD be followed
 * when situations apply (most cases).
 * 
 * @type {Object}
 */
// TODO: definetively remove the DEFAULT_ACL_SCHEMA
// const DEFAULT_ACL_SCHEMA = {
//   /**
//    * MANAGE permission scope
//    * should be used to check whether a given identity can manage
//    * permissions for the resource.
//    * It is the only scope that requires at least one identity.
//    * @type {Array}
//    */
//   manage: {
//     type: [String],
//     default: function () {
//       return [];
//     },
//     required: true,
//   },

//   /**
//    * READ permission scope
//    * should be used to check if an identity has read access to the resource.
//    * @type {Array}
//    */
//   read: {
//     type: [String],
//     default: function () {
//       return [];
//     }
//   },

//   /**
//    * UPDATE permission scope
//    * should be used to check whether a given identity can update
//    * data of the resource.
//    * @type {Array}
//    */
//   update: {
//     type: [String],
//     default: function () {
//       return [];
//     }
//   },

//   /**
//    * DELETE permission scope
//    * should be used to check whether a given identity can delete
//    * the resource from the database.
//    * @type {Array}
//    */
//   delete: {
//     type: [String],
//     default: function () {
//       return [];
//     }
//   }
// };

function buildAclsSchema(options) {
  var aclSchema = {};

  options.permissionScopes.forEach((scope) => {
    aclSchema[scope] = {
      type: [String],
      default: function () {
        return [];
      }
    };
  });

  return aclSchema;
}

module.exports = function (schema, options) {

  const PROPERTY = aux.prefixProp(options.prefix, 'acls');

  var aclsSubSchema = {};
  aclsSubSchema[PROPERTY] = buildAclsSchema(options);

  schema.add(aclsSubSchema);
};
