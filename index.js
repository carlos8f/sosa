var api = require('./api');

module.exports = function (backend, backend_options) {
  backend_options || (backend_options = {});
  var cache = {};
  return function (coll_name, coll_options) {
    coll_options || (coll_options = {});
    function bindApi () {
      var args = [].slice.call(arguments);
      var coll_path = [coll_name].concat(args);
      var store = backend(coll_path, backend_options);
      return api(store, coll_options);
    }
    if (coll_options.func) return bindApi;
    return bindApi();
  };
};

module.exports.mem_backend = require('./mem_backend');
