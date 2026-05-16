const express = require('express');
const router  = express.Router();

const { TierRequest, validateTierRequest } = require('../models/tierrequest');
const { Gym }      = require('../models/gym');
const auth         = require('../middleware/auth');
const admin        = require('../middleware/admin');
const gymStaff     = require('../middleware/gymstaff');

router.get('/', [auth, admin], async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const requests = await TierRequest.find(filter)
    .populate('gymId', 'name city tier')
    .populate('requestedByUserId', 'name email')
    .sort({ createdAt: -1 });
  res.send(requests);
});

router.get('/gym/:gymId', [auth, gymStaff], async (req, res) => {
  const requests = await TierRequest.find({ gymId: req.params.gymId })
    .sort({ createdAt: -1 });
  res.send(requests);
});

router.post('/', [auth, gymStaff], async (req, res) => {
  const payload = { ...req.body, requestedByUserId: req.user._id };
  const { error } = validateTierRequest(payload);
  if (error) return res.status(400).send(error.details[0].message);

  if (payload.currentTier === payload.requestedTier)
    return res.status(400).send('Requested tier must differ from current tier.');

  const pending = await TierRequest.findOne({ gymId: req.body.gymId, status: 'pending' });
  if (pending) return res.status(400).send('A tier request is already pending for this gym.');

  const request = new TierRequest(payload);
  await request.save();
  res.status(201).send(request);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const request = await TierRequest.findById(req.params.id);
  if (!request) return res.status(404).send('Tier request not found.');

  request.status           = req.body.status;
  request.adminNote        = req.body.adminNote || '';
  request.resolvedByUserId = req.user._id;
  request.resolvedAt       = new Date();
  await request.save();

  if (req.body.status === 'approved') {
    await Gym.findByIdAndUpdate(request.gymId, {
      tier:             request.requestedTier,
      pointsPerSession: request.requestedTier === 1 ? 1
                      : request.requestedTier === 2 ? 3 : 5
    });
  }

  res.send(request);
});

module.exports = router;
