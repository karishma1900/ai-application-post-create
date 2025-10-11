const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  // ✅ Get token from HTTP-only cookie
  const token = req.cookies.token;

  if (!token) {
    console.error('Unauthorized: No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) {
      console.error('Unauthorized: User not found');
      throw new Error('User not found');
    }

    req.user = user;
    console.log(`Authenticated user: ${user.email}`); // Log user email
    next();
  } catch (err) {
    console.error('Unauthorized: Invalid token', err); // Log the error
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

module.exports = authMiddleware;
