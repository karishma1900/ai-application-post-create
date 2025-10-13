const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  console.log("Token received:", token);  // Log the token for debugging

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded payload:", payload);  // Log decoded payload

    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}


module.exports = authMiddleware;

