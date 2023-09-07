const nodemailer = require('nodemailer');

const sendVerificationEmail = (email, verificationToken) =>{
    console.log("Send email");
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'n8mabujamos@gmail.com',
            pass: 'kimimpeypunohrn',
        },
    });

    const mailOptions = {
        from: 'n8mabujamos@gmail.com',
        to: 'part2project2023@gmail.com',
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