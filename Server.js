const express = require("express"); 
const compiler = require("compilex");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 

const app = express();
const options = { stats: true };

app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/codeeditor', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true }, // Fixed typo
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Serve static files from the "public" directory
app.use(express.static('public'));

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
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(400).send('Error creating user: ' + error.message);
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

// Start the server
app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});