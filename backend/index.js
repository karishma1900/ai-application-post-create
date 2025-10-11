const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');  // <-- import cors here

const creditRoutes = require('./routes/creditRoutes');
const requestRoutes = require('./routes/requestRoutes');
const authRoutes = require('./routes/authRoutes');
// In authRoutes.js

const router = express.Router();
const authMiddleware = require('./middlewares/authMiddleware');
const User = require('./models/User');




// router.get('/me', authMiddleware, async (req, res) => {
//   const user = req.user;
//   res.json({ email: user.email });
// });





const app = express();
app.set('trust proxy', true); 
// Use CORS middleware globally

app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-application-post-create-1.onrender.com/'],
  credentials: true
}));


// For Stripe webhook you need raw body, so you may do conditional
app.use(
  '/api/credit/webhook',
  express.raw({ type: 'application/json' })
);
// index.js or app.js
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// For other routes use JSON parser
app.use(bodyParser.json());

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/request', requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on', PORT));
module.exports = router;
