const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // adjust path
const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Add this /me route here with logging:
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      console.error('User not found in /me route');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User ${user.email} accessed /me route`); // Log when user accesses /me
    res.json({
      email: user.email,
      profileImage: user.profileImage,
      credits: user.credits,
      creditsExpiry: user.creditsExpiry
    });
  } catch (err) {
    console.error('Error in /me route', err); // Log any error that occurs inside /me route
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
