const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.js');  // Adjust path if needed
const md5 = require('blueimp-md5');
const INITIAL_CREDITS = 100;
const getGravatar = (email) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};
// Use env var instead of hardcoded
const isProduction = process.env.NODE_ENV === 'production';
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const profileImage = getGravatar(email);
    const newUser = new User({
      name,
      email,
      passwordHash: hash,
      credits: INITIAL_CREDITS,
      creditsExpiry: null,
      profileImage,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
    // Set cookie with production-safe options
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,  // true in prod (HTTPS required on Render)
      sameSite: isProduction ? 'none' : 'lax',  // 'none' for cross-origin in prod; 'lax' otherwise
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
      domain: isProduction ? '.onrender.com' : undefined,  // Render domain
      path: '/',
    });
    // Send response (no token in body for security)
    res.json({
      message: 'Registered and logged in',
      email: newUser.email,
      credits: newUser.credits,
      profileImage: newUser.profileImage,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    // Set cookie with production-safe options
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: isProduction ? '.onrender.com' : undefined,
      path: '/',
    });
    res.json({
      message: 'Logged in',
      email: user.email,
      credits: user.credits,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
function logout(req, res) {
  try {
    // Clear cookie with matching options
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.onrender.com' : undefined,
      path: '/',
    });
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = { register, login, logout };
