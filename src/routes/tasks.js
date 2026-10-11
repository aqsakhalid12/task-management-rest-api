
const express = require('express');
const pool = require('../db');

const router = express.Router();

// CREATE task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, due_date, project_id, user_id } = req.body;

    if (!title || !user_id) {
      return res.status(400).json({
        error: 'Title and user_id are required'
      });
    }

    const taskStatus = status || 'pending';

    if (!['pending', 'completed'].includes(taskStatus)) {
      return res.status(400).json({
        error: 'Status must be pending or completed'
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, status, due_date, project_id, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        description || null,
        taskStatus,
        due_date || null,
        project_id || null,
        user_id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// READ all tasks with JOIN

router.get('/', async (req, res) => {
  try {
    const { status, search, project_id } = req.query;

    let query = `
      SELECT
        tasks.*,
        users.name AS assigned_user,
        projects.name AS project_name
      FROM tasks
      JOIN users ON tasks.user_id = users.id
      LEFT JOIN projects ON tasks.project_id = projects.id
      WHERE 1=1
    `;

    const values = [];

    if (status) {
      values.push(status);
      query += ` AND tasks.status = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND tasks.title ILIKE $${values.length}`;
    }

    if (project_id) {
      values.push(project_id);
      query += ` AND tasks.project_id = $${values.length}`;
    }

    const allowedSort = ['id', 'title', 'due_date', 'created_at'];
const sortBy = allowedSort.includes(req.query.sortBy)
  ? req.query.sortBy
  : 'id';

const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

const page = Math.max(1, parseInt(req.query.page) || 1);
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 5));
const offset = (page - 1) * limit;

query += ` ORDER BY tasks.${sortBy} ${order}`;
query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

values.push(limit, offset);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


// READ one task
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, due_date, project_id } = req.body;

    if (!title || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({
        error: 'Title and valid status (pending/completed) are required'
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3,
           due_date = $4, project_id = $5
       WHERE id = $6
       RETURNING *`,
      [
        title,
        description || null,
        status,
        due_date || null,
        project_id || null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
