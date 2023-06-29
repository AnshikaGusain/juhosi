const express = require('express');
const mysql = require('mysql2');
const ejs = require("ejs");
const app = express();
const port = process.env.PORT;
const dotenv = require("dotenv");
const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;
dotenv.config();

app.set("view engine", "ejs");
app.use(express());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const connection = mysql.createConnection({
  host: process.env.HOST,
  // port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Create a route for the login form
app.get('/', (req, res) => {
  res.render('login');
});

let user = {
  id: "",
  name: ""
};

app.post('/login', (req, res) => {
  const { username, password, newPassword, changePassword } = req.body;

  // Check if the "Change Password" button is clicked
  if (changePassword) {
    res.render('changePassword');
  }

  // Handle the login logic here
  // You can check the username and password against the database and validate the user
  // You can use the same MySQL connection object to perform the query

  // Example query (replace with your actual query):
  connection.query('SELECT * FROM User WHERE id = ? AND BINARY password = ?', [username, password], (err, results) => {
    if (err) {
      console.error('Error checking login:', err);
    } else {
      if (results.length > 0) {
        user = {
          id: results[0].id,
          name: results[0].name
        };
        // Successful login, redirect to the dashboard or another page
        res.render("orderForm", { result: results[0] });
      } else {
        // Invalid credentials, display an error message

        res.render('login', { msg: 'Invalid username or password' });
      }

    }
  });

});

app.post('/updatePassword', (req, res) => {
  const { mobileNo, newPassword, confirmPassword } = req.body;
  connection.query('SELECT * FROM User WHERE phone_number = ?', [mobileNo], (err, results) => {
    if (err) {
      return res.render('changePassword', { msg: "Error in checking mobile number" });
    }
    else {
      if (newPassword !== confirmPassword) {
        return res.render('changePassword', { msg: "Passwords do not match" });
      }
      if (results.length === 0) {
        return res.render('changePassword', { msg: "Mobile number does not exist" });
      }
      else {
        connection.query('UPDATE User SET password = ? WHERE phone_number = ?', [newPassword, mobileNo], (err, updateResults) => {
          if (err) {
            console.error('Error updating password:', err);
            return res.render('changePassword', { msg: 'Error updating password' });
          }

          return res.render('login', { msg: 'Password updated successfully' });
        });
      }
    }
  });
})


app.post('/submitOrder', (req, res) => {
  const { orderDate, count, item, weight, requests } = req.body;
  // let orderDateTime=orderDate+time;
  let prodId, orderId;
  connection.query('SELECT id FROM ProductInfo WHERE species=?', [item], (err, r1) => {
    if (err) {
      res.render('orderForm', { msg: "Item does not exists" });
    }
    else {
      prodId = r1[0].id;
      connection.query(`SELECT id FROM ${process.env.DATABASE}.Order WHERE user_id=?`, [user.id], (err, r2) => {
        if (err) {
          res.render('orderForm', { msg: 'Order does not exist', result: user });
        }
        else {
          orderId = r2[0].id;
          connection.query('INSERT INTO OrderItem(orderDate,package,request_weight,productId,order_id) VALUES (?, ?,?,?,?)', [orderDate, item, weight, prodId, orderId], (err, results) => {
            if (err) {
              console.error('Error placing order:', err);
              res.render('orderForm', { msg: 'Error placing order', result: user });
            } else {
              res.render('orderForm', { msg: 'Order placed successfully', result: user });
            }

          });
        }

      })
    }

  })
});



app.get('/view-order-details', (req, res) => {
  connection.query(`SELECT id FROM ${process.env.DATABASE}.Order WHERE user_id = ?`, [user.id], (err, results) => {
    if (err) {
      console.error('Error retrieving order details:', err);
      res.render('orderForm', { msg: 'Error retrieving order details' });
    } else {
      connection.query("SELECT * FROM OrderItem WHERE order_id=?", [results[0].id], (err, orderDetails) => {
        res.render("orderDetails", { orderDetails, user });
      })
    }
  });
});


const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

app.get('/download-details', (req, res) => {
  connection.query(`SELECT id FROM ${process.env.DATABASE}.Order WHERE user_id = ?`, [user.id], (err, results) => {
    if (err) {
      console.error('Error retrieving order details:', err);
      res.render('orderForm', { msg: 'Error retrieving order details' });
    } else {
      let detail = {
        orderDate: "",
        userId: "",
        userName: "",
        package: "",
        request_weight: ""
      };
      let details = [];
      connection.query("SELECT * FROM OrderItem WHERE order_id=?", [results[0].id], (err, orderDetails) => {
        orderDetails.forEach(element => {
          detail = {
            orderDate: element.orderDate,
            userId: user.id,
            userName: user.name,
            package: element.package,
            request_weight: element.request_weight
          };
          details.push(detail);

          const csvData = json2csv(details);

          const filename = `order_details_${Date.now()}.csv`;
          const filePath = path.join(downloadsDir, filename);

          fs.writeFile(filePath, csvData, 'utf8', (err) => {
            if (err) {
              console.error('Error writing CSV file:', err);
              res.status(500).send('Error exporting order details');
            } else {
              res.download(filePath, filename, (err) => {
                // if (err) {
                //   console.error('Error sending file:', err);
                //   res.status(500).send('Error exporting order details');
                // }
    
                // Remove the file after it's downloaded
                fs.unlink(filePath, (err) => {
                  // if (err) {
                  //   console.error('Error removing file:', err);
                  // }
                });
              });
            }
          });

        });
      })
      
    }
  });
  // downloadLink.click();
})



app.listen(port || 3001, () => {
  console.log(`Server is running on port ${port}`);
});
