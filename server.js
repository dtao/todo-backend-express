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

// Create a nice little mapping from HTTP endpoints to methods + arguments to
// send to our backend object.
var api = [
  ['GET /', 'all'],
  ['GET /:id', 'get', ['params.id']],
  ['POST /', 'create', ['body.title']],
  ['PATCH /:id', 'update', ['params.id', 'body']],
  ['DELETE /', 'clear'],
  ['DELETE /:id', 'delete', ['params.id']]
];

// For each entry in our mapping, basically do:
//
// app.<verb>(<route>, function(req, res) {
//   backend.<method>(<arguments>, function(err, data) {
//     res.send(data);
//   });
// });
//
// ...with a bit of error handling, of course.
api.forEach(function(spec) {
  var endpoint = spec[0].split(' '),
      method = spec[1],
      params = spec[2] || [];

  var verb = endpoint[0].toLowerCase(),
      route = endpoint[1];

  app[verb](route, function(req, res) {
    // For, e.g., 'params.id', we really want req.params.id; so split it into
    // ['params', 'id'] and set value = req['params'] and then take value['id']
    var args = params.map(function(param) {
      return param.split('.').reduce(function(value, member) {
        return value[member];
      }, req);
    });

    todos[method].apply(todos, args.concat([function(err, data) {
      if (err) {
        res.send(500, 'Something bad happened!');
        return;
      }

      if (data instanceof Array) {
        res.send(data.map(function(todo) {
          return createTodo(req, todo);
        }));

      } else {
        res.send(createTodo(req, data));
      }
    }]));
  });
});

app.listen(Number(process.env.PORT || 5000));
