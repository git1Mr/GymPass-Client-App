const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const config   = require('config');
const Joi      = require('joi');
const winston  = require('winston');
const Stripe   = require('stripe');

const { Transaction } = require('../models/transaction');
const { User }        = require('../models/user');
const auth            = require('../middleware/auth');

let _stripeClient = null;
function stripeClient() {
  if (_stripeClient) return _stripeClient;
  const key = config.get('stripe.secretKey');
  if (!key) {
    const err = new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
    err.statusCode = 503;
    throw err;
  }
  _stripeClient = Stripe(key);
  return _stripeClient;
}

const MIN_AMOUNT_MINOR = 100;
function pointsFromAmount(amountMinor) { return Math.floor(amountMinor / 100); }

function validateCreateIntent(body) {
  return Joi.object({
    amount:   Joi.number().integer().min(1).max(100000).required(),
    currency: Joi.string().length(3).lowercase().optional(),
    // Optional explicit points override. Used by plan packs where the
    // points-per-MAD ratio isn't 1:1 (e.g. "Mobility": 199 MAD → 25 pts).
    // Defaults to amount-in-major-units (1 MAD = 1 pt) when absent.
    points:   Joi.number().integer().min(1).max(100000).optional(),
    // Optional label shown in the ledger row (e.g. "Mobility plan").
    label:    Joi.string().max(80).optional()
  }).validate(body);
}

router.post('/create-intent', auth, async (req, res, next) => {
  try {
    const { error, value } = validateCreateIntent(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const currency = (value.currency || config.get('stripe.currency') || 'mad').toLowerCase();
    const amountMinor = value.amount * 100;
    if (amountMinor < MIN_AMOUNT_MINOR) return res.status(400).send('Amount below the minimum allowed.');

    const stripe = stripeClient();
    const user = await User.findById(req.user._id).select('email name');
    if (!user) return res.status(404).send('User not found.');

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customer = customers.data[0]
      || (await stripe.customers.create({
        email: user.email,
        name:  user.name,
        metadata: { userId: String(user._id) }
      }));

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' }
    );

    // Client may pin a specific points value (plan packs). Otherwise default 1:1.
    const points = value.points ?? pointsFromAmount(amountMinor);
    const label  = value.label  ?? `${points} UnityFitnessCredits`;

    const intent = await stripe.paymentIntents.create({
      amount: amountMinor,
      currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(user._id),
        points: String(points),
        label,
        kind:   value.points ? 'unityfitness_plan_purchase' : 'unityfitness_credits_topup'
      }
    });

    res.send({
      clientSecret:   intent.client_secret,
      ephemeralKey:   ephemeralKey.secret,
      customer:       customer.id,
      publishableKey: config.get('stripe.publishableKey'),
      merchantName:   config.get('stripe.merchantName'),
      amount:         amountMinor,
      currency,
      points,
      label
    });
  } catch (err) {
    if (err.statusCode === 503) {
      winston.warn('Stripe not configured', { message: err.message });
      return res.status(503).send(err.message);
    }
    winston.error('Stripe create-intent failed', { message: err.message });
    next(err);
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.header('stripe-signature');
  const secret = config.get('stripe.webhookSecret');
  if (!secret) {
    winston.error('Stripe webhook secret not configured');
    return res.status(503).send('Webhook not configured.');
  }

  let stripe;
  try { stripe = stripeClient(); }
  catch (err) { return res.status(503).send(err.message); }

  let event;
  try { event = stripe.webhooks.constructEvent(req.body, sig, secret); }
  catch (err) {
    winston.warn('Stripe signature verification failed', { message: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'payment_intent.succeeded') {
    return res.json({ received: true, ignored: event.type });
  }

  const intent  = event.data.object;
  const userId  = intent.metadata?.userId;
  const points  = Number(intent.metadata?.points || 0);
  const amount  = intent.amount;
  const amountMajor = amount / 100;
  const currency = intent.currency;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId) || points <= 0) {
    winston.error('Webhook missing/invalid metadata', { intentId: intent.id });
    return res.status(200).json({ received: true, skipped: 'bad-metadata' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const tx = new Transaction({
      userId,
      type:                  'purchase',
      pointsAmount:          points,
      amountPaidMAD:         amountMajor,
      packLabel:             intent.metadata?.label || `${points} UnityFitnessCredits`,
      source:                'online',
      status:                'confirmed',
      provider:              'stripe',
      stripePaymentIntentId: intent.id,
      currency
    });
    await tx.save({ session });

    await User.findByIdAndUpdate(
      userId,
      { $inc: { pointsBalance: points } },
      { session }
    );

    await session.commitTransaction();
    winston.info('Credits topped up via Stripe', { userId, points, intentId: intent.id });
    res.json({ received: true });
  } catch (err) {
    await session.abortTransaction();
    if (err && err.code === 11000) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    winston.error('Webhook ledger write failed', { message: err.message, intentId: intent.id });
    res.status(500).send('Ledger write failed.');
  } finally {
    session.endSession();
  }
});

module.exports = router;
