
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function prefixProp(prefix, prop) {
  if (!prefix) {
    return prop;
  } else {
    return prefix + capitalizeFirstLetter(prop);
  }
}

function genACLKey(prefix, prop) {
  return prefixProp(prefix, 'acls') + '.' + prop;
}

function arrayHas(array, item) {
  return array.indexOf(item) !== -1;
}

function arrayAddUnique(array, item) {
  if (!arrayHas(array, item)) {
    // use concat in order to create new array before modifications
    return array.concat([item]);
  }

  return array;
};

function arrayRemove(array, item) {

  var index = array.indexOf(item);

  if (index !== -1) {
    // clone the array before making modification
    array = array.slice(0);
    array.splice(index, 1);
  }

  return array;
};


exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.prefixProp            = prefixProp;
exports.genACLKey             = genACLKey;
exports.arrayHas        = arrayHas;
exports.arrayAddUnique  = arrayAddUnique;
exports.arrayRemove     = arrayRemove;
