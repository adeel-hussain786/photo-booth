import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Email route
app.post("/send", async (req, res) => {
  const { name, email, phone, eventType, date, guests, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL, // safer than using user email
      to: process.env.EMAIL,
      subject: "New Inquiry - Memorify",

      text: `
New Booking Inquiry

Name: ${name}
Email: ${email}
Phone: ${phone}

Event Type: ${eventType}
Event Date: ${date}
Guests: ${guests}

Message:
${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error sending email" });
  }
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});