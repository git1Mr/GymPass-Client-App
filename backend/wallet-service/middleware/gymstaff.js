module.exports = function gymStaff(req, res, next) {
  if (!req.user) return res.status(401).send('Access denied.');
  if (req.user.isAdmin) return next();

  if (req.user.role !== 'gym_staff')
    return res.status(403).send('Access denied. Gym staff only.');

  if (req.params.gymId && req.params.gymId !== String(req.user.gymId))
    return res.status(403).send('Access denied. You can only manage your own gym.');

  next();
};
