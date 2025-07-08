require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Express.js API (v1)</h1>
    <p>This is a simple API built with Express.js.</p>
    <p>Running on port: ${PORT}</p>
`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});