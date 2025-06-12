const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.use(express.json());

// Get all available internships for students
router.get('/api/student/internships', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, c.company_name,
        (SELECT COUNT(*) FROM applications a WHERE a.internship_id = i.id) as application_count
      FROM internships i 
      JOIN companies c ON i.company_id = c.id
      WHERE i.status = 'Active'
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching internships:', err);
    res.status(500).json({ message: 'Failed to fetch internships.' });
  }
});

// Get student's applications
router.get('/api/student/:studentId/applications', async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await db.query(`
      SELECT a.*, i.title, c.company_name, i.location, i.duration, i.type
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      JOIN companies c ON i.company_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.applied_date DESC
    `, [studentId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

// Apply for an internship
router.post('/api/student/apply', async (req, res) => {
  try {
    const { studentId, internshipId } = req.body;
    
    if (!studentId || !internshipId) {
      return res.status(400).json({ message: 'Student ID and Internship ID are required.' });
    }
    
    // Check if student already applied for this internship
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE student_id = ? AND internship_id = ?',
      [studentId, internshipId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this internship.' });
    }
    
    // Check if internship exists and is active
    const [internship] = await db.query(
      'SELECT id, status FROM internships WHERE id = ?',
      [internshipId]
    );
    
    if (internship.length === 0) {
      return res.status(404).json({ message: 'Internship not found.' });
    }
    
    if (internship[0].status !== 'Active') {
      return res.status(400).json({ message: 'This internship is no longer accepting applications.' });
    }
    
    // Create application
    await db.query(
      'INSERT INTO applications (student_id, internship_id, status) VALUES (?, ?, ?)',
      [studentId, internshipId, 'pending']
    );
    
    // Update application count in internships table
    await db.query(
      'UPDATE internships SET applications = applications + 1 WHERE id = ?',
      [internshipId]
    );
    
    res.json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error('Error applying for internship:', err);
    res.status(500).json({ message: 'Failed to submit application.' });
  }
});

// Withdraw application (completely delete it so student can reapply)
router.delete('/api/student/application/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { studentId } = req.body;
    
    // Check if application exists and belongs to student
    const [application] = await db.query(
      'SELECT * FROM applications WHERE id = ? AND student_id = ?',
      [applicationId, studentId]
    );
    
    if (application.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    
    // Only allow withdrawal of pending applications
    if (application[0].status !== 'pending') {
      return res.status(400).json({ message: 'Can only withdraw pending applications.' });
    }
    
    // Completely delete the application record
    await db.query(
      'DELETE FROM applications WHERE id = ?',
      [applicationId]
    );
    
    // Update application count in internships table
    await db.query(
      'UPDATE internships SET applications = applications - 1 WHERE id = ?',
      [application[0].internship_id]
    );
    
    res.json({ message: 'Application withdrawn successfully!' });
  } catch (err) {
    console.error('Error withdrawing application:', err);
    res.status(500).json({ message: 'Failed to withdraw application.' });
  }
});

// Check if student has applied for specific internship
router.get('/api/student/:studentId/application-status/:internshipId', async (req, res) => {
  try {
    const { studentId, internshipId } = req.params;
    const [application] = await db.query(
      'SELECT status FROM applications WHERE student_id = ? AND internship_id = ?',
      [studentId, internshipId]
    );
    
    if (application.length > 0) {
      res.json({ hasApplied: true, status: application[0].status });
    } else {
      res.json({ hasApplied: false, status: null });
    }
  } catch (err) {
    console.error('Error checking application status:', err);
    res.status(500).json({ message: 'Failed to check application status.' });
  }
});

module.exports = router; 