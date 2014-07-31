exports.up = function(db, callback) {
  var schema = {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: 'int',
      notNull: true
    },
    token: {
      type: 'string',
      unique: true,
      notNull: true
    },
    expiration: {
      type: 'timestamp',
      notNull: true
    }
  };

  db.createTable('auth_tokens', schema, function() {
    db.addIndex('auth_tokens', 'auth_tokens_by_token', ['token'], callback);
  });
};

exports.down = function(db, callback) {
  db.dropTable('auth_tokens', callback);
};
