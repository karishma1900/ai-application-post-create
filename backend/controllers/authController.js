import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Adjust path if needed
import md5 from 'blueimp-md5';

const INITIAL_CREDITS = 100;

// Token expiry times
const ACCESS_TOKEN_EXPIRES_IN = '15m';    // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d';    // 7 days

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const getGravatar = (email) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

function generateAccessToken(user) {
  return jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

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

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  // Send refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'Strict',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: 'Registered and logged in',
    accessToken,
    email: newUser.email,
    credits: newUser.credits,
    profileImage: newUser.profileImage,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  // Log incoming email and password (DO NOT log the password in production)
  console.log('Login request received for email:', email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('No user found with email:', email);  // Log when no user is found
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user.email);  // Log the user found in the DB

    // Check if password matches
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isValid);  // Log the result of password comparison

    if (!isValid) {
      console.log('Invalid password for email:', email);  // Log if password is invalid
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    console.log('Generated accessToken and refreshToken');  // Log token generation

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'Strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    });

    // Respond with tokens and user data
    res.json({
      message: 'Logged in',
      accessToken,
      email: user.email,
      credits: user.credits,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error('Error during login:', err);  // Log the error in case of failure
    return res.status(500).json({ error: 'Something went wrong!' });
  }
}

// Refresh token endpoint - issue new access token if refresh token valid
async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

function logout(req, res) {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out' });
}

export { register, login, logout, refreshToken };

