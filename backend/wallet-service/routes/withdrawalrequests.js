const express = require('express');
const router  = express.Router();

const { WithdrawalRequest, validateWithdrawalRequest } = require('../models/withdrawalrequest');
const auth     = require('../middleware/auth');
const admin    = require('../middleware/admin');
const gymStaff = require('../middleware/gymstaff');

router.get('/', [auth, admin], async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const requests = await WithdrawalRequest.find(filter)
    .populate('gymId', 'name city')
    .populate('requestedByUserId', 'name email')
    .sort({ createdAt: -1 });
  res.send(requests);
});

router.get('/gym/:gymId', [auth, gymStaff], async (req, res) => {
  const requests = await WithdrawalRequest.find({ gymId: req.params.gymId })
    .sort({ createdAt: -1 });
  res.send(requests);
});

router.post('/', [auth, gymStaff], async (req, res) => {
  const payload = { ...req.body, gymId: req.body.gymId, requestedByUserId: req.user._id };
  const { error } = validateWithdrawalRequest(payload);
  if (error) return res.status(400).send(error.details[0].message);

  const existing = await WithdrawalRequest.findOne({ gymId: req.body.gymId, status: 'pending' });
  if (existing) return res.status(400).send('A withdrawal request is already pending for this gym.');

  const request = new WithdrawalRequest(payload);
  await request.save();
  res.status(201).send(request);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const update = {
    status:           req.body.status,
    adminNote:        req.body.adminNote || '',
    resolvedByUserId: req.user._id,
    resolvedAt:       new Date()
  };
  const request = await WithdrawalRequest.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!request) return res.status(404).send('Withdrawal request not found.');
  res.send(request);
});

module.exports = router;
