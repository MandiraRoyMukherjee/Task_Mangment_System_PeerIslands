import React, { useCallback } from "react";

export default function OptimizedTaskCard({ task, onMarkDone, onDelete, onEdit, loading }) {
  const handleMarkDone = useCallback(() => {
    onMarkDone(task);
  }, [task, onMarkDone]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(task);
  }, [task, onEdit]);

  const isDisabled = loading.update || loading.delete;

  return (
    <div className="task-item" style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: "#f9f9f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      opacity: isDisabled ? 0.6 : 1
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
            disabled={isDisabled}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.6 : 1
            }}
          >
            Edit
          </button>
          
          {task.status !== "Done" && (
            <button 
              onClick={handleMarkDone}
              disabled={isDisabled}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.6 : 1
              }}
            >
              Done
            </button>
          )}
          
          <button 
            onClick={handleDelete}
            disabled={isDisabled}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.6 : 1
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
