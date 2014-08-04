var bcrypt = require('bcrypt'),
    createBackend = require('./backend');

module.exports = function createUsersBackend(connectionString) {
  var backend = createBackend(connectionString);

  var TOKEN_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

  var MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  function getRandomChar(string) {
    return string.charAt(Math.floor(Math.random() * string.length));
  }

  function createRandomToken() {
    var token = '';
    while (token.length < 32) {
      token += getRandomChar(TOKEN_CHARS);
    }
    return token;
  }

  return {
    create: function(name, password, passwordConfirmation, callback) {
      if (password !== passwordConfirmation) {
        callback({ status: 401, message: "Password and confirmation don't match" });
        return;
      }

      bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          callback(err);
          return;
        }

        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            callback(err);
            return;
          }

          backend.query('INSERT INTO users ("name", "password") VALUES ($1, $2) RETURNING *', [name, hash], function(err, rows) {
            callback(err, rows && rows[0]);
          });
        });
      });
    },

    getToken: function(name, password, callback) {
      backend.query('SELECT * FROM users WHERE name = $1', [name], function(err, rows) {
        if (err || rows.length === 0) {
          callback(err || { status: 401, message: 'User does not exist' });
          return;
        }

        var user = rows[0];
        bcrypt.compare(password, user.password, function(err, success) {
          if (err) {
            callback(err);
            return;
          }

          if (!success) {
            callback({ status: 401, message: 'Incorrect password' });
            return;
          }

          backend.query('SELECT * FROM auth_tokens WHERE user_id = $1', [user.id], function(err, rows) {
            if (err) {
              callback(err);
              return;
            }

            if (rows && rows.length > 0) {
              callback(null, rows[0].token);
              return;
            }

            var authTokenData = [
              user.id,
              createRandomToken(),
              Date.now() + MILLISECONDS_PER_DAY
            ];

            backend.query('INSERT INTO auth_tokens ("user_id", "token", "expiration") VALUES ($1, $2, to_timestamp($3)) RETURNING *', authTokenData, function(err, rows) {
              callback(err, rows && rows[0].token);
            });
          });
        });
      });
    },

    auth: function(token, callback) {
      if (!token) {
        callback({ status: 401, message: 'Auth token missing' });
        return;
      }

      backend.query('SELECT * FROM auth_tokens WHERE token = $1', [token], function(err, rows) {
        if (err) {
          callback(err);
          return;
        }

        var authToken = rows[0];
        if (!authToken) {
          callback({ status: 401, message: 'Incorrect auth token' });
          return;
        }

        if (authToken.expiration < Date.now()) {
          callback({ status: 401, message: 'Auth token is expired' });
          return;
        }

        callback(null, authToken.user_id);
      });
    }
  };
};
