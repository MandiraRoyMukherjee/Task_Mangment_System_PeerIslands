import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import TaskCard from "./TaskCard";
import { getTasks } from "../api/taskapi";

export default function TaskList({ onMarkDone, onEditTask }) {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({
    status: "",
    priority: "",
    dueToday: false,
  });

  async function fetchTasks() {
    try {
      const res = await getTasks();
      setTasks(res.data || res); // Handle both response structures
    } catch (err) {
      console.error("Error fetching tasks:", err);
      alert("Failed to fetch tasks: " + (err.response?.data?.error || err.message));
    }
  }

  useEffect(() => {
    fetchTasks();
    const onCreated = () => fetchTasks();
    const onUpdated = () => fetchTasks();
    window.addEventListener("taskCreated", onCreated);
    window.addEventListener("taskUpdated", onUpdated);
    return () => {
      window.removeEventListener("taskCreated", onCreated);
      window.removeEventListener("taskUpdated", onUpdated);
    };
  }, []);

  const filtered = tasks.filter(t => {
    // Only show non-completed tasks in the main list
    if (t.status === "Done") return false;
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.dueToday) {
      const d = t.due_date ? new Date(t.due_date).toDateString() : null;
      if (d !== new Date().toDateString()) return false;
    }
    return true;
  });

  return (
    <div className="task-list" style={{padding: "20px"}}>
      <h2 style={{color: "#333", marginBottom: "20px"}}>Your Tasks ({filtered.length})</h2>
      <div style={{
        display: "flex", 
        gap: "12px", 
        marginBottom: "20px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <select 
          onChange={e=>setFilter({...filter,status:e.target.value})} 
          value={filter.status}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        >
          <option value="">All Status</option>
          <option>To Do</option><option>In Progress</option><option>Done</option>
        </select>
        <select 
          onChange={e=>setFilter({...filter,priority:e.target.value})} 
          value={filter.priority}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "14px"
          }}
        >
          <option value="">All Priority</option>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
        <label style={{display: "flex", alignItems: "center", gap: "4px", fontSize: "14px"}}>
          <input 
            type="checkbox" 
            checked={filter.dueToday} 
            onChange={e=>setFilter({...filter,dueToday:e.target.checked})} 
          /> 
          Due today
        </label>
        <button 
          onClick={fetchTasks}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Refresh
        </button>
      </div>
      
      {tasks.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          fontSize: "16px"
        }}>
          No tasks yet. Create your first task above!
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          fontSize: "16px"
        }}>
          No tasks match your current filters.
        </div>
      ) : (
        <div>
          {filtered.map(t => <TaskCard key={t.id} task={t} onUpdated={fetchTasks} onMarkDone={onMarkDone} onEdit={onEditTask} />)}
        </div>
      )}
    </div>
  );
}
