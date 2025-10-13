const stripe = require('../config/stripe');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

const PRICE_CENTS = 7000; // $70
const CREDITS_PLAN = 500;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

async function createCheckoutSession(req, res) {
  const user = req.user;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: PRICE_CENTS,
          product_data: {
            name: '500 Credits - 1 month plan',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user._id.toString(),
    },
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
  });

  res.json({ url: session.url });
}

async function stripeWebhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature error', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    const user = await User.findById(userId);
    if (user) {
      user.credits = CREDITS_PLAN;
      user.creditsExpiry = new Date(Date.now() + MONTH_MS);
      await user.save();
      await CreditTransaction.create({
        userId,
        change: CREDITS_PLAN,
        reason: 'Subscription top-up',
      });
    }
  }

  res.json({ received: true });
}

module.exports = { createCheckoutSession, stripeWebhookHandler };
