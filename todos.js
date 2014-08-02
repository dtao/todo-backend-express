var createBackend = require('./backend'),
    createUsersBackend = require('./users');

module.exports = function createTodoBackend(connectionString) {
  var backend = createBackend(connectionString),
      users = createUsersBackend(connectionString);

  var api = {
    all: function(userId, callback) {
      backend.query('SELECT * FROM todos WHERE user_id = $1', [userId], callback);
    },

    get: function(userId, id, callback) {
      backend.query('SELECT * FROM todos WHERE user_id = $1 AND id = $2', [userId, id], function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    create: function(userId, title, order, callback) {
      backend.query('INSERT INTO todos ("user_id", "title", "order", "completed") VALUES ($1, $2, $3, false) RETURNING *', [userId, title, order], function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    update: function(userId, id, properties, callback) {
      var assigns = [], values = [];

      function addAssignment(columnName, value) {
        assigns.push('"' + columnName + '"=$' + (assigns.length + 1));
        values.push(value);
      }

      addAssignment('user_id', userId);

      if ('title' in properties) {
        addAssignment('title', properties.title);
      }
      if ('order' in properties) {
        addAssignment('order', properties.order);
      }
      if ('completed' in properties) {
        addAssignment('completed', properties.completed);
      }

      var updateQuery = [
        'UPDATE todos',
        'SET ' + assigns.join(', '),
        'WHERE id = $' + (assigns.length + 1),
        'RETURNING *'
      ];

      backend.query(updateQuery.join(' '), values.concat([id]), function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    delete: function(userId, id, callback) {
      backend.query('DELETE FROM todos WHERE user_id = $1 AND id = $2 RETURNING *', [userId, id], function(err, rows) {
        callback(err, rows && rows[0]);
      });
    },

    clear: function(userId, callback) {
      backend.query('DELETE FROM todos WHERE user_id = $1 RETURNING *', [userId], callback);
    }
  };

  var authenticatedApi = {};
  Object.keys(api).forEach(function(method) {
    authenticatedApi[method] = function(token) {
      var args = [].slice.call(arguments),
          callback = args[args.length - 1];

      users.auth(token, function(err, userId) {
        if (err) {
          callback(err);
          return;
        }

        args[0] = userId;

        api[method].apply(api, args);
      });
    };
  });

  return authenticatedApi;
};
