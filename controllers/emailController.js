const nodemailer = require('nodemailer');

const forgetPass_post = async (req, res) => {
    const email = req.body.email;
    console.log(email)
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
    }
}
const resetPassword_get = async (req, res) => {
    const { id, token } = req.params
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
    console.log(password)
    console.log(confirmpassword)

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
        }
        // res.json({status :"verified"})

        res.render("resetPass", { email: verify.email, status: "verified" })
    }
    catch (err) {
        res.json({ status: "Not Verified" })
    }

    // res.send(req.params)

}
