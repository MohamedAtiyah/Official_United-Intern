const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.use(express.json());

// Get company account details by company ID
router.get('/api/account/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const [rows] = await db.query('SELECT id, company_name, email, location, description FROM companies WHERE id = ?', [companyId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Company not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching company account:', err);
    res.status(500).json({ message: 'Failed to fetch company account.' });
  }
});

// Update company account details
router.put('/api/account/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { companyName, location, description } = req.body;
    await db.query(
      'UPDATE companies SET company_name = ?, location = ?, description = ? WHERE id = ?',
      [companyName, location, description, companyId]
    );
    res.json({ message: 'Account updated successfully!' });
  } catch (err) {
    console.error('Error updating company account:', err);
    res.status(500).json({ message: 'Failed to update company account.' });
  }
});

module.exports = router;
