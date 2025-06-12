const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.use(express.json());

// Get all internships for admin (with company information)
router.get('/api/internships', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, c.company_name 
      FROM internships i 
      JOIN companies c ON i.company_id = c.id 
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch internships.' });
  }
});

// Get internships for a specific company
router.get('/api/internships/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const [rows] = await db.query(`
      SELECT i.*, c.company_name 
      FROM internships i 
      JOIN companies c ON i.company_id = c.id 
      WHERE i.company_id = ?
      ORDER BY i.created_at DESC
    `, [companyId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch internships.' });
  }
});

// Add a new internship
router.post('/api/internships', async (req, res) => {
  const { title, location, duration, type, status, companyId, description, requirements } = req.body;
  if (!title || !location || !duration || !type || !companyId) {
    return res.status(400).json({ message: 'Title, location, duration, type, and company ID are required.' });
  }
  try {
    await db.query(
      'INSERT INTO internships (title, location, duration, type, status, company_id, description, requirements, applications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, location, duration, type, status || 'Active', companyId, description || '', requirements || '', 0]
    );
    res.status(201).json({ message: 'Internship added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add internship.' });
  }
});

// Edit an internship
router.put('/api/internships/:id', async (req, res) => {
  const { title, location, duration, type, status, description, requirements } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE internships SET title=?, location=?, duration=?, type=?, status=?, description=?, requirements=? WHERE id=?',
      [title, location, duration, type, status, description || '', requirements || '', id]
    );
    res.json({ message: 'Internship updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update internship.' });
  }
});

// Delete an internship
router.delete('/api/internships/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM internships WHERE id=?', [id]);
    res.json({ message: 'Internship deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete internship.' });
  }
});

module.exports = router; 