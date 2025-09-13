import React, { useState } from "react";
import API from "../api/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handle(e) {
    e.preventDefault();
    try {
      await API.post("/auth/register", { name, email, password });
      alert("Registered. Please sign in.");
      window.location = "/";
    } catch (err) {
      alert(err.response?.data?.error || "Register failed");
    }
  }

  return (
    <form onSubmit={handle}>
      <h2>Create account</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <button>Create account</button>
      <p style={{ textAlign: "center", marginTop: 12 }}>
        Already have an account? <a href="/">Sign in</a>
      </p>
    </form>
  );
}
