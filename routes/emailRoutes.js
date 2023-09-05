const emailController = require('../controllers/emailController')
const express = require('express')
const router = express.Router()

router.post('/forgotPass', emailController.forgetPass_post)
router.get('/resetPass/:id/:token', emailController.resetPassword_get)
router.post('/resetPass/:id/:token', emailController.resetPassword_post)

module.exports = router