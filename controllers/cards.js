const Card = require('../models/card');
const { errorHandler } = require('../modules/errorHandler');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (cards.length) {
        res.send(cards);
      } else {
        res.status(200).send({ message: 'В базе данных еще нет ни одной фотографии' });
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
    .orFail()
    .populate('owner', '_id')
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (card.owner.id.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Запрещено' });
      }
      card.remove()
        .then((document) => {
          res.send({ data: document });
        });
    })
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
