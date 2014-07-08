var express = require('express'),
    bodyParser = require('body-parser'),
    backend = require('./backend');

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

var todos = backend(process.env.DATABASE_URL);

function createTodo(req, data) {
  return {
    title: data.title,
    completed: data.completed || false,
    url: '//' + req.get('host') + '/' + data.id
  };
}

function getCreateTodo(req) {
  return function(data) {
    return createTodo(req, data);
  };
}

app.get('/', function(req, res) {
  todos.all(function(err, todos) {
    if (err) {
      res.send(404, 'No TODOs!');
      return;
    }

    res.send(todos.map(getCreateTodo(req)));
  });
});

app.get('/:id', function(req, res) {
  todos.get(req.params.id, function(err, todo) {
    if (err || !todo) {
      res.send(404, 'TODO missing?');
      return;
    }

    res.send(createTodo(req, todo));
  });
});

app.post('/', function(req, res) {
  todos.create(req.body.title, function(err, todo) {
    if (err || !todo) {
      res.send(500, 'Unable to create TODO!');
      return;
    }

    res.send(createTodo(req, todo));
  });
});

app.patch('/:id', function(req, res) {
  todos.update(req.params.id, req.body, function(err, todo) {
    if (err || !todo) {
      res.send(404, 'TODO missing?');
      return;
    }

    res.send(createTodo(req, todo));
  });
});

app.delete('/', function(req, res) {
  todos.clear(function(err, todos) {
    if (err) {
      res.send(404, 'TODO missing?');
      return;
    }

    res.send(todos.map(getCreateTodo(req)));
  })
});

app.delete('/:id', function(req, res) {
  todos.delete(req.params.id, function(err, todo) {
    if (err || !todo) {
      res.send(500, 'Unable to delete TODOs!');
      return;
    }

    res.send(createTodo(req, todo));
  });
});

app.listen(Number(process.env.PORT || 5000));
