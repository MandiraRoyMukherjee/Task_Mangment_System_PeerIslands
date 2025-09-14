import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import { createTask, updateTask } from "../api/taskapi";

export default function TaskForm({ onCreated, onMarkDone, editingTask, onEditComplete }) {
  const { user } = useContext(AuthContext);
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
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    if (editingTask) {
      setIsEditing(true);
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
      setIsEditing(false);
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
    }
  }, [editingTask]);

  const submit = async (e) => {
    e.preventDefault();
    try {
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

      console.log("Submitting task:", payload);
      
      if (isEditing && editingTask) {

        const response = await updateTask(editingTask.id, payload);
        console.log("Task update response:", response);
        alert("✅ Task updated successfully");
        
        if (onEditComplete) onEditComplete();
        window.dispatchEvent(new Event("taskUpdated"));
      } else {

        const response = await createTask(payload);
        console.log("Task creation response:", response);
        
    
        if (payload.status === "Done") {
          alert("✅ Task created and marked as completed!");
        } else {
          alert("✅ Task created successfully");
        }


        if (payload.status === "Done" && onMarkDone) {
      
          const createdTask = {
            id: response.data?.taskId || response.taskId,
            title: payload.title,
            description: payload.description || "",
            status: payload.status,
            priority: payload.priority,
            category: payload.category || "",
            start_date: payload.start_date,
            due_date: payload.due_date,
            is_recurring: payload.is_recurring,
            recurrence_pattern: payload.recurrence_pattern || ""
          };
          onMarkDone(createdTask);
        }

        if (onCreated) onCreated();
        window.dispatchEvent(new Event("taskCreated"));
      }


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
      setIsEditing(false);
    } catch (err) {
      console.error("Task operation error:", err);
      alert("❌ Operation failed: " + (err.response?.data?.error || err.message || "Unknown error"));
    }
  };

  return (
    <form onSubmit={submit} style={{
      backgroundColor: "#f9f9f9",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      maxWidth: "500px"
    }}>
      <h3 style={{color: "#333", marginBottom: "20px"}}>
        {isEditing ? "Edit Task" : "Create New Task"}
      </h3>
      
      <div style={{marginBottom: "16px"}}>
        <input
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
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
          onChange={e => setForm({...form, description: e.target.value})}
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
            onChange={e => setForm({...form, status: e.target.value})}
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
            onChange={e => setForm({...form, priority: e.target.value})}
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
          onChange={e => setForm({...form, category: e.target.value})}
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
            onChange={e => setForm({...form, start_date: e.target.value})}
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
            onChange={e => setForm({...form, due_date: e.target.value})}
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
            onChange={e => setForm({...form, is_recurring: e.target.checked})} 
          />
          Recurring Task
        </label>
        {form.is_recurring && (
          <select 
            value={form.recurrence_pattern} 
            onChange={e => setForm({...form, recurrence_pattern: e.target.value})}
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
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: isEditing ? "#2196F3" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {isEditing ? "Update Task" : "Create Task"}
        </button>
        {isEditing && (
          <button 
            type="button"
            onClick={() => {
              setIsEditing(false);
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
              if (onEditComplete) onEditComplete();
            }}
            style={{
              padding: "12px 24px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
