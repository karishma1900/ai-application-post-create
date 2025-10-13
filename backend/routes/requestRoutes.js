const express = require('express');
const { placeRequest } = require('../controllers/requestController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/place', authMiddleware, placeRequest);

module.exports = router;
