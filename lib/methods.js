// own
const aux = require('./auxiliary');

module.exports = function (schema, options) {

  const PREFIX = options.prefix;

  const VERIFY_PERMISSIONS = aux.prefixProp(PREFIX, 'verifyPermissions');
  const GRANT              = aux.prefixProp(PREFIX, 'grant');
  const DENY               = aux.prefixProp(PREFIX, 'deny');

  const PERMISSION_SCOPES = options.permissionScopes;

  /**
   * Checks a given identity has authority over given permissionScopes.
   *
   * Synchronous
   * 
   * @param  {String} identity
   * @param  {Array|String} permissionScopes
   * @return {Boolean}
   */
  schema.methods[VERIFY_PERMISSIONS] = function _verifyPermissions(identity, permissionScopes) {

    return permissionScopes.every((scope) => {

      if (!aux.arrayHas(PERMISSION_SCOPES, scope)) {
        throw new Error('unsupported permission scope ' + scope);
      }
    
      var scopeACLKey = aux.genACLKey(PREFIX, scope);
      var scopeACL    = this.get(scopeACLKey);

      return aux.arrayHas(scopeACL, identity);
    });
  };

  /**
   * Grant the given identity the defined permissionScopes.
   * 
   * @param  {String} identity
   * @param  {Array|String} permissionScopes
   * @return {undefined}
   */
  schema.methods[GRANT] = function _grant(identity, permissionScopes) {

    if (!identity) {
      throw new Error('identity is required');
    }

    if (!permissionScopes || permissionScopes.length === 0) {
      throw new Error('permissionScopes MUST not be empty');
    }

    permissionScopes.forEach((scope) => {

      if (!aux.arrayHas(PERMISSION_SCOPES, scope)) {
        throw new Error('unsupported permission scope ' + scope);
      }

      var scopeACLKey = aux.genACLKey(PREFIX, scope);
      var scopeACL    = this.get(scopeACLKey);

      this.set(
        scopeACLKey,
        aux.arrayAddUnique(scopeACL, identity)
      );
    });
  };

  /**
   * Deny the given identity the defined permissionScopes.
   * 
   * @param  {String} identity
   * @param  {Array|String} permissionScopes
   * @return {undefined}
   */
  schema.methods[DENY] = function _deny(identity, permissionScopes) {

    if (!identity) {
      throw new Error('identity is required');
    }

    if (!permissionScopes || permissionScopes.length === 0) {
      throw new Error('permissionScopes MUST not be empty');
    }

    permissionScopes.forEach((scope) => {

      if (!aux.arrayHas(PERMISSION_SCOPES, scope)) {
        throw new Error('unsupported permission scope ' + scope);
      }

      var scopeACLKey = aux.genACLKey(PREFIX, scope);
      var scopeACL    = this.get(scopeACLKey);

      this.set(
        scopeACLKey,
        aux.arrayRemove(scopeACL, identity)
      );
    });
  };

};
