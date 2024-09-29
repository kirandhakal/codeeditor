const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err));

const app = express();

// Define a schema and model for the data
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model('User', UserSchema);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Use method-override to allow DELETE in forms
app.use(methodOverride('_method'));

// Fetch data from the database and send it to the table view
app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch data from MongoDB
    res.render('users', { users });  // Render the data in an EJS template
  } catch (err) {
    res.status(500).send('Error fetching data from the database.');
  }
});

// Handle DELETE request to remove a user
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id); // Delete the user by ID
    res.redirect('/users');  // Redirect back to the users page
  } catch (err) {
    res.status(500).send('Error deleting user from the database.');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
