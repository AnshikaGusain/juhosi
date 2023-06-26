const express = require('express');
const mysql = require('mysql2');
const ejs = require("ejs");
const app = express();
const port = 3000;
const dotenv=require("dotenv");
dotenv.config();

app.set("view engine", "ejs");
app.use(express());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create a MySQL connection
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

// Connect to the database
let user="";
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');
});

// Configure body parser middleware to parse the request body
// app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get("/", (req, res) => {
  res.render("login");
})

// Handle POST request to /login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  user=username;

  // Check the username and password from the database
  const sql = `SELECT * FROM auth WHERE id = ? AND password = ?`;
  connection.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Error executing the SQL query: ', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      // Invalid login credentials
      return res.status(401).send('Invalid username or password');
    }

    if (username === "admin") {
      // Admin login
      const fetchSql = `SELECT * FROM customer`;
      connection.query(fetchSql, (err, customerData) => {
        if (err) {
          console.error('Error retrieving data from the table: ', err);
          return res.status(500).send('Internal Server Error');
        }
        // Render the data as a table
        return res.render('admin.ejs', { customerData });
      });
    } 
    else if (username === 'customer1' || username === 'customer2') {
      // Customer login
      return res.render('orders.ejs');
    }
    else{
      // Invalid user role
      return res.status(401).send('Unauthorized');
    }

  });
});

// Handle POST request to /submitOrder endpoint
app.post('/submitOrder', (req, res) => {
  let customerId=user;
  const {orderDate, company, owner, item, quantity, weight, shipmentRequest, trackingId, shipmentSize, boxCount, specification, checklistQuantity } = req.body;

  // Insert the order into the customer table
  const sql = `INSERT INTO customer (customerId, orderDate, company, owner, item, quantity, weight, shipmentRequest, trackingId, shipmentSize, boxCount, specification, checklistQuantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [customerId, orderDate, company, owner, item, quantity, weight, shipmentRequest, trackingId, shipmentSize, boxCount, specification, checklistQuantity];
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into the table: ', err);
      return res.status(500).send('Internal Server Error');
    }

    // Order successfully inserted
    return res.status(200).send('Order submitted successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
