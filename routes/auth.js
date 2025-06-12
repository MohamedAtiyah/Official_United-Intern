const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const router = express.Router();

router.use(express.json());

// Admin login route
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login attempt:', { email, password });
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find company by email
    const [companies] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);
    console.log('Found companies:', companies.length);
    
    if (companies.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials - company not found' });
    }
    
    const company = companies[0];
    console.log('Company found:', company.company_name);
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, company.password);
    console.log('Password match:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials - wrong password' });
    }
    
    console.log('Login successful for:', company.company_name);
    res.json({ 
      success: true, 
      message: 'Login successful',
      company: {
        id: company.id,
        name: company.company_name,
        email: company.email,
        location: company.location,
        description: company.description
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
});

// Admin signup route
router.post('/api/signup', async (req, res) => {
  try {
    const { companyName, email, password, location } = req.body;
    console.log('Admin signup attempt:', { companyName, email, location });
    
    if (!companyName || !email || !password || !location) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Check if company already exists
    const [existingCompany] = await db.query('SELECT id FROM companies WHERE email = ?', [email]);
    if (existingCompany.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new company
    await db.query('INSERT INTO companies (company_name, email, password, location) VALUES (?, ?, ?, ?)', 
      [companyName, email, hashedPassword, location]);
    
    console.log('Company registered successfully:', companyName);
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// Student registration
router.post('/api/student/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Check if student already exists
    const [existingStudent] = await db.query('SELECT id FROM students WHERE email = ?', [email]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new student
    await db.query('INSERT INTO students (name, email, password) VALUES (?, ?, ?)', 
      [name, email, hashedPassword]);
    
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Student login
router.post('/api/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find student by email
    const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
    if (students.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const student = students[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Organization registration
router.post('/api/auth/company/register', async (req, res) => {
  const { company_name, email, password, location } = req.body;
  if (!company_name || !email || !password || !location) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'organization']
    );
    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Organization login
router.post('/api/auth/company/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ? AND role = ?', [email, 'organization']);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.status(200).json({ message: 'Login successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

module.exports = router; 