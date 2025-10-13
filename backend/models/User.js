const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  credits: { type: Number, default: 0 },
  creditsExpiry: Date,
  stripeSubscriptionId: String,
  profileImage: String,   // <-- add this field
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
