var nodemailer = require('nodemailer');
var ademail= process.env['ademail'];
var pass= process.env['adpass'];
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ademail,
    pass: pass
  }
});

function resetPassword(body){
  const subject= 'Your password reset request for Maddogg Software'

  const flavor= `<!DOCTYPE html> <h4>Hello, <br><br> You have requested a password reset for your account. <br><br> Click the link below to reset your password.</h4> <br><br> <a href= 'https://maddoggsoftware.com/reset?code=${body._id}'> Click here to reset password </a> <br><br> <h4>If you did not request a password reset, please ignore this email.</h4> <br><br> <h4> Thank you, <br><br> Maddogg Software Team </h4>`

  var mailOptions = {
    from: ademail,
    to: body.email,
    subject: subject,
    html: flavor
  };
  
   transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  
}

function emailRegistrationCode(verification) {

  const subject= 'Welcome to Maddogg Software! Here is your Verfication Code, DO NOT REPLY';
  
  const flavor= `Hello, \n\n Thank you for registering with Maddogg Software. Your registration code is ${verification._id}. \n\n You will have 30 minutes to use this verification code before it expires. \n\n Or follow the link to https://maddoggsoftware.com/verify. \n\n If this message was sent in error please delete and ignore. \n\n Best regards, \n\n Maddogg Software`

  var mailOptions = {
    from: ademail,
    to: verification.email,
    subject: subject,
    text: flavor
  };

  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

module.exports= {emailRegistrationCode, resetPassword}