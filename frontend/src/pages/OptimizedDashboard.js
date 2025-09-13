import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskContext";
import OptimizedTaskForm from "../component/OptimizedTaskForm";
import OptimizedTaskList from "../component/OptimizedTaskList";
import OptimizedCompletedTasks from "../component/OptimizedCompletedTasks";
import Notifications from "../component/Notification";

function DashboardContent() {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard" style={{
      padding: "20px",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        display: "flex",
        gap: "20px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        <div style={{
          flex: "0 0 500px",
          minWidth: "500px"
        }}>
          <h2 style={{
            color: "#333",
            marginBottom: "20px",
            fontSize: "28px"
          }}>
            Welcome, {user.name}! 👋
          </h2>
          <Notifications />
          <OptimizedTaskForm />
        </div>
        
        <div style={{
          flex: "1",
          minWidth: "0"
        }}>
          <OptimizedTaskList />
        </div>
      </div>
      
      {/* Completed Tasks Section */}
      <div style={{
        maxWidth: "1400px",
        margin: "20px auto 0",
        padding: "0 20px"
      }}>
        <OptimizedCompletedTasks />
      </div>
    </div>
  );
}

export default function OptimizedDashboard() {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
}
