require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs'); // File system module to read files
const path = require('path'); // Path module to handle file paths
// const users = require('./data/users.json'); // Importing users data from a JSON file
const usersFilePath = path.join(__dirname, 'data', 'users.json'); // Path to the users JSON file

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

app.post('/form', (req, res) => {
    const { name = 'Anonymous', email = 'no-email@example.com' } = req.body;

    res.status(201).json({
        message: 'Form Submission',
        name,
        email
    });
});

app.post('/api/data', (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json(
            { error: 'No data provided' }
        );
    }

    res.status(201).json({
        message: 'Data received successfully',
        data: data
    });
});

app.get('/users', (req, res) => {
    // Leer el archivo de usuarios en cada request para obtener la información más actualizada
    let usersData;

    try {
        const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
        usersData = JSON.parse(fileContent);
    } catch (err) {
        return res.status(500).json({ error: 'Error reading users data' });
    }

    if (!Array.isArray(usersData) || usersData.length === 0) {
        return res.status(404).json({ error: 'No users found' });
    }

    // Validar que cada usuario tenga las propiedades requeridas
    const requiredFields = ['id', 'name', 'email', 'age'];
    const invalidUsers = usersData.filter(
        user => !requiredFields.every(field => user[field] !== undefined && user[field] !== null)
    );

    if (invalidUsers.length > 0) {
        return res.status(500).json({ error: 'Invalid user data detected' });
    }

    res.status(200).json(usersData);
});

app.post('/users', (req, res) => {
    const { id, name, email, age } = req.body;

    // Validar campos requeridos
    if (!id || !name || !email || typeof age !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid fields. Required: id, name, email, age (number)' });
    }

    // Validar que name tenga al menos 2 caracteres
    if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    // Validar que age sea un número positivo
    if (typeof age !== 'number' || age <= 0) {
        return res.status(400).json({ error: 'Age must be a positive number' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Leer usuarios actuales
    let usersData;
    try {
        const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
        usersData = JSON.parse(fileContent);
    } catch (err) {
        return res.status(500).json({ error: 'Error reading users data' });
    }

    // Verificar si el usuario ya existe por id o email
    const exists = usersData.some(user => user.id === id || user.email === email);
    if (exists) {
        return res.status(409).json({ error: 'User with this id or email already exists' });
    }

    // Crear nuevo usuario
    const newUser = { id, name, email, age };
    usersData.push(newUser);

    // Guardar usuarios actualizados
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf-8');
    } catch (err) {
        return res.status(500).json({ error: 'Error saving user data' });
    }

    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});