const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // adjust path
const { register, login, logout } = require('../controllers/authController');


router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Add this /me route here:
// in authRoutes.js
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // If there's no user object, log the issue
    if (!user) {
      console.error("Error: User object not found. User is undefined.");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User ${user.email} fetched successfully.`);  // Log the success

    res.json({
      email: user.email,
      profileImage: user.profileImage,
      credits: user.credits,
      creditsExpiry: user.creditsExpiry
    });
  } catch (err) {
    // Log any unexpected errors
    console.error("Error fetching user details:", err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
