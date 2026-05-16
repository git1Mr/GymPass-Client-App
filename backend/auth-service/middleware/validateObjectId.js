const mongoose = require('mongoose');

module.exports = function validateObjectId(req, res, next) {
  const id = req.params.id || req.params.gymId || req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send('Invalid ID format.');
  next();
};
