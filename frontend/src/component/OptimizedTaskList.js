import React, { useCallback } from "react";
import { useTaskFiltering, useTaskOperations, useTaskEditing } from "../hooks/useTaskOperations";
import OptimizedTaskCard from "./OptimizedTaskCard";

export default function OptimizedTaskList() {
  const { filteredTasks, allTasks, setFilter, filters } = useTaskFiltering();
  const { deleteTask, markTaskDone, loading } = useTaskOperations();
  const { startEditing } = useTaskEditing();

  const handleMarkDone = useCallback(async (task) => {
    try {
      await markTaskDone(task);
    } catch (error) {
      alert("Failed to mark task as done: " + error.message);
    }
  }, [markTaskDone]);

  const handleDelete = useCallback(async (taskId) => {
    if (!window.confirm("Delete task?")) return;
    try {
      await deleteTask(taskId);
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  }, [deleteTask]);

  const handleEdit = useCallback((task) => {
    startEditing(task);
  }, [startEditing]);

  const handleFilterChange = useCallback((field, value) => {
    setFilter({ [field]: value });
  }, [setFilter]);

  if (loading.tasks) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="task-list" style={{padding: "20px"}}>
      <h2 style={{color: "#333", marginBottom: "20px"}}>
        Your Tasks ({filteredTasks.length})
      </h2>
      
      <div style={{
        display: "flex", 
        gap: "12px", 
        marginBottom: "20px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <select 
          onChange={(e) => handleFilterChange('status', e.target.value)} 
          value={filters.status}
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
          onChange={(e) => handleFilterChange('priority', e.target.value)} 
          value={filters.priority}
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
            checked={filters.dueToday} 
            onChange={(e) => handleFilterChange('dueToday', e.target.checked)} 
          /> 
          Due today
        </label>
      </div>
      
      {allTasks.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          fontSize: "16px"
        }}>
          No tasks yet. Create your first task above!
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          fontSize: "16px"
        }}>
          No tasks match your current filters.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
        }}>
          {filteredTasks.map(task => (
            <OptimizedTaskCard 
              key={task.id} 
              task={task} 
              onMarkDone={handleMarkDone}
              onDelete={handleDelete}
              onEdit={handleEdit}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
