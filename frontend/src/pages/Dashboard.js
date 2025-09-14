import React, { useContext, useState, useEffect } from "react";
import TaskForm from "../component/TaskForm";
import TaskList from "../component/TaskList";
import CompletedTasks from "../component/CompletedTasks";
import Notifications from "../component/Notification";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    setCompletedTasks([]);
  }, []);

  const handleMarkDone = (task) => {

    setCompletedTasks(prev => [task, ...prev]);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleEditComplete = () => {
    setEditingTask(null);
  };

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
          <TaskForm 
            onMarkDone={handleMarkDone}
            editingTask={editingTask}
            onEditComplete={handleEditComplete}
          />
        </div>
        <div style={{
          flex: "1",
          minWidth: "0"
        }}>
          <TaskList onMarkDone={handleMarkDone} onEditTask={handleEditTask} />
        </div>
      </div>
      
      {/* Completed Tasks Section */}
      <div style={{
        maxWidth: "1400px",
        margin: "20px auto 0",
        padding: "0 20px"
      }}>
        <CompletedTasks 
          completedTasks={completedTasks}
          onMarkDone={handleMarkDone}
        />
      </div>
    </div>
  );
}
