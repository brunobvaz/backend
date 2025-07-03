const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/authController');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', auth, controller.me);
//router.post('/activate', controller.activate);
router.post('/resend-activation', controller.resendActivation);
// routes/auth.js
router.get('/activate', controller.activateWithRedirect);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);


module.exports = router;
