import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';  // add .js if needed
import md5 from 'blueimp-md5';
const INITIAL_CREDITS = 100;
const getGravatar = (email) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};
// Use env var instead of hardcoded
const isProduction = process.env.NODE_ENV === 'production';
async function register(req, res) {
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
  // Generate JWT token
  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
  // Set cookie with production-safe options
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,  // true in prod (HTTPS required on Render)
    sameSite: isProduction ? 'none' : 'lax',  // 'none' for cross-origin in prod; 'lax' otherwise
