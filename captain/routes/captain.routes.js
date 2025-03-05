const express = require('express');
const router = express.Router()
const captainController = require('../controllers/captain.controller')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register',captainController.register);
router.post('/login',captainController.login)
router.get('/logout',captainController.logout)
router.patch('/toggle-availability',authMiddleware.captainAuth,captainController.toggleAvailability)
router.get('/profile',authMiddleware.captainAuth,captainController.profile)

module.exports = router;