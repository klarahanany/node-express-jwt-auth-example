const nodemailer = require('nodemailer');
const {company_Exist,paraseCompanyName} = require('./authController')
const {switchDB, getDBModel} = require("../multiDatabaseHandler");
const userSchema = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt  = require('bcrypt')
const forgetPass_post = async (req, res) => {
    const email = req.body.email;
    const companyName =  paraseCompanyName(email);
    //check if company is defined
    if(!(await company_Exist(companyName))) return res.status(404).json({
        errors: {
            status: `The company ${companyName} is not registered.`,
        },
    });
    req.companyName = companyName;
    //1)  Determine the tenant company database

    const companyDB = await switchDB(companyName,'employee', userSchema)
    //2) point to users collections in companyDB
    const userModel= await getDBModel(companyDB,'employee',userSchema)
    console.log('forgotpass: '+ email)
    try {
        const oldUser = await userModel.findOne({ email })
        if (!oldUser) {
            res.json({ status: "User Not Exists!!" })
        }
        const secret = process.env.SECRET_CODE

        // const secret = process.env.SECRET_CODE + oldUser.password
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: '5m' });
        const link = `http://localhost:3001/resetPass/${oldUser._id}/${token}`
        console.log(link)

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'aff.markssh@gmail.com',
                pass: 'zcdaufonyexxotnw'

            }
        });

        var mailOptions = {
            from: 'lart0242@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: link
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    catch (err) {
        console.log(err)
    }
}
const resetPassword_get = async (req, res) => {
    const { id, token } = req.params
    const companyName =  paraseCompanyName(token.companyName);
    //check if company is defined
    if(!(await company_Exist(companyName))) return res.status(404).json({
        errors: {
            status: `The company ${companyName} is not registered.`,
        },
    });

    const companyDB = await switchDB(companyName,'employee', userSchema)
    //2) point to users collections in companyDB
    const userModel= await getDBModel(companyDB,'employee',userSchema)
    const oldUser = await userModel.findOne({ _id: id })
    if (!oldUser) {
        res.json({ status: "User Not Exists!!" })
    }
    const secret = process.env.SECRET_CODE
    try {
        const verify = jwt.verify(token, secret)
        res.render("resetPass", { email: verify.email, status: "not verified" })
    }
    catch (err) {
        res.send("not verified")
    }

    // res.send(req.params)

}
const resetPassword_post = async (req, res) => {
    const { id, token } = req.params
    const { password, confirmpassword } = req.body

    const companyName =  paraseCompanyName(token.companyName);
    //check if company is defined
    if(!(await company_Exist(companyName))) return res.status(404).json({
        errors: {
            status: `The company ${companyName} is not registered.`,
        },
    });

    const companyDB = await switchDB(companyName,'employee', userSchema)
    //2) point to users collections in companyDB
    const userModel= await getDBModel(companyDB,'employee',userSchema)


    const oldUser = await userModel.findOne({ _id: id })
    if (!oldUser) {
        res.json({ status: "User Not Exists!!" })
    }
    const secret = process.env.SECRET_CODE
    try {
        const verify = jwt.verify(token, secret)
        if (password === confirmpassword) {
            const encryptedPass = await bcrypt.hash(password, 10)
            await userModel.updateOne({
                    _id: id
                },
                {
                    $set: {
                        password: encryptedPass
                    },

                })
            //change admin pass in mainDB too
            const mainDB = await switchDB('MainDB','admins', userSchema)
            //2) point to users collections in companyDB
            const userModel= await getDBModel(mainDB,'admins',userSchema)
            await userModel.updateOne({
                    _id: id
                },
                {
                    $set: {
                        password: encryptedPass
                    },

                })
            res.render("resetPass", { email: verify.email, status: "verified" })
        }
        else{
            res.render("resetPass", { email: verify.email, status: "error" })
        }
        // res.json({status :"verified"})

    }
    catch (err) {
        res.json({ status: "Not Verified" })
    }

    // res.send(req.params)

}

module.exports = {forgetPass_post,resetPassword_post,resetPassword_get}
