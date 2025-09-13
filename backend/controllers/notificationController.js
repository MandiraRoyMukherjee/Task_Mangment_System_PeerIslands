const db = require('../config/db');

// Get notifications for current user (tasks due soon)
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    console.log(`🔍 Getting notifications for user ID: ${userId}`);
    console.log(`🕐 Current time: ${now.toISOString()}`);
    
    // Get tasks due within 1 hour (including overdue) for the current user
    const sql = `
      SELECT 
        id,
        title,
        description,
        due_date,
        priority,
        status,
        category,
        CASE 
          WHEN TIMESTAMPDIFF(MINUTE, NOW(), due_date) <= 0 THEN 'overdue'
          WHEN TIMESTAMPDIFF(MINUTE, NOW(), due_date) <= 60 THEN 'urgent'
          ELSE 'info'
        END as notification_type,
        TIMESTAMPDIFF(MINUTE, NOW(), due_date) as minutes_until_due
      FROM tasks 
      WHERE user_id = ? 
      AND due_date IS NOT NULL 
      AND status != 'Done'
      AND TIMESTAMPDIFF(MINUTE, NOW(), due_date) <= 60
      ORDER BY due_date ASC
    `;
    
    console.log(`📝 SQL Query: ${sql}`);
    console.log(`👤 User ID: ${userId}`);

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('❌ Error fetching notifications:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch notifications'
        });
      }

      console.log(`📊 Found ${results.length} tasks for notifications`);
      results.forEach(task => {
        console.log(`📋 Task: ${task.title}, Due: ${task.due_date}, Minutes: ${task.minutes_until_due}, Type: ${task.notification_type}`);
      });

      // Format notifications
      const notifications = results.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
        category: task.category,
        type: task.notification_type,
        minutes_until_due: task.minutes_until_due,
        message: getNotificationMessage(task)
      }));

      console.log(`📤 Sending ${notifications.length} notifications to frontend`);

      res.json({
        success: true,
        data: notifications
      });
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notifications'
    });
  }
};

// Generate notification message based on time remaining
function getNotificationMessage(task) {
  const minutes = task.minutes_until_due;

  if (minutes <= 0) {
    // Task is overdue
    const overdueMinutes = Math.abs(minutes);
    if (overdueMinutes < 60) {
      return `🚨 OVERDUE: "${task.title}" was due ${overdueMinutes} minutes ago!`;
    } else {
      const overdueHours = Math.floor(overdueMinutes / 60);
      const remainingMinutes = overdueMinutes % 60;
      return `🚨 OVERDUE: "${task.title}" was due ${overdueHours}h ${remainingMinutes}m ago!`;
    }
  } else if (minutes <= 60) {
    // Task is due within 1 hour
    return `⚠️ URGENT: "${task.title}" is due in ${minutes} minutes!`;
  }
  
  return `📋 "${task.title}" is due soon`;
}

module.exports = {
  getNotifications
};
