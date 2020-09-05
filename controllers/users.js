const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { errorHandler } = require('../modules/errorHandler');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      if (users.length) {
        res.send(users);
      } else {
        res.status(404).send({ message: 'В базе данных еще нет ни одного пользователя' });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(404).send({ message: 'Нет пользователя с таким id' });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).send({ message: 'Введите пароль. Минимальная длина пароля - 8 символов' });
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).send({ message: 'Пользователь с таким адресом электронной почты уже существует!' });
      }

      return errorHandler(err, req, res);
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        // eslint-disable-next-line consistent-return
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          const token = jwt.sign(
            { _id: user._id },
            'some-secret-key',
            { expiresIn: '7d' },
          );

          res.cookie('jwt', token, {
            maxAge: 3600 * 24 * 7,
            httpOnly: true,
            sameSite: true,
          });
          res.send({ message: token });
        });
    })
    .catch(() => {
      res.status(401).send({ message: 'Неправильные почта или пароль' });
    });
};

module.exports.updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    about: req.body.about,
  }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => errorHandler(err, req, res));
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.body.avatar,
  }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => errorHandler(err, req, res));
};
