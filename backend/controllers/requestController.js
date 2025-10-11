const User = require('../models/User');
const RequestLog = require('../models/RequestLog'); // define similar model

const CREDITS_PER_REQUEST = 3;

async function placeRequest(req, res) {
  const user = req.user;

  // Check credit expiry
  if (user.creditsExpiry && user.creditsExpiry < new Date()) {
    user.credits = 0;
    user.creditsExpiry = null;
    await user.save();
    return res.status(403).json({ error: 'Your credits have expired, please purchase more.' });
  }

  if (user.credits < CREDITS_PER_REQUEST) {
    return res.status(403).json({ error: 'Not enough credits.' });
  }

  // Deduct credits
  user.credits -= CREDITS_PER_REQUEST;
  await user.save();

  // Log the request
  await RequestLog.create({
    userId: user._id,
    creditsUsed: CREDITS_PER_REQUEST,
    requestData: req.body, 
  });

  // Process the actual request logic (call your external API etc.)
  // For now, just respond success
  res.json({ message: 'Request processed', credits: user.credits });
}

module.exports = { placeRequest };
