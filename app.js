const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const serveFavicon = require('serve-favicon');

const app = express();

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'aman',
  database: 'appdb',
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.use(serveFavicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// Route to render index.ejs and fetch all quotes from the database
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM quotes';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.render('index', { quotes: results });
  });
});

// Route to render newquote.ejs and add a new quote to the database
app.get('/new', (req, res) => {
  res.render('newquote');
});

app.post('/new', (req, res) => {
  const { author, quote } = req.body;
  const sql = 'INSERT INTO quotes (author, quote) VALUES (?, ?)';
  connection.query(sql, [author, quote], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Route to render specific.ejs and fetch a specific quote from the database by ID
app.get('/quote/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM quotes WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.render('specific', { quote: result[0] });
  });
});


app.get('/specific/:id', (req, res) => {
    const quoteId = req.params.id;
    const sql = 'SELECT * FROM quotes WHERE id = ?';
    connection.query(sql, [quoteId], (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        res.status(404).send('Quote not found');
      } else {
        res.render('specific', { quote: results[0] });
      }
    });
  });


  app.get('/delete/:id', (req, res) => {
    const quoteId = req.params.id; // Get the quote ID from the URL parameter

    // Delete the quote from the database
    const sql = 'DELETE FROM quotes WHERE id = ?';
    connection.query(sql, [quoteId], (err, result) => {
      if (err) {
        console.error('Error deleting quote:', err);
        // Handle the error here, show an error page, or redirect to an error page
        return;
      }

      console.log('Quote deleted successfully.');
      // Redirect to the main page after deleting the quote
      res.redirect('/');
    });
  });


  app.get('/edit/:id', (req, res) => {
    const quoteId = req.params.id;
    const sql = 'SELECT * FROM quotes WHERE id = ?';
    connection.query(sql, [quoteId], (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        // Quote not found with the given id
        return res.redirect('/');
      }
      const quote = result[0];
      res.render('edit', { quote, quoteId });
    });
  });

  // Route to update the quote and author in the database
  app.post('/update/:id', (req, res) => {
    const quoteId = req.params.id;
    const { quote, author } = req.body;
    const sql = 'UPDATE quotes SET quote = ?, author = ? WHERE id = ?';
    connection.query(sql, [quote, author, quoteId], (err, result) => {
      if (err) throw err;
      res.redirect('/');
    });
  });

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
