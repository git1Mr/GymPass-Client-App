// Allows only club admins (gym owner / general manager). Their JWT carries the
// gymId, so gym-scoped routes can force operations to the creator's own gym.
module.exports = function gymAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'gym_admin')
    return res.status(403).send('Access denied. Club admins only.');
  next();
};
