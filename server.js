// server.js

const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'A1B2C3d$',
  database: 'customerData'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Endpoint to fetch customer data with ID and JCNo
app.get('/customers', (req, res) => {
  connection.query('SELECT id, Name, Mobno, JCNo FROM customers', (error, results) => {
    if (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// Endpoint to save remarks
app.post('/saveRemarks', (req, res) => {
  const { customerId, remarks } = req.body;
  console.log('Received data for saving remarks:', { customerId, remarks }); // Log received data
  if (!customerId || !remarks) {
    res.status(400).json({ error: 'customerId and remarks are required' });
    return;
  }
  
  connection.query('UPDATE customers SET Remarks = ? WHERE id = ?', [remarks, customerId], (error, results) => {
    if (error) {
      console.error('Error saving remarks:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    console.log('Remarks saved successfully for customerId:', customerId); // Log success message
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
