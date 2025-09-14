// backend/reminderJob.js
require('dotenv').config();
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const db = require("./config/db"); 


const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});


function sendReminder(email, task, timeLeft) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `⏰ Task Reminder: ${task.title} (Due in ${timeLeft})`,
    text: `Hi ${task.name || 'there'}! 👋

This is a reminder for your task:

📋 Task: ${task.title}
📅 Due Date: ${new Date(task.due_date).toLocaleString()}
⚡ Priority: ${task.priority}
📊 Status: ${task.status}
${task.description ? `📝 Description: ${task.description}` : ''}

⏰ This task is due in ${timeLeft}!

Don't forget to complete it on time ✅.

---
Task Management System`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Error sending email:", err);
    } else {
      console.log("📧 Reminder sent successfully to:", email);
    }
  });
}


cron.schedule("* * * * *", () => {
  console.log("⏰ Running reminder job...");

  const sql = `
    SELECT t.*, u.email, u.name
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.due_date IS NOT NULL 
    AND t.status != 'Done'
  `;

  db.query(sql, [], (err, results) => {
    if (err) return console.error("❌ DB error:", err);

    const now = new Date();
    console.log(`🔍 Checking ${results.length} tasks for reminders...`);

    results.forEach((task) => {
      const dueDate = new Date(task.due_date);
      const diffMs = dueDate - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffMinutes = diffMs / (1000 * 60);

      console.log(`📋 Task: ${task.title}, Due in: ${diffHours.toFixed(2)} hours (${diffMinutes.toFixed(0)} minutes)`);

      if (diffHours <= 25 && diffHours >= 23) {
        console.log(`📧 Sending 1-day reminder for: ${task.title}`);
        sendReminder(task.email, task, "1 day");
      }

      else if (diffMinutes <= 90 && diffMinutes >= 30) {
        console.log(`📧 Sending 1-hour reminder for: ${task.title}`);
        sendReminder(task.email, task, "1 hour");
      }
 
      else if (diffMinutes > 0 && diffMinutes < 30) {
        console.log(`⏰ Task "${task.title}" is due soon (${diffMinutes.toFixed(0)} min) but outside reminder window`);
      }
    });
  });
});
