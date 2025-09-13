import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OptimizedDashboard from "./pages/OptimizedDashboard";
import Navbar from "./component/Navbar";

function Protected({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function OptimizedApp() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <OptimizedDashboard />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
