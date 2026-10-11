
require('dotenv').config();

const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
const auth = require('./middleware/auth');

app.use('/api/projects', auth, require('./routes/projects'));
app.use('/api/tasks', auth, require('./routes/tasks'));

app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'PostgreSQL connected successfully!',
      time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;


app.get('/api/dashboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_tasks,
        COUNT(*) FILTER (
          WHERE status = 'pending'
          AND due_date < CURRENT_DATE
        ) AS overdue_tasks
      FROM tasks
    `);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics'
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
