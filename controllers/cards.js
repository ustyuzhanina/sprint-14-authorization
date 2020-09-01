const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');

const Card = require('../models/card');

function errorHandler(error, req, res) {
  if (error.name === 'DocumentNotFoundError') {
    return res.status(404).json({ message: 'Документ не найден' });
  }

  if (error instanceof AssertionError) {
    return res.status(400).json({
      type: 'AssertionError',
      message: error.message,
    });
  }

  if (error instanceof MongoError) {
    return res.status(503).json({
      type: 'MongoError',
      message: error.message,
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).send({ message: 'На сервере произошла ошибка' })
}

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards.length) {
        res.send(cards);
      } else {
        res.status(400).send({ message: 'В базе данных еще нет ни одной фотографии' });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => errorHandler(err, req, res));
};

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('Не найдено'))
    .populate('owner', '_id')
    .then((card) => {
      if (card.owner.id.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Запрещено' });
      }
      const answer = card;
      card.remove();
      return answer;
    })
    .then((answer) => res.send({ data: answer }))
    .catch((err) => errorHandler(err, req, res));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка отсутствует в БД' });
      }
      res.send({ data: card });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка отсутствует в БД' });
      }
      res.send({ data: card });
    })
    .catch((err) => errorHandler(err, req, res));
};
