// auxiliary methods
const aux = require('./auxiliary');

/**
 * Mixin function that adds properties, methods and statics
 * to the given schema in order to give it 'acls' functionality.
 * 
 * @param  {mongoose.Schema} schema
 * @param  {Object} options
 * @return {void}
 */
module.exports = function makeAcls(schema, options) {

  if (!schema) {
    throw new TypeError('schema MUST be an instance of mongoose.Schema');
  }

  if (!options) {
    throw new TypeError('options MUST be an object');
  }

  if (!Array.isArray(options.permissionScopes) || options.permissionScopes.length === 0) {
    throw new TypeError('options.permissionScopes MUST be a non-empty array');
  }

  require('./schema')(schema, options);
  require('./methods')(schema, options);
  require('./statics')(schema, options);
};
