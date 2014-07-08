var pg = require('pg.js');

module.exports = function createTodoBackend(connectionString) {
  function query(query, params, callback) {
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

        callback(result.rows);
      });
    });
  }

  return {
    all: function(callback) {
      query('SELECT * FROM todos', [], callback);
    },

    get: function(id, callback) {
      query('SELECT * FROM todos WHERE id = $1', [id], function(rows) {
        callback(rows[0]);
      });
    },

    create: function(title, callback) {
      query("INSERT INTO todos (title, completed) VALUES ($1, false) RETURNING *", [title], function(rows) {
        callback(rows[0]);
      });
    },

    update: function(id, properties, callback) {
      // Split keys & values
      var keys = [], values = [];
      for (var prop in properties) {
        // Only allowed keys are 'title' and 'completed'
        if (prop !== 'title' && prop !== 'completed')
          continue;

        keys.push(prop);
        values.push(properties[prop]);
      }

      var assigns = keys.map(function(key, i) {
        return key + '=$' + (i + 1);
      });

      var updateQuery = [
        'UPDATE todos',
        'SET ' + assigns.join(', '),
        'WHERE id = $' + (assigns.length + 1),
        'RETURNING *'
      ];

      query(updateQuery.join(' '), values.concat([id]), function(rows) {
        callback(rows[0]);
      });
    },

    delete: function(id, callback) {
      query('DELETE FROM todos WHERE id = $1 RETURNING *', [id], function(rows) {
        callback(rows[0]);
      });
    },

    clear: function(callback) {
      query('DELETE FROM todos RETURNING *', [], callback);
    }
  };
};
