const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');
const {signupLimiter, loginLimiter} = require('../utils/ratelimits');

router.post('/signup', signupLimiter, userCtrl.signup);
router.post('/login', loginLimiter, userCtrl.login);

module.exports = router;