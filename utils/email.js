const nodemailer = require('nodemailer');

const sendVerificationEmail = (email, verificationToken) =>{
    console.log("Send email");
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '',
            pass: '',
        },
    });

    const mailOptions = {
        from: '',
        to: email,
        subject: 'Account Verification',
        text: `Click the following link to verify your account: http://localhost:3001/verify/${verificationToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendVerificationEmail;