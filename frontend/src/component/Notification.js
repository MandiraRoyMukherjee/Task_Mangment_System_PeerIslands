import React, { useEffect, useState } from "react";
import API from "../api/api";
import dayjs from "dayjs";

export default function Notifications(){
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotes(){
    try {
      setLoading(true);
      console.log("🔍 Fetching notifications...");
      const res = await API.get("/notifications");
      console.log("📡 Notifications API response:", res.data);
      console.log("📡 Response status:", res.status);
      
      // Handle different response structures
      if (res.data && Array.isArray(res.data)) {
        console.log("✅ Using res.data directly, found", res.data.length, "notifications");
        setNotes(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        console.log("✅ Using res.data.data, found", res.data.data.length, "notifications");
        setNotes(res.data.data);
      } else {
        console.log("❌ Unexpected response structure:", res.data);
        console.log("❌ res.data type:", typeof res.data);
        console.log("❌ res.data isArray:", Array.isArray(res.data));
        setNotes([]);
      }
    } catch (err) {
      console.error("❌ Notifications fetch failed:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=> {
    fetchNotes();
    const iv = setInterval(fetchNotes, 30_000); // poll every 30 seconds for real-time updates
    return ()=>clearInterval(iv);
  },[]);

  const getNotificationStyle = (type) => {
    switch(type) {
      case 'overdue':
        return {
          background: '#ffebee',
          borderLeft: '4px solid #d32f2f',
          color: '#b71c1c',
          animation: 'pulse 2s infinite'
        };
      case 'urgent':
        return {
          background: '#ffebee',
          borderLeft: '4px solid #f44336',
          color: '#c62828'
        };
      case 'warning':
        return {
          background: '#fff3e0',
          borderLeft: '4px solid #ff9800',
          color: '#e65100'
        };
      default:
        return {
          background: '#e3f2fd',
          borderLeft: '4px solid #2196f3',
          color: '#1565c0'
        };
    }
  };

  const getTimeRemaining = (minutes) => {
    if (minutes <= 0) {
      // Task is overdue
      const overdueMinutes = Math.abs(minutes);
      if (overdueMinutes < 60) {
        return `Overdue by ${overdueMinutes} minutes`;
      } else {
        const overdueHours = Math.floor(overdueMinutes / 60);
        const remainingMinutes = overdueMinutes % 60;
        return `Overdue by ${overdueHours}h ${remainingMinutes}m`;
      }
    } else if (minutes <= 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <div style={{
      marginBottom: '20px',
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🔔 Notifications
        {Array.isArray(notes) && notes.length > 0 && (
          <span style={{
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {notes.length}
          </span>
        )}
      </h4>
      
      {loading ? (
        <div style={{ color: '#666', fontSize: '14px' }}>Loading notifications...</div>
      ) : !Array.isArray(notes) || notes.length === 0 ? (
        <div style={{ 
          color: '#666', 
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          ✅ No pending notifications
        </div>
      ) : (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {notes.map(n => (
            <div 
              key={n.id} 
              style={{
                ...getNotificationStyle(n.type),
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '4px',
                fontSize: '15px'
              }}>
                {n.message}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                📅 Due: {dayjs(n.due_date).format("MMM DD, YYYY [at] HH:mm")}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                ⏰ Time remaining: {getTimeRemaining(n.minutes_until_due)}
              </div>
              {n.priority && (
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  ⚡ Priority: {n.priority}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
