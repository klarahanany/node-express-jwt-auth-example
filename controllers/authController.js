require('dotenv').config();
const Roles = require('../models/Roles')
const userSchema = require('../models/userModel.js')
const bcrypt  = require('bcrypt')
const jwt = require('jsonwebtoken')
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync')
const mongoose = require("mongoose");
const mongoose2 =require('../server')
const {onSignupNewDatabase,switchDB,getDBModel} = require('../multiDatabaseHandler')
const {sendVerificationEmail} = require("./emailController");
// handle errors


const handleErrors = (err) => {


    console.log(err)

    let errors = { username : '' ,email: '', password: '' };

    //incorrect email
    if(err === 'incorrect username' ){
        errors.username = 'that username is not registered'
    }

    //incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'that mail is not registered'
    }
    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }


    // validation errors
    else if (err === 'user validation failed') {
        // console.log(err);
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(val);
            // console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}
const signup_get = (req,res) =>{
    res.render('signup')
}
const login_get = (req,res) =>{ //to display the UI
    res.render('login')
}
const createCookie = (token, res)=>{
    const cookieOptions = {
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly : true,
        secure :false,

    }
      if(process.env.NODE_ENV === 'production') cookieOptions.secure =true;
    res.cookie('jwt', token, cookieOptions);
}

const signup_post = async (req, res) => {
    const { username, password, email, firstName, lastName, passwordConfirm,companyName,phoneNumber } = req.body;
    //const role = Roles.viewer;

//1) swtichDB to AppTenant
    const mainDB = await switchDB('MainDB','admins', userSchema)
    //2) create new admin user in AppTenant
   const adminModel= await getDBModel(mainDB,'admins',userSchema)
    try {
       //check if the username and mail is already exist
        const existingEmailUser = await adminModel.findOne({ email: email });
        const existingUsernameUser = await adminModel.findOne({ username: username });
        const existingCompanyName = await adminModel.findOne({ companyName });
        if (existingEmailUser && existingUsernameUser) {
            return res.status(400).json({
                errors: {
                    email: 'Email already exists',
                    username: 'Username already exists'
                },
            });
        }

        if (existingEmailUser) {
            return res.status(400).json({
                errors: {
                    email: 'Email already exists',
                },
            });
        }


        if (existingUsernameUser) {
            return res.status(400).json({
                errors: {
                    username: 'Username already exists',
                },
            });
        }
        if (existingCompanyName) {
            return res.status(400).json({
                errors: {
                    username: 'This company already exists',
                },
            });
        }
        // const user = await userModel.create({
        //     firstName,
        //     lastName,
        //     username,
        //     email,
        //     password,
        //     passwordConfirm,
        // });

         onSignupNewDatabase(adminModel, userSchema, {
            firstName,
            lastName,
            username,
            password,
            passwordConfirm,
            email,
            companyName,
            phoneNumber,
        }).then((result) => {

            const  { status ,id} = result;
            if(!status)  return res.status(400).json({  message: `failed to make new database for ${companyName}` });

            const token = createToken(id,email,'admin',firstName,lastName,username,companyName);

            //sending the token as a cookie to frontend
            createCookie(token, res);
             sendVerificationEmail(email,token);
            //   res.status(201).json({ user: user._id, token: token }); // send back to frontend as json body
             res.status(201).json({  message: 'Verification email sent successfully' });
            console.log(`${username} created`);
        })
            .catch((error) => {
                console.error(error);
            });

    } catch (e) {
        const error = handleErrors(e);
        res.status(400).json({ error });
    }
};
 const paraseCompanyName = (email)=>{
     const domain = email.match(/@(.+)\.com$/);
     //amdocs
     //amdocs.mustafa
     if (domain && domain.length > 1) {
         const companyName = domain[1];
         console.log(companyName);
         return companyName
     } else {
         console.log("Invalid email address");
     }
}

const paraseCompanyNameFromUsername = (username) => {
    const domain = username.split(".");
    //amdocs.mustafa
    if (domain && domain.length > 1) {
        const companyName = domain[0];
        return companyName
    } else {
        console.log("Invalid username");
    }
}

const company_Exist= async(companyName)=>{

    const MainDB = await switchDB('MainDB','admins', userSchema)
    const adminsModel= await getDBModel(MainDB,'admins',userSchema)
    return await adminsModel.findOne({companyName})
}


const login_post = async (req, res, next) => {
    const password = req.body.password
    const username = req.body.username
    const email = req.body.email
    var companyName = "";
    var usernameOrEmail = ""
    if (email != null) {
        companyName = paraseCompanyName(email)
        usernameOrEmail = email
    }
    else if (username != null) {
        companyName = paraseCompanyNameFromUsername(username)
        usernameOrEmail = username
    }
    try {
        //check if company is defined
        if (!(await company_Exist(companyName))) {
            console.log(`The company ${companyName} is not registered.`)

            return res.status(404).json({
                errors: {
                    status: `The company ${companyName} is not registered.`,
                },
            });
        }

        req.companyName = companyName;
        //1)  Determine the tenant company database

        const companyDB = await switchDB(companyName, 'employee', userSchema)
        //2) point to users collections in companyDB
        const userModel = await getDBModel(companyDB, 'employee', userSchema)
        let user
        //check if email or password or username exist in input
        if (usernameOrEmail && !password) return next(new AppError('Please provide email and password!', 400))
        //check if the input was email or username
        if (email != null) {
            user = await userModel.findOne({ email }).select('+password')

        }
        else if (username != null) {
            user = await userModel.findOne({ username }).select('+password')

        }
        console.log('user: ' + user)
        if (!user) {
            return res.status(401).json({
                errors: {
                    status: 'Invalid credentials',
                },
            });
        }
        //if user exists in database
        const auth = await bcrypt.compare(password, user.password)
        console.log(auth)

        if (!user || !auth) {
            return res.status(401).json({
                errors: {
                    status: 'Incorrect email or password',
                },
            });
        } else { //if user exists in db
            //if password is correct after comparing
            const token = createToken(user._id, user.email, user.role, user.firstName, user.lastName, user.username, user.companyName)
            //sending the token as a cookie to frontend
            createCookie(token, res)
            res.status(201).json({
                user: {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    passwordChangedAt: user.passwordChangedAt,
                    company: companyName,

                },
                status: 'success',
            }) // send back to frontend as json body
        }
    } catch (e) {
        const error = handleErrors(e)
        res.status(400).json({ error })
    }

}



const changePassword_post = async (req, res, next) => {
    console.log(req.body)
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    const username = req.body.username
    if (oldPassword == null || newPassword == null) {
        res.status(401).json({
            success: flase,
        })
    }
    try {
        var companyName = paraseCompanyNameFromUsername(username)
        const companyDB = await switchDB(companyName, 'employee', userSchema)
        //2) point to users collections in companyDB
        const userModel = await getDBModel(companyDB, 'employee', userSchema)
        let user
        if (username != null) {
            user = await userModel.findOne({ username }).select('+password')
        }
        //if user exists in database
        const auth = await bcrypt.compare(oldPassword, user.password)
        console.log(auth)
        if (!auth) {
            return res.json({
                status:"incorrect old password"
            });
        }
        else { //if user exists in db
            const encryptedPass = await bcrypt.hash(newPassword, 10)
            let today = new Date()
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            let myQuery = {_id : user.id};
            let newValue = { $set: {password: encryptedPass ,passwordChangedAt: formattedDate} };
            await userModel.updateOne(myQuery,newValue)
            res.status(201).json({
                user: {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    passwordChangedAt: user.passwordChangedAt,
                    company: companyName,

                },
                status: 'success',
            }) // send back to frontend as json body
        }
    } catch (e) {
        const error = handleErrors(e)
        res.status(400).json({ error })
    }
}

const createToken = (id,email, role,firstName,lastName,username,companyName)=>{
        //All data we want to save into the token
    return jwt.sign(
        {id, email, role,firstName,lastName,username,companyName},
        process.env.SECRET_CODE, {
        expiresIn: process.env.JWT_COOKIE_EXPIRES_IN
    })
}


const logout_get = async(req,res)=> {
        res.cookie('jwt','', {maxAge : 1}) //replace the current cookie with empty string
    res.redirect('/')

}
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        //console.log('restrictTo: '+ req.user.role)
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }

        next();
    };
};


module.exports = {
    signup_get,signup_post,
    login_post,login_get,logout_get,
    restrictTo,
    company_Exist, paraseCompanyName,changePassword_post}