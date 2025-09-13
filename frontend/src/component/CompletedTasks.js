import React, { useState, useEffect } from "react";
import { getTasks } from "../api/taskapi";

export default function CompletedTasks({ completedTasks, onMarkDone }) {
  const [fetchedCompletedTasks, setFetchedCompletedTasks] = useState([]);

  // Fetch completed tasks from backend
  useEffect(() => {
    async function fetchCompletedTasks() {
      try {
        const res = await getTasks();
        const allTasks = res.data || res;
        // Filter only completed tasks
        const completed = allTasks.filter(task => task.status === "Done");
        setFetchedCompletedTasks(completed);
      } catch (err) {
        console.error("Error fetching completed tasks:", err);
      }
    }
    
    fetchCompletedTasks();
    
    // Listen for task updates
    const onUpdated = () => fetchCompletedTasks();
    window.addEventListener("taskUpdated", onUpdated);
    window.addEventListener("taskCreated", onUpdated);
    
    return () => {
      window.removeEventListener("taskUpdated", onUpdated);
      window.removeEventListener("taskCreated", onUpdated);
    };
  }, []);

  // Combine fetched tasks with locally added tasks (for immediate UI updates)
  // Remove duplicates by using task ID as key
  const allCompletedTasks = [...fetchedCompletedTasks];
  completedTasks.forEach(localTask => {
    if (!allCompletedTasks.find(task => task.id === localTask.id)) {
      allCompletedTasks.push(localTask);
    }
  });
  
  if (allCompletedTasks.length === 0) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        color: "#666",
        fontSize: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef"
      }}>
        No completed tasks yet
      </div>
    );
  }

  return (
    <div style={{padding: "20px"}}>
      <h2 style={{color: "#333", marginBottom: "20px", fontSize: "24px"}}>
        ✅ Completed Tasks ({allCompletedTasks.length})
      </h2>
      
      <div style={{
        display: "grid",
        gap: "12px",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
      }}>
        {allCompletedTasks.map(task => (
          <div 
            key={task.id} 
            style={{
              border: "1px solid #28a745",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#d4edda",
              borderLeft: "4px solid #28a745"
            }}
          >
            <div style={{marginBottom: "8px"}}>
              <strong style={{fontSize: "16px", color: "#155724"}}>
                {task.title}
              </strong>
            </div>
            
            {task.description && (
              <div style={{
                fontSize: "14px", 
                color: "#155724", 
                marginBottom: "8px",
                fontStyle: "italic"
              }}>
                {task.description}
              </div>
            )}
            
            <div style={{
              fontSize: "12px", 
              color: "#155724",
              marginBottom: "12px"
            }}>
              <div>Completed: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Recently"}</div>
              {task.category && <div>Category: {task.category}</div>}
              {task.is_recurring === 1 && <div>🔄 Was Recurring</div>}
            </div>
            
            <div style={{display: "flex", justifyContent: "flex-end"}}>
              <div style={{
                padding: "6px 12px",
                fontSize: "12px",
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "4px",
                fontWeight: "bold"
              }}>
                ✓ Done
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
