var app = require('express')(),
    bodyParser = require('body-parser'),
    todos = require('./todos')(process.env.DATABASE_URL),
    users = require('./users')(process.env.DATABASE_URL);

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

function createCallback(res, onSuccess) {
  return function callback(err, data) {
    if (err) {
      console.error(err);
    }

    if (err || !data) {
      res.send(500, err || 'Something bad happened!');
      return;
    }

    onSuccess(data);
  };
}

function createUser(data) {
  return {
    name: data.name
  };
}

function createTodo(req, data) {
  return {
    title: data.title,
    order: data.order,
    completed: data.completed || false,
    url: req.protocol + '://' + req.get('host') + '/todos/' + data.id
  };
}

function getCreateTodo(req) {
  return function(data) {
    return createTodo(req, data);
  };
}

app.post('/register', function(req, res) {
  var name = req.body.name,
      password = req.body.password,
      passwordConfirmation = req.body.passwordConfirmation;

  users.create(name, password, passwordConfirmation, createCallback(res, function(user) {
    res.send(createUser(user));
  }));
});

app.post('/login', function(req, res) {
  var name = req.body.name,
      password = req.body.password;

  users.getToken(name, password, createCallback(res, function(token) {
    res.send({ token: token });
  }));
});

app.get('/todos', function(req, res) {
  todos.all(req.query.token, createCallback(res, function(todos) {
    res.send(todos.map(getCreateTodo(req)));
  }));
});

app.get('/todos/:id', function(req, res) {
  todos.get(req.query.token, req.params.id, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.post('/todos', function(req, res) {
  todos.create(req.query.token, req.body.title, req.body.order, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.patch('/todos/:id', function(req, res) {
  todos.update(req.query.token, req.params.id, req.body, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.delete('/todos', function(req, res) {
  todos.clear(req.query.token, createCallback(res, function(todos) {
    res.send(todos.map(getCreateTodo(req)));
  }));
});

app.delete('/todos/:id', function(req, res) {
  todos.delete(req.query.token, req.params.id, createCallback(res, function(todo) {
    res.send(createTodo(req, todo));
  }));
});

app.listen(Number(process.env.PORT || 5000));
