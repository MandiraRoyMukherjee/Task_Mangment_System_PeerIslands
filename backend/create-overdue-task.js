// Create an overdue test task for user ID 1 (Mandira)
const db = require('./config/db');

console.log('🧪 Creating overdue test task for user ID 1...\n');

// Create a task that was due 30 minutes ago for user ID 1
const now = new Date();
const dueDate = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

const task = {
  title: 'Overdue Test Task',
  description: 'This task is overdue to test the notification system',
  status: 'To Do',
  priority: 'High',
  category: 'Test',
  due_date: dueDate.toISOString().slice(0, 19).replace('T', ' '),
  start_date: new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 1 hour ago
  user_id: 1
};

const sql = `
  INSERT INTO tasks (title, description, status, priority, category, due_date, start_date, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(sql, [
  task.title,
  task.description,
  task.status,
  task.priority,
  task.category,
  task.due_date,
  task.start_date,
  task.user_id
], (err, result) => {
  if (err) {
    console.error('❌ Error creating overdue test task:', err);
    return;
  }

  console.log('✅ Overdue test task created successfully!');
  console.log(`📋 Task ID: ${result.insertId}`);
  console.log(`📋 Title: ${task.title}`);
  console.log(`📋 Due Date: ${task.due_date}`);
  console.log(`👤 User ID: ${task.user_id}`);
  console.log(`⏰ Overdue by: 30 minutes`);
  
  console.log('\n🎯 Now check your frontend notifications!');
  console.log('You should see a red pulsing OVERDUE notification for this task.');
  
  process.exit(0);
});
