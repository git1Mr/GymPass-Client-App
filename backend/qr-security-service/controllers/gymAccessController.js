const { processGymAccess, computeBalance } = require('../services/gymAccessService');

async function validateGymAccess(req, res) {
  const { userId, token, expiresAt, gymId } = req.body;

  if (!userId || !token || !expiresAt || !gymId) {
    return res.status(400).json({ success: false, message: 'Missing required fields: userId, token, expiresAt, gymId.' });
  }
  if (typeof expiresAt !== 'number') {
    return res.status(400).json({ success: false, message: 'expiresAt must be a Unix timestamp in milliseconds.' });
  }
  if (req.user.role === 'gym_staff' && req.user.gymId?.toString() !== gymId) {
    return res.status(403).json({ success: false, message: 'You can only validate access for your own gym.' });
  }

  try {
    const result = await processGymAccess({ userId, gymId, qrToken: token, qrExpiresAt: expiresAt });
    return res.status(200).json({
      success: true,
      message: `Access granted. ${result.pointsDeducted} pts deducted.`,
      data:    result
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message || 'Access denied.' });
  }
}

async function getLedgerBalance(req, res) {
  const { userId } = req.params;
  if (req.user._id.toString() !== userId && !req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden.' });
  }
  try {
    const balance = await computeBalance(userId);
    return res.status(200).json({ success: true, balance });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { validateGymAccess, getLedgerBalance };
