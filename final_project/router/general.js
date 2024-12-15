const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js"); // Assuming this exports an object of books
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get the list of all books
public_users.get('/', async (req, res) => {
    try {
        // Simulate an external API or fetch directly from `books`
        const response = await new Promise((resolve) => resolve({ data: books }));
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        // Simulate an external API call or fetch directly
        const response = await new Promise((resolve, reject) => {
            if (books[isbn]) resolve({ data: books[isbn] });
            else reject(new Error("Book not found"));
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Book not found", error: error.message });
    }
});

// Get books by author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        // Simulate an external API call or filter from local data
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        if (filteredBooks.length > 0) {
            res.status(200).json(filteredBooks);
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by author", error: error.message });
    }
});

// Get books by title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        if (filteredBooks.length > 0) {
            res.status(200).json(filteredBooks);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by title", error: error.message });
    }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = books[isbn];
        if (book && book.reviews) {
            res.status(200).json(book.reviews);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch book reviews", error: error.message });
    }
});

// Task 6: Register a new user
public_users.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
