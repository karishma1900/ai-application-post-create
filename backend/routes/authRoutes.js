const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Adjust path if needed
const { register, login, logout } = require('../controllers/authController'); // Now matches CommonJS
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
// /me route with logging (protected by authMiddleware)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;  // Set by authMiddleware (from JWT)
    if (!user) {
      console.error('User not found in /me route');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`User ${user.userId} accessed /me route`); // Log userId (from JWT)
    res.json({
      email: user.email,  // Wait—your JWT only has { userId }, so fetch full user here if needed
      profileImage: user.profileImage,
      credits: user.credits,
      creditsExpiry: user.creditsExpiry
    });
  } catch (err) {
    console.error('Error in /me route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
