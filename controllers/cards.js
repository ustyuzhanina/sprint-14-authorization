const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards.length) {
        res.send(cards);
      } else {
        res.status(400).send({ message: 'В базе данных еще нет ни одной фотографии' });
      }
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Ошибка валидации данных' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .orFail(() => { throw new Error(('Нет такой карточки')); })
    .populate('owner', '_id')
    .then((card) => {
      if (card.owner.id.toString() !== req.user._id) {
        throw new Error(('Запрещено'));
      }
      card.remove();
      return res.send({ data: card });
    })
    .catch(() => {
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true })
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true })
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};
