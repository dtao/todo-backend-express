exports.up = function(db, callback) {
  db.addColumn('todos', 'user_id', { type: 'int' }, function() {
    db.addIndex('todos', 'todos_by_user_id', ['user_id'], callback);
  });
};

exports.down = function(db, callback) {
  db.removeColumn('todos', 'user_id', callback);
};
