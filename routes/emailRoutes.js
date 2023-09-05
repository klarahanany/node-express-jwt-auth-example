


router.post('/forgotPass', authController.forgetPass_post)
router.get('/resetPass/:id/:token', authController.resetPassword_get)
router.post('/resetPass/:id/:token', authController.resetPassword_post)