const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "taskuser",
  password: "taskpass",
  database: "taskdb",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error(" Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

module.exports = db;
