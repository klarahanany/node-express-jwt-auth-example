const express = require('express')
const router = express.Router()
const { Request, Response, NextFunction } = require('express');

const authController = require('../controllers/authController')
const {switchDB, getDBModel} = require("../multiDatabaseHandler");
const userSchema = require("../models/userModel");

router.get('/', (req,res)=> res.send('Home pageeeeeeeee'))
router.get('/login', authController.login_get)

//Subdirectory Routes (Based on company names)
router.post('/login', authController.login_post)


module.exports = router