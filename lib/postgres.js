var pg = exports; 
exports.constructor = function pg(){};

var pgLib = require('pg');

pg.initialize = (databaseUrl, cb)=> {
  let client = new pgLib.Client(databaseUrl);
  client.connect(function(err) {
    if (err) {
      return cb(err);
    }

    pg.client = client;
    cb();
  });
};
