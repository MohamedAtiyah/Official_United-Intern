const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.use(express.json());

// Get all applications for a specific company's internships
router.get('/api/admin/applications/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.status,
        a.applied_date,
        a.updated_at,
        s.name as student_name,
        s.email as student_email,
        i.title as internship_title,
        i.id as internship_id,
        c.company_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN internships i ON a.internship_id = i.id
      JOIN companies c ON i.company_id = c.id
      WHERE i.company_id = ?
      ORDER BY a.applied_date DESC
    `, [companyId]);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

// Update application status (accept/reject)
router.put('/api/admin/application/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, companyId } = req.body;
    
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be accepted, rejected, or pending.' });
    }
    
    // Verify that the application belongs to an internship owned by this company
    const [application] = await db.query(`
      SELECT a.*, i.company_id 
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE a.id = ? AND i.company_id = ?
    `, [applicationId, companyId]);
    
    if (application.length === 0) {
      return res.status(404).json({ message: 'Application not found or access denied.' });
    }
    
    // Update the application status
    await db.query(
      'UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, applicationId]
    );
    
    res.json({ 
      message: `Application ${status} successfully!`,
      applicationId: applicationId,
      newStatus: status
    });
    
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ message: 'Failed to update application status.' });
  }
});

// Get application details
router.get('/api/admin/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { companyId } = req.query;
    
    const [rows] = await db.query(`
      SELECT 
        a.*,
        s.name as student_name,
        s.email as student_email,
        i.title as internship_title,
        i.description as internship_description,
        c.company_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN internships i ON a.internship_id = i.id
      JOIN companies c ON i.company_id = c.id
      WHERE a.id = ? AND i.company_id = ?
    `, [applicationId, companyId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Application not found or access denied.' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching application details:', err);
    res.status(500).json({ message: 'Failed to fetch application details.' });
  }
});

module.exports = router; 