const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const creditRoutes = require('./routes/creditRoutes');
const requestRoutes = require('./routes/requestRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// ✅ CORS Setup
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Cookie Parser
app.use(cookieParser());

// ✅ Webhook route (Stripe)
app.use(
  '/api/credit/webhook',
  express.raw({ type: 'application/json' })
);

// ✅ JSON Parser for other routes
app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI);

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/request', requestRoutes);

// ✅ Serve React build (AFTER API routes)
app.use(express.static(path.join(__dirname, 'client/build')));

// Change here: use '/*' instead of '*'
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on', PORT));
