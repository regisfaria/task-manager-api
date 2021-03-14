const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(400).json({error: 'Username is required in headers'});
  }

  const userExists = users.find(user => user.username === username);

  if (!userExists) {
    return response.status(404).json({error: 'No user found with that username'});
  }

  request.user = userExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const newUser = { id: uuidv4(), name, username, todos: [] };

  const usernameExists = users.find(user => user.username === newUser.username);

  if (usernameExists) {
    return response.status(400).json({error: 'Username already exists'});
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;

  return response.status(201).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const task = { id: uuidv4(), title, deadline: new Date(deadline), done: false, created_at: new Date() };

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const todos = request.user.todos;

  const task = todos.find(todo => todo.id === id);

  if (!task) {
    return response.status(404).json({error: 'No task with that ID'});
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(201).json(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const todos = request.user.todos;

  const task = todos.find(todo => todo.id === id);

  if (!task) {
    return response.status(404).json({error: 'No task with that ID'});
  }

  task.done = true;

  return response.status(201).json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const todos = request.user.todos;

  const task = todos.find(todo => todo.id === id);

  if (!task) {
    return response.status(404).json({error: 'No task with that ID'});
  }

  todos.splice(task, 1)

  return response.status(204).send();
});

module.exports = app;