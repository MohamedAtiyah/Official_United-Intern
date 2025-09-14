## United Internship - Local Development

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.x running locally

### Database setup
1. Ensure MySQL is running on `localhost:3306`.
2. Default credentials used by the app are in `config/db.js`:
   - user: `root`
   - password: `admin`
   - database: `united_internship`
   Update these values in `config/db.js` if your local setup differs.
3. Create the database and import schema/data (optional but recommended):

```bash
mysql -u root -padmin -e "CREATE DATABASE IF NOT EXISTS united_internship;"
mysql -u root -padmin united_internship < database_setup.sql
```

### Install and run
```bash
npm install
npm start
```

The server will start on `http://localhost:3000`.

### Troubleshooting
- If you see "MySQL connection failed":
  - Verify MySQL is running and credentials in `config/db.js` match your local MySQL.
  - Ensure the `united_internship` database exists or import `database_setup.sql`.


