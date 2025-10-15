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
const allowedOrigins = ['http://localhost:3000', 'https://ai-application-post-create-1.onrender.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools like Postman

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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


// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on', PORT));




