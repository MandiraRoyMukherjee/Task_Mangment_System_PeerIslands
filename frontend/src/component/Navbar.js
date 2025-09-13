import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="navbar">
      <div><strong>Task Manager</strong></div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Sign In</Link>
            <Link to="/register" style={{ marginLeft: 10 }}>Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}
