var api = require('./api');

module.exports = function (backend, options) {
  options || (options = {});

  return function () {
    var prefix = [].slice.call(arguments);
    var store = backend(prefix, options);
    return api(store, options);
  };
};

module.exports.mem_backend = require('./mem_backend');
