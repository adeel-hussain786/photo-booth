import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
console.log("ENV FILE CHECK:");
console.log("EMAIL:", process.env.EMAIL);
console.log("PASSWORD:", process.env.PASSWORD);
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Email route
app.post("/send", async (req, res) => {
  const { name, email, phone, eventType, date, guests, message } = req.body;

  try {
    // 🔥 transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // 🔥 mail content
    const mailOptions = {
      from: `"Memorify Website" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: "New Inquiry - Memorify",

      html: `
        <h2>New Booking Inquiry</h2>

        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>

        <hr/>

        <p><b>Event Type:</b> ${eventType}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Guests:</b> ${guests}</p>

        <hr/>

        <p><b>Message:</b><br/> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });

  } catch (error) {
    console.log("EMAIL ERROR:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

// ✅ server start
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});