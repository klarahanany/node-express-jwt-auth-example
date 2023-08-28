const {promisify}  = require('util')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const catchAsync =require('../utils/catchAsync')
const AppError = require("../utils/appError");

const usersOnly = catchAsync(  async (req, res, next) => {
    //1 getting token and check if it's there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split((' '))[1]
    }
    if (!token) {
        res.status(401).json({
            status: 'fail',
            message: 'Unauthorized!',
        });
        return next(new AppError('You are not logged in.', 401))
    }
// 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_CODE);

    // 3) Check if user still exists
    const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
})


//verifying the token for any route we choose to protect only for signed in users
const onlyForUsers = (req,res,next)=>{
    const token = req.cookies.jwt//get the token from cookie (if user is already signed)
    //check jwt exists and is verified
    if(token){
        jwt.verify(token,process.env.SECRET_CODE, (err, decodedToken)=>{
            if(err){//if we have token but not valid
                console.log(err.message)
                res.redirect('/login')
            }else{//is valid user
                console.log(decodedToken)
                next()
            }
        })
    }else{ //the user isn't logged in
        res.redirect('/loginError')
        res.status(400).end()
    }

}

//check current user
const currentUser =  (req,res,next) => {
    const token = req.cookies.jwt//get the token from cookie (if user is already signed)
    //check jwt exists and is verified
    if(token) {
        //verify the token and then u get decoded token on callback function which has in it
        //saved user id
        jwt.verify(token,process.env.SECRET_CODE, async (err, decodedToken) => {
            if (err) {//if we have token but not valid
                console.log(err.message)
                res.locals.user= null
                next()
            } else {//is valid user
                console.log(decodedToken)
                res.locals.user =await userModel.findById(decodedToken.id)
                next()
            }
        })
    }else{
        res.locals.user = null
        next()
    }
}

module.exports = {onlyForUsers, currentUser, usersOnly}