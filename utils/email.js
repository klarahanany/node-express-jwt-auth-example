const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, verificationToken) => {
  console.log("Send email");
  // 1) Create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD
  //   }
  // });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aff.markssh@gmail.com',
      pass: 'zcdaufonyexxotnw'

    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: '',
    to: email,
    subject: 'Account Verification',
    text: `Click the following link to verify your account: http://localhost:3001/verify/${verificationToken}`,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });

};

module.exports = sendVerificationEmail;
