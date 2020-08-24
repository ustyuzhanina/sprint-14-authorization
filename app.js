const express = require('express');
// const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const cards = require('./routes/cards.js');
const users = require('./routes/users.js');
const { login, createUser } = require('./controllers/users.js');

const { PORT = 3000 } = process.env;

const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(bodyParser());
app.use(cookieParser());

app.use((req, res, next) => {
  req.user = {
    _id: '5f316fd9b970d6230ca50b00', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

// app.use(express.static(path.join(__dirname, 'public')));

app.use('/cards', cards);

app.use('/users', users);

app.post('/signup', createUser);
app.post('/signin', login);

app.use((req, res) => {
  res.status('404');
  res.send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT);
