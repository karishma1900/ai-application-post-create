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

  // Set cookie (just like login)
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // change to true in production with HTTPS
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });

  // Send response with user info
  res.json({
    message: 'Registered and logged in',
    email: newUser.email,
    credits: newUser.credits,
    profileImage: newUser.profileImage,
  });
}


function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

async function login(req, res) {
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

  // ✅ SET the cookie HERE
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // ❗ Set to true in production (with HTTPS)
    sameSite: 'Lax', // Or 'Strict'
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });

  res.json({
    message: 'Logged in',
    email: user.email,
    credits: user.credits,
    profileImage: user.profileImage,
  });
}


export { register, login,logout };

