
const express = require('express');
const pool = require('../db');

const router = express.Router();

// CREATE project
router.post('/', async (req, res) => {
  try {
    const { name, description, user_id } = req.body;

    if (!name || !user_id) {
      return res.status(400).json({
        error: 'Project name and user_id are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// READ all projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT projects.*, users.name AS owner_name
       FROM projects
       JOIN users ON projects.user_id = users.id
       ORDER BY projects.id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// UPDATE project
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [name, description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
