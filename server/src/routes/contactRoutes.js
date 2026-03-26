import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ✅ Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,   // your gmail
        pass: process.env.EMAIL_PASS,   // app password
      },
    });

    // ✅ Mail content
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER, // your Actify email
      subject: "New Contact Message - Actify",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.log("EMAIL ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;