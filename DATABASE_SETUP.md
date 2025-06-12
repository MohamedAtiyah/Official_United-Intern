# Database Setup Instructions

## Prerequisites
- MySQL Server installed and running
- MySQL command line client or MySQL Workbench

## Setup Steps

1. **Start MySQL Service**
   Make sure your MySQL server is running.

2. **Run the Database Setup Script**
   Execute the `database_setup.sql` file using one of these methods:

   **Method 1: Using MySQL Command Line**
   ```bash
   mysql -u root -p < database_setup.sql
   ```

   **Method 2: Using MySQL Workbench**
   - Open MySQL Workbench
   - Connect to your MySQL server
   - Open the `database_setup.sql` file
   - Execute the script

3. **Verify Database Configuration**
   Check that your `config/db.js` file has the correct database credentials:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root', // your MySQL username
     password: 'admin', // your MySQL password
     database: 'united_internship',
     // ... other settings
   });
   ```

4. **Test the Connection**
   Start the server and check the console for "MySQL connection successful!" message:
   ```bash
   npm start
   ```

## Database Structure

The setup script creates:
- Database: `united_internship`
- Table: `internships` with the following columns:
  - `id` (Primary Key, Auto Increment)
  - `title` (VARCHAR 255, NOT NULL)
  - `location` (VARCHAR 255, NOT NULL)
  - `duration` (VARCHAR 100, NOT NULL)
  - `type` (VARCHAR 50, NOT NULL)
  - `status` (VARCHAR 20, DEFAULT 'Active')
  - `applications` (INT, DEFAULT 0)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

## Sample Data

The script includes 5 sample internships for testing:
- Software Development Intern (Sydney, NSW)
- Marketing Intern (Melbourne, VIC)
- Data Analysis Intern (Brisbane, QLD)
- UX/UI Design Intern (Perth, WA)
- Business Development Intern (Adelaide, SA)

## Features Implemented

1. **Managing Internships Page**: 
   - View Function removed as requested
   - Add, Edit, and Delete functionality
   - Real-time data loading from database

2. **View Internships Page**:
   - Displays all internships in card format
   - Filter by status (Active/Closed)
   - Search functionality
   - View applications placeholder

3. **Company-Based Dashboard**:
   - Dashboard displays actual company name from registration
   - Dynamic loading of company information
   - Account settings page to update company details

4. **Database Integration**:
   - Full CRUD operations
   - Proper error handling
   - Connection testing on server start
   - Company registration and authentication
   - Separate tables for users, companies, and internships

## Testing the Application

1. **Set up the database** using the SQL script
2. **Start the server**: `node server.js`
3. **Test login**: Visit `admin/test_login.html` 
   - Use credentials: admin@company.com / admin123
4. **View dashboard**: After login, the dashboard will show "Welcome, United Internship Solutions"
5. **Manage internships**: Add, edit, or delete internships
6. **View internships**: See all internships in card format
7. **Update account**: Modify company name and location in Account Settings

## API Endpoints

- `POST /api/auth/company/register` - Register a new company
- `POST /api/auth/company/login` - Company login
- `GET /api/company/info` - Get company information for dashboard
- `GET /api/account` - Get account details for settings page
- `PUT /api/account` - Update company account information
- `GET /api/internships` - Get all internships
- `POST /api/internships` - Add new internship
- `PUT /api/internships/:id` - Update internship
- `DELETE /api/internships/:id` - Delete internship 