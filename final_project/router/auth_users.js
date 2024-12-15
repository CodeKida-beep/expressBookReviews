const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];  // Store users in-memory for now

// Helper function to check if username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Helper function to authenticate a user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Route for user login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, "secretkey", { expiresIn: '1h' });

    // Store token in session
    req.session.accessToken = token;

    return res.status(200).json({ message: "Login successful", token });
});

// Route to add/update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username; // Assuming req.user is populated by middleware

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Route to delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // The username is taken from the session (req.user)
  
  // Check if the book exists
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }
  
  // Check if the review exists and if the current user is the one who posted it
  if (!books[isbn].reviews[username]) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
  }
  
  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
