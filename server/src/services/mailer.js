// require('dotenv').config();
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use the email service provider (e.g., 'gmail' for Gmail)
  auth: {
    // user: 'rajesh.truematrix@gmail.com', // Your email address
    user: 'packwolf2024@gmail.com', // Your email address
    // pass: 'ssdr txqp zclh deqx' // Your email password or application-specific password
    pass: 'gbjk zfzj gonj ibtw' // Your email password or application-specific password
  }
});
 
const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    const mailOptions = {
      // from: 'rajesh.truematrix@gmail.com', // Sender address
      from: '"True Chat" <info@truematrix.ai>', // Sender address
      to: to, // Recipient address
      subject: subject, // Subject line
      html: html // Plain text body
    };    
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error(error.message);
      }
      console.log('Email sent: ' + info.response);
    });
  } catch (error) {
    console.log(error);
  }
};
 
export const sendMailerService = async (args) => {
  if (!process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};
