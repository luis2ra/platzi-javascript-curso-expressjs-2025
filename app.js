require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Express.js API (v1)</h1>
    <p>This is a simple API built with Express.js.</p>
    <p>Running on port: ${PORT}</p>
`);
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  res.send(`
    <h1>User Details</h1>
    <p>User ID: ${userId}</p>
    `);
});

app.get('/search', (req, res) => {
  const query = req.query.q;

  res.send(`
    <h1>Search Results</h1>
    <p>Search Query: ${query}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});