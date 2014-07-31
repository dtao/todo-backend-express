exports.up = function(db, callback) {
  var schema = {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      unique: true,
      notNull: true
    },
    password: {
      type: 'string',
      notNull: true
    }
  };

  db.createTable('users', schema, function() {
    db.addIndex('users', 'users_by_name', ['name'], true, callback);
  });
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};
