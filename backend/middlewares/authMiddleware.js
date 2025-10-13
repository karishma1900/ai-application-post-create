const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use process.env.ACCESS_TOKEN_SECRET here, as it verifies the Access Token
// You need to ensure this is available in the middleware file.
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

async function authMiddleware(req, res, next) {
    let token;
    
    // 1. Try to get token from Authorization header (Standard)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log("Token from Header:", token);
    } 
    // 2. Fallback: Try to get token from 'token' cookie (Your current setup logic, if you choose to use it)
    else if (req.cookies.token) {
        token = req.cookies.token;
        console.log("Token from 'token' cookie:", token);
    }
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        // Use the correct secret to verify the Access Token!
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET); 
        console.log("Decoded payload:", payload);

        // NOTE: Your payload uses userId, so check the secret used in authController
        const user = await User.findById(payload.userId).select('-passwordHash -__v'); // Exclude sensitive/unnecessary fields
        if (!user) throw new Error('User not found');

        req.user = user;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        // Be specific about why it failed for the client
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
}

module.exports = authMiddleware;
