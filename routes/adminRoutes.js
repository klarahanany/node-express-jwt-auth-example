const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authRoutes = require("./authRoutes");
const  {verifyUser,isLoggedIn, isAdmin}= require('../middleware/authMiddware')

router.use('/', authRoutes)

// Protect all routes after this middleware
router.use(isLoggedIn);


router.use(isAdmin)

router.route('/dashboard').
get((req,res)=> {

    res.status(200).json({

        message: 'admin dashboard'
    })
})

module.exports = router