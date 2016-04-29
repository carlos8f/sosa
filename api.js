module.exports = function (store, options) {
  var api = {
    load: function (id, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      opts || (opts = {});
      if (!id) {
        var err = new Error('must provide id to load');
        err.id = id;
        return cb(err);
      }
      store.load(id, opts, function (err, obj) {
        if (err) return cb(err);
        if (options.load && opts.hooks !== false && obj !== null) {
          options.load.call(api, obj, opts, cb);
        }
        else cb(null, obj);
      });
    },
    save: function (id, obj, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      opts || (opts = {});
      if (!id) {
        var err = new Error('must provide id to save');
        err.id = id;
        err.obj = obj;
        return cb(err);
      }
      if (typeof obj === 'undefined' || obj === null) {
        var err = new Error('must provide obj to save');
        err.id = id;
        err.obj = obj;
        return cb(err);
      }
      if (options.save && opts.hooks !== false) {
        options.save.call(api, obj, opts, function (err, retObj) {
          if (err) {
            err.saved = false;
            return cb(err);
          }
          withHooks(typeof retObj === 'undefined' ? obj : retObj);
        });
      }
      else withHooks(obj);

      function withHooks (obj) {
        store.save(id, obj, opts, function (err, retObj) {
          if (err) {
            err.saved = false;
            err.obj = obj;
            return cb(err);
          }
          if (typeof retObj !== 'undefined') obj = retObj;
          if (options.afterSave && opts.hooks !== false) {
            options.afterSave.call(api, obj, opts, function (err) {
              if (err) {
                err.saved = true;
                err.obj = obj;
                return cb(err);
              }
              cb(null, obj);
            });
          }
          else cb(null, obj);
        });
      }
    },
    destroy: function (id, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      opts || (opts = {});
      if (!id) {
        var err = new Error('must provide id to destroy');
        err.id = id;
        return cb(err);
      }
      store.destroy(id, opts, function (err, obj) {
        if (err) {
          err.saved = false;
          return cb(err);
        }
        if (options.destroy && opts.hooks !== false && typeof obj !== 'undefined' && obj !== null) {
          options.destroy.call(api, obj, opts, function (err) {
            if (err) {
              err.saved = true;
              err.obj = obj;
              return cb(err);
            }
            cb(null, obj);
          });
        }
        else cb(null, obj);
      });
    },
    select: function (opts, cb) {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      opts || (opts = {});
      store.select(opts, function (err, objs) {
        if (err) return cb(err);
        var latch = objs.length, errored = false;
        if (latch && options.load && opts.hooks !== false) {
          objs.forEach(function (obj, idx) {
            options.load.call(api, obj, opts, function (err, obj) {
              if (errored) return;
              if (err) {
                errored = true;
                return cb(err);
              }
              objs[idx] = obj;
              if (!--latch) return cb(null, objs);
            });
          });
        }
        else cb(null, objs);
      });
    }
  };

  Object.keys(options.methods || {}).forEach(function (k) {
    api[k] = options.methods[k].bind(api);
  });

  return api;
};
