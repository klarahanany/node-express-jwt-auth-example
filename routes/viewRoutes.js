const express = require('express');

const authMiddware = require('../middleware/authMiddware');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authMiddware.isLoggedIn);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);

module.exports = router;
