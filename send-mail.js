const nodemailer = require("nodemailer");

async function sendMail(to, subject, content ) {
  if (!process.env.GMAIL_PASS) {
    console.error("Password missing!");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.GMAIL_USER}`,
    to,
    subject: subject,
    html: content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending mail:", err.message);
  }
}

module.exports = { sendMail };
