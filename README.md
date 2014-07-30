# todo-backend-express

This is an implementation of [moredip's](https://github.com/moredip) [Todo-Backend](http://todo-backend.thepete.net/) API spec, using Node.js and the Express framework.

Unlike the example [Sinatra implementation](https://github.com/moredip/todo-backend-sinatra), this one does not "cheat"; it saves TODOs in a PostgreSQL database.

This example uses [node-db-migrate](https://github.com/kunklejr/node-db-migrate) for database migrations and is running on Heroku at [http://todo-backend-express.herokuapp.com](http://todo-backend-express.herokuapp.com).
