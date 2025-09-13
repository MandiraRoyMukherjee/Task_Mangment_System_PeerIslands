const db = require("../config/db");

const User = {
  create: (name, email, password, callback) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password], callback);
  },
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], callback);
  },
  findById: (id, callback) => {
    const sql = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(sql, [id], callback);
  }
};

module.exports = User;
