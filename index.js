var api = require('./api');

module.exports = function (backend, backend_options) {
  backend_options || (backend_options = {});
  return function (coll_name, coll_options) {
    coll_options || (coll_options = {});
    var store = backend(coll_name, backend_options);
    var coll = api(store, coll_options);
    coll.in = function () {
      var key_prefix = [].slice.call(arguments);
      // shallow-copy options and append key prefix.
      var opts = {};
      Object.keys(backend_options).forEach(function (k) {
        opts[k] = backend_options[k];
      });
      opts.key_prefix = (opts.key_prefix || []).slice().concat(key_prefix);
      return api(backend(coll_name, opts), coll_options);
    };
    return coll;
  };
};

module.exports.mem_backend = require('./mem_backend');
