var express = require('express'),
    bodyParser = require('body-parser');

var app = express();

// ----- Parse JSON requests

app.use(bodyParser.json());

// ----- Allow CORS

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ----- The API implementation

var host = process.env.HOST || 'localhost:' + process.env.PORT,
    todos = {},
    currentId = 1;

function getAllTodos() {
  var list = [];
  for (var id in todos) {
    list.push(todos[id]);
  }
  return list;
}

function addTodo(data) {
  var id = currentId++;

  var todo = {
    id: id,
    title: data.title,
    completed: false,
    url: '//' + host + '/' + id
  };

  todos[todo.id] = todo;

  return todo;
}

function updateTodo(id, data) {
  var todo = todos[id];

  for (var prop in data) {
    todo[prop] = data[prop];
  }

  return todo;
}

app.get('/', function(req, res) {
  res.send(getAllTodos());
});

app.get('/:id', function(req, res) {
  var todo = todos[req.params.id];
  res.send(todo);
});

app.post('/', function(req, res) {
  var todo = addTodo(req.body);
  res.send(todo);
});

app.patch('/:id', function(req, res) {
  var todo = updateTodo(req.params.id, req.body);
  res.send(todo);
});

app.delete('/', function(req, res) {
  todos = {};
  res.send(getAllTodos());
});

app.delete('/:id', function(req, res) {
  delete todos[req.params.id];
  res.send(getAllTodos());
});

app.listen(Number(process.env.PORT || 5000));
