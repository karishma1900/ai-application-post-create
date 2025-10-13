const express = require('express');
const { createCheckoutSession, stripeWebhookHandler } = require('../controllers/creditController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const CreditTransaction = require('../models/CreditTransaction');

// Public webhook (no auth) — ensure you verify signature
router.post('/webhook', stripeWebhookHandler);

// Auth-protected route to start payment
router.post('/checkout', authMiddleware, createCheckoutSession);
router.post('/deduct', authMiddleware, async (req, res) => {
  const user = req.user;
  const { amount } = req.body;

  if (user.credits < amount) {
    return res.status(400).json({ error: 'Not enough credits' });
  }

  user.credits -= amount;
  await user.save();

  await CreditTransaction.create({
    userId: user._id,
    change: -amount,
    reason: 'Request usage',
  });

  res.json({ message: 'Credits deducted', credits: user.credits });
});

module.exports = router;
