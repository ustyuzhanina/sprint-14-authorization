const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');

module.exports.errorHandler = (error, req, res) => {
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

  return res.status(500).send({ message: 'На сервере произошла ошибка' });
};
