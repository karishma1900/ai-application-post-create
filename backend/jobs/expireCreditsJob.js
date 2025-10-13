const cron = require('node-cron');
const User = require('../models/User');

// This runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily credit expiry job');
  const now = new Date();
  const expired = await User.find({ creditsExpiry: { $lte: now } });
  for (const user of expired) {
    user.credits = 0;
    user.creditsExpiry = null;
    await user.save();
  }
});
