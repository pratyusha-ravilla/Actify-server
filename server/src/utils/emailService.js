


//server/src/utils/emailService.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});




export const sendEmail = async (to, subject, html) => {

  await transporter.sendMail({
    from: `"Actify System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });

};