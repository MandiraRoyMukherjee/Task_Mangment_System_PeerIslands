import React, { useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { setAuthToken } from "../api/api";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handle(e) {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data;
      login(user, token);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <form onSubmit={handle}>
      <h2>Sign In</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <button>Sign In</button>
      <p style={{ textAlign: "center", marginTop: 12 }}>
        Don't have an account? <a href="/register">Sign up</a>
      </p>
    </form>
  );
}
