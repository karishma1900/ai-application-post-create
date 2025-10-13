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
  const user = req.user;
  res.json({
    email: user.email,
    profileImage: user.profileImage,
    credits: user.credits,
    creditsExpiry: user.creditsExpiry
  });
});



module.exports = router;
