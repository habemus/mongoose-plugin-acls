/**
 * Defines static methods on the schema
 */

// own
const aux = require('./auxiliary');

module.exports = function (schema, options) {

  const PREFIX = options.prefix;

  const SCOPE_QUERY_BY_PERMISSIONS = aux.prefixProp(
    'scopeQueryBy',
    aux.prefixProp(PREFIX, 'permissions')
  );

  const PERMISSION_SCOPES = options.permissionScopes;

  // check if static method names are free
  if (schema.statics[SCOPE_QUERY_BY_PERMISSIONS]) {
    throw new Error('schema.statics.' + SCOPE_QUERY_BY_PERMISSIONS ' already in use');
  }

  /**
   * Generates a query object
   * that is scoped for the scopes and the given identity.
   * 
   * @param  {String} identity
   * @param  {Array|String} scopes
   * @param  {Object} query
   * @return {Object}
   */
  schema.statics[SCOPE_QUERY_BY_PERMISSIONS] = function (query, identity, permissionScopes) {
    if (typeof query !== 'object') {
      throw new TypeError('query MUST be an Object');
    }

    if (typeof identity !== 'string') {
      throw new TypeError('identity MUST be a String');
    }

    if (!Array.isArray(permissionScopes) || permissionScopes.length === 0) {
      throw new TypeError('permissionScopes MUST be a non-empty Array');
    }

    permissionScopes.forEach((scope) => {
      if (!aux.arrayHas(PERMISSION_SCOPES, scope)) {
        throw new Error('permission scope unsupported ' + scope);
      }
    });
    
    // for each item in the required permissionScopes list,
    // add the identity to the _acls query
    permissionScopes.forEach((scope) => {
      var scopeACLKey = aux.genACLKey(PREFIX, scope);

      query[scopeACLKey] = identity;
    });

    return query;
  };
};


