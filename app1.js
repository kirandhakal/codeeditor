const express = require("express");
const body = require("body-parser");
const compiler = require("compilex");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const methodOverride = require('method-override');

const app = express();
const options = { stats: true };

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Parse JSON and URL-encoded bodies (as sent by HTML forms)
app.use(body.json());
app.use(express.urlencoded({ extended: true }));

// Use method-override to allow DELETE in forms
app.use(methodOverride('_method'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/codeeditor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema for authentication and user listing
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema); // Use existing User collection

// Initialize the compiler
compiler.init(options);

// Root route to serve login page
app.get("/", function (req, res) {
    compiler.flush(() => console.log("Compiler resources cleared."));
    res.sendFile(__dirname + "/public/login.html");
});

// Signup route
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with hashed password
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        // Save the user in MongoDB
        const savedUser = await newUser.save();

        // Respond with the saved user data in JSON format
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email
                // We typically don't return the password in the response for security reasons
            }
        });
    } catch (error) {
        // Respond with error details in JSON format
        res.status(400).json({
            message: 'Error creating user',
            error: error.message
        });
    }
});


// Login route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username.trim() });
        if (!user) {
            return res.status(401).send('User not found');
        }
        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid password');
        }
        res.status(200).send({ message: 'Login successful' });
    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
});

// Compilation logic
app.post("/compile", function (req, res) {
    const { code, input, lang } = req.body;
    try {
        if (lang === "Cpp") {
            const envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
            if (!input) {
                compiler.compileCPP(envData, code, (data) => handleResponse(data, res));
            } else {
                compiler.compileCPPWithInput(envData, code, input, (data) => handleResponse(data, res));
            }
        } else if (lang === "Java") {
            const envData = { OS: "windows" };
            if (!input) {
                compiler.compileJava(envData, code, (data) => handleResponse(data, res));
            } else {
                compiler.compileJavaWithInput(envData, code, input, (data) => handleResponse(data, res));
            }
        } else if (lang === "Python") {
            const envData = { OS: "windows" };
            if (!input) {
                compiler.compilePython(envData, code, (data) => handleResponse(data, res));
            } else {
                compiler.compilePythonWithInput(envData, code, input, (data) => handleResponse(data, res));
            }
        } else if (lang === "c#") {
            const envData = { OS: "windows" };
            compiler.compileCS(envData, code, (data) => res.send(data));
        } else {
            res.status(400).send({ output: "Unsupported language" });
        }
    } catch (e) {
        console.error("Compilation error: ", e);
        res.status(500).send({ output: "Compilation failed: " + e.message });
    } finally {
        compiler.flush(() => console.log('Compiler resources cleared'));
    }
});

// Handle compiler response
function handleResponse(data, res) {
    if (data.error) {
        res.send({ output: data.error });
    } else {
        res.send({ output: data.output });
    }
}

// Display users from the existing User collection
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, email: 1 }); // Fetch users (only username and email) from MongoDB
        res.render('users', { users });  // Render the data in an EJS template
    } catch (err) {
        res.status(500).send('Error fetching data from the database.');
    }
});

// Handle DELETE request to remove a user from the existing User collection
app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id); // Delete the user by ID
        res.redirect('/users');  // Redirect back to the users page
    } catch (err) {
        res.status(500).send('Error deleting user from the database.');
    }
});

// Start the server on port 8000
app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});