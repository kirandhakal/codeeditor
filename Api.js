const express = require("express");
const app = express();
const body = require("body-parser");
const compiler = require("compilex");


app.use(body.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

const options = { stats: true };
compiler.init(options);

// Root route to serve index.html
app.get("/", function (req, res) {
    compiler.flush(() => console.log("Compiler resources cleared."));
    res.sendFile(__dirname + "/public/index.html");
});

// Compilation logic remains the same...
app.post("/compile", function (req, res) {
    const { code, input, lang } = req.body;

    // Compilation logic...
    
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
        } else if (lang === "HTML" || lang === "Css" || lang === "JavaScript") {
            // For HTML, CSS, and JS, just return the code back
            res.send({ output: code });
            console.log("html");
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