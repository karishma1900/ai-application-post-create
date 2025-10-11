const express = require('express'); // Import Express
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); // Assuming you have an auth route
const creditRoutes = require('./routes/credit'); // Assuming you have a credit route
const requestRoutes = require('./routes/request'); // Assuming you have a request route

const app = express(); // Define app here

// Trust proxy for Render (Handles HTTPS for you)
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://ai-application-post-create-1.onrender.com']  // Your frontend URL
  : ['http://localhost:3000'];  // Local dev (add more if needed)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,  // Essential for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Cookie parser (must be before routes)
app.use(cookieParser());

// Raw body for Stripe webhook
app.use('/api/credit/webhook', express.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/request', requestRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
