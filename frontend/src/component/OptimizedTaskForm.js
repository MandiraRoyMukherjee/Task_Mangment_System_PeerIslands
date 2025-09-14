import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { useTaskOperations, useTaskEditing } from "../hooks/useTaskOperations";

export default function OptimizedTaskForm() {
  const { createTask, updateTask, loading, error } = useTaskOperations();
  const { editingTask, isEditing, stopEditing } = useTaskEditing();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    category: "",
    start_date: "",
    due_date: "",
    is_recurring: false,
    recurrence_pattern: ""
  });


  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "To Do",
        priority: editingTask.priority || "Medium",
        category: editingTask.category || "",
        start_date: editingTask.start_date ? dayjs(editingTask.start_date).format("YYYY-MM-DDTHH:mm") : "",
        due_date: editingTask.due_date ? dayjs(editingTask.due_date).format("YYYY-MM-DDTHH:mm") : "",
        is_recurring: editingTask.is_recurring === 1,
        recurrence_pattern: editingTask.recurrence_pattern || ""
      });
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = useCallback(() => {
    setForm({
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      category: "",
      start_date: "",
      due_date: "",
      is_recurring: false,
      recurrence_pattern: ""
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const payload = {
      ...form,
      start_date: form.start_date
        ? dayjs(form.start_date).format("YYYY-MM-DD HH:mm:ss")
        : null,
      due_date: form.due_date
        ? dayjs(form.due_date).format("YYYY-MM-DD HH:mm:ss")
        : null,
      is_recurring: form.is_recurring ? 1 : 0,
    };

    try {
      if (isEditing && editingTask) {
        await updateTask(editingTask.id, payload);
        alert("✅ Task updated successfully");
        stopEditing();
      } else {
        await createTask(payload);
        const message = payload.status === "Done" 
          ? "✅ Task created and marked as completed!"
          : "✅ Task created successfully";
        alert(message);
      }
      
      resetForm();
    } catch (err) {
      alert("❌ Operation failed: " + (err.message || "Unknown error"));
    }
  }, [form, isEditing, editingTask, createTask, updateTask, stopEditing, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
    stopEditing();
  }, [resetForm, stopEditing]);

  const handleInputChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: "#f9f9f9",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      maxWidth: "500px"
    }}>
      <h3 style={{color: "#333", marginBottom: "20px"}}>
        {isEditing ? "Edit Task" : "Create New Task"}
      </h3>
      
      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "16px"
        }}>
          {error}
        </div>
      )}
      
      <div style={{marginBottom: "16px"}}>
        <input
          placeholder="Task title"
          value={form.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
          disabled={loading.create || loading.update}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />
      </div>
      
      <div style={{marginBottom: "16px"}}>
        <textarea 
          placeholder="Description (optional)" 
          value={form.description} 
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={loading.create || loading.update}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "14px",
            minHeight: "80px",
            resize: "vertical",
            boxSizing: "border-box"
          }}
        />
      </div>
      
      <div style={{display: "flex", gap: "12px", marginBottom: "16px"}}>
        <div style={{flex: 1}}>
          <label style={{display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold"}}>Status</label>
          <select 
            value={form.status} 
            onChange={(e) => handleInputChange('status', e.target.value)}
            disabled={loading.create || loading.update}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: form.status === "Done" ? "2px solid #28a745" : "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: form.status === "Done" ? "#f8f9fa" : "white"
            }}
          >
            <option>To Do</option><option>In Progress</option><option>Done</option>
          </select>
          {form.status === "Done" && (
            <div style={{
              fontSize: "12px",
              color: "#28a745",
              marginTop: "4px",
              fontWeight: "bold"
            }}>
              ⚠️ This task will be created as completed
            </div>
          )}
        </div>
        <div style={{flex: 1}}>
          <label style={{display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold"}}>Priority</label>
          <select 
            value={form.priority} 
            onChange={(e) => handleInputChange('priority', e.target.value)}
            disabled={loading.create || loading.update}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px"
            }}
          >
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
      </div>
      
      <div style={{marginBottom: "16px"}}>
        <input 
          type="text" 
          placeholder="Category (Work, Personal, etc.)" 
          value={form.category} 
          onChange={(e) => handleInputChange('category', e.target.value)}
          disabled={loading.create || loading.update}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
        />
      </div>
      
      <div style={{display: "flex", gap: "12px", marginBottom: "16px"}}>
        <div style={{flex: 1}}>
          <label style={{display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold"}}>Start Date</label>
          <input 
            type="datetime-local" 
            value={form.start_date} 
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            disabled={loading.create || loading.update}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px"
            }}
          />
        </div>
        <div style={{flex: 1}}>
          <label style={{display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold"}}>Due Date</label>
          <input 
            type="datetime-local" 
            value={form.due_date} 
            onChange={(e) => handleInputChange('due_date', e.target.value)}
            disabled={loading.create || loading.update}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px"
            }}
          />
        </div>
      </div>
      
      <div style={{marginBottom: "16px"}}>
        <label style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "14px"}}>
          <input 
            type="checkbox" 
            checked={form.is_recurring} 
            onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
            disabled={loading.create || loading.update}
          />
          Recurring Task
        </label>
        {form.is_recurring && (
          <select 
            value={form.recurrence_pattern} 
            onChange={(e) => handleInputChange('recurrence_pattern', e.target.value)}
            disabled={loading.create || loading.update}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px",
              marginTop: "8px"
            }}
          >
            <option value="">Select recurrence pattern</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom:7d">Every 7 days</option>
          </select>
        )}
      </div>
      
      <div style={{display: "flex", gap: "12px"}}>
        <button 
          type="submit"
          disabled={loading.create || loading.update}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: isEditing ? "#2196F3" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading.create || loading.update ? "not-allowed" : "pointer",
            opacity: loading.create || loading.update ? 0.6 : 1
          }}
        >
          {loading.create || loading.update ? "Processing..." : (isEditing ? "Update Task" : "Create Task")}
        </button>
        {isEditing && (
          <button 
            type="button"
            onClick={handleCancel}
            disabled={loading.create || loading.update}
            style={{
              padding: "12px 24px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading.create || loading.update ? "not-allowed" : "pointer",
              opacity: loading.create || loading.update ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
