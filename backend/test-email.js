// Test email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure email transport
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself for testing
  subject: "🧪 Test Email from Task Management System",
  text: `Hello! This is a test email from your Task Management System.

If you receive this email, your email configuration is working correctly! ✅

Time: ${new Date().toLocaleString()}

---
Task Management System`
};

console.log('📧 Sending test email...');
console.log('From:', process.env.EMAIL_USER);
console.log('To:', process.env.EMAIL_USER);

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error("❌ Error sending email:", err.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Enabled 2-Factor Authentication on Gmail');
    console.log('2. Generated an App Password');
    console.log('3. Used the App Password (not regular password) in .env file');
  } else {
    console.log("✅ Test email sent successfully!");
    console.log("📧 Check your inbox for the test email");
  }
});
