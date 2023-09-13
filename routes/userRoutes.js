const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const  {verifyUser,isLoggedIn, isAdmin}= require('../middleware/authMiddware')

const router = express.Router();


// Protect all routes after this middleware
router.use(isLoggedIn);



router.route('/').
    get((req,res)=> {

    console.log('here')
    res.status(200).json({

        message: 'yes'
    })
} )

module.exports = router;
