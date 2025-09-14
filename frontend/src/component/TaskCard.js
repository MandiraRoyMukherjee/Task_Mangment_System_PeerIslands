import React from "react";
import API from "../api/api";

export default function TaskCard({ task, onUpdated, onMarkDone, onEdit }) {
  async function markDone() {
    try {
      await API.put(`/tasks/${task.id}`, { status: "Done" });

      if (onMarkDone) {
        onMarkDone(task);
      }
      onUpdated();
    } catch (err) {
      alert("Update failed");
    }
  }
  
  async function remove(){
    if(!window.confirm("Delete task?")) return;
    try{ await API.delete(`/tasks/${task.id}`); onUpdated(); } catch(e){ alert("Delete failed") }
  }
  
  function handleEdit() {
    if (onEdit) {
      onEdit(task);
    }
  }

  return (
    <div className="task-item" style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      margin: "8px 0",
      backgroundColor: "#f9f9f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }}>
      <div style={{flex: 1}}>
        <strong style={{fontSize: "16px", color: "#333"}}>{task.title}</strong>
        {task.description && (
          <div style={{fontSize: "14px", color: "#666", margin: "4px 0"}}>
            {task.description}
          </div>
        )}
        <div style={{fontSize: "12px", color: "#888", margin: "4px 0"}}>
          <div>Due: {task.due_date ? new Date(task.due_date).toLocaleString() : "No due date"}</div>
          {task.category && <div>Category: {task.category}</div>}
          {task.is_recurring === 1 && <div>🔄 Recurring</div>}
        </div>
      </div>
      <div style={{textAlign: "right", marginLeft: "16px"}}>
        <div style={{
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: task.status === "Done" ? "#4CAF50" : 
                          task.status === "In Progress" ? "#FF9800" : "#2196F3",
          color: "white",
          marginBottom: "4px"
        }}>
          {task.status}
        </div>
        <div style={{
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "11px",
          backgroundColor: task.priority === "High" ? "#f44336" : 
                          task.priority === "Medium" ? "#ff9800" : "#4caf50",
          color: "white",
          marginBottom: "8px"
        }}>
          {task.priority}
        </div>
        <div style={{display: "flex", gap: "4px", flexWrap: "wrap"}}>
          <button 
            onClick={handleEdit}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Edit
          </button>
          {task.status !== "Done" && (
            <button 
              onClick={markDone}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Done
            </button>
          )}
          <button 
            onClick={remove}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
