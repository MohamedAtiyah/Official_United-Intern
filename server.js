const express = require('express');
const path = require('path');
const app = express();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const internshipRoutes = require('./routes/internships');
const studentRoutes = require('./routes/students');

// Test MySQL connection
// This will run once when the server starts
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('MySQL connection successful!');
  } catch (err) {
    console.error('MySQL connection failed:', err);
  }
})();

app.use(express.json());
app.use(authRoutes);
app.use(internshipRoutes);
app.use(studentRoutes);

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve the home page as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home', 'home.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 