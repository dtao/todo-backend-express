var pg = require('pg.js');

module.exports = function createBackend(connectionString) {
  return {
    query: function query(query, params, callback) {
      pg.connect(connectionString, function(err, client, done) {
        done();

        if (err) {
          callback(err);
          return;
        }

        client.query(query, params, function(err, result) {
          if (err) {
            callback(err);
            return;
          }

          callback(null, result.rows);
        });
      });
    }
  };
};
