require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs/promises'); // File system module to read files
const path = require('path'); // Path module to handle file paths
// Use environment variable for users file path, fallback to default if not set
const usersFilePath = process.env.USERS_FILE_PATH || path.join(__dirname, 'data', 'users.json');

// Import validation functions
const {
    validateUsersData,
    validateUserForCreation,
    validateUserForUpdate,
    validateUserId,
    checkUserExists,
    checkEmailInUse
} = require('./utils/validations');

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

app.get('/users', async (req, res) => {
    try {
        const fileContent = await fs.readFile(usersFilePath, 'utf-8');
        const usersData = JSON.parse(fileContent);

        // Validate users data using validation function
        const validation = validateUsersData(usersData);
        if (!validation.isValid) {
            return res.status(validation.error === 'No users found' ? 404 : 500).json({ error: validation.error });
        }
    
        res.status(200).json(usersData);

    } catch (err) {
        return res.status(500).json({ error: 'Error reading users data' });
    }

});

app.post('/users', async (req, res) => {
    const { id, name, email, age } = req.body;

    // Validate user data for creation
    const validation = validateUserForCreation({ id, name, email, age });
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
    }

    // Read current users
    try {
        const fileContent = await fs.readFile(usersFilePath, 'utf-8');
        const usersData = JSON.parse(fileContent);
        
        // Check if user already exists
        const existsCheck = checkUserExists(usersData, id, email);
        if (existsCheck.exists) {
            return res.status(409).json({ error: existsCheck.error });
        }
    
        // Create new user
        const newUser = { id, name, email, age };
        usersData.push(newUser);
    
        // Save updated users
        await fs.writeFile(usersFilePath, JSON.stringify(usersData, null, 2), 'utf-8');
        res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (err) {
        return res.status(500).json({ error: 'Error reading users data' });
    }

});

app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, age } = req.body;

    // Validate update data
    const validation = validateUserForUpdate({ name, email, age });
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const fileContent = await fs.readFile(usersFilePath, 'utf-8');
        const usersData = JSON.parse(fileContent);

        // Find user by id
        const userIndex = usersData.findIndex(user => Number(user.id) === Number(userId));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        // Update fields if provided and valid
        if (name !== undefined) {
            usersData[userIndex].name = name;
        }
    
        if (email !== undefined) {
            // Check if new email is already in use by another user
            const emailCheck = checkEmailInUse(usersData, email, userIndex);
            if (emailCheck.exists) {
                return res.status(409).json({ error: emailCheck.error });
            }
            usersData[userIndex].email = email;
        }
    
        if (age !== undefined) {
            usersData[userIndex].age = age;
        }
    
        // Save updated users
        await fs.writeFile(usersFilePath, JSON.stringify(usersData, null, 2), 'utf-8');
        res.status(200).json({ message: 'User updated successfully', user: usersData[userIndex] });

    } catch (err) {
        return res.status(500).json({ error: 'Error reading users data' });
    }

});

app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    // Validate user ID
    const idValidation = validateUserId(userId);
    if (!idValidation.isValid) {
        return res.status(400).json({ error: idValidation.error });
    }

    try {
        const fileContent = await fs.readFile(usersFilePath, 'utf-8');
        const usersData = JSON.parse(fileContent);

        // Find user by id
        const userIndex = usersData.findIndex(user => Number(user.id) === Number(userId));

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Store user data before deletion for response
        const deletedUser = usersData[userIndex];

        // Remove user from array
        usersData.splice(userIndex, 1);

        // Save updated users array
        await fs.writeFile(usersFilePath, JSON.stringify(usersData, null, 2), 'utf-8');
        
        res.status(200).json({ 
            message: 'User deleted successfully', 
            deletedUser: {
                id: deletedUser.id,
                name: deletedUser.name,
                email: deletedUser.email
            }
        });

    } catch (err) {
        return res.status(500).json({ error: 'Error processing user deletion' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});