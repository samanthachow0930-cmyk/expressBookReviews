const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop (Task 1)
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get the book list available in the shop (Task 10)
public_users.get('/',function (req, res) {
    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books && Object.keys(books).length > 0) {
                resolve(books);
            } else {
                reject(new Error("No books available"));
            }
        }, 100);
    })
    .then(booksData => {
        res.status(200).json(booksData);
    })
    .catch(error => {
        res.status(404).json({message: error.message});
    });
});

// Get book details based on ISBN (Task 2)
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (isbn < 1 || isbn > 10){
        return res.status(404).json({ 
            message: 'No books found. Please input correct isbn.',
        });
    }
    res.send(books[isbn]);
});

// Get book details based on ISBN (Task 11)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    new Promise((resolve, reject) => {
        // Async simulation
        setImmediate(() => {
            const num_isbn = parseInt(isbn);
            
            if (books[num_isbn]) {
                resolve(books[num_isbn]);
            } else {
                reject(new Error("Book not found"));
            }
        });
    })
    .then(book => {
        res.json(book);
    })
    .catch(error => {
        res.status(404).json({ 
            message: error.message,
            available_isbns: Object.keys(books).join(', ')
        });
    });
});
  
// Get book details based on author (Task 3)
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    
    const filtered_authors = Object.values(books).filter((book) => 
        book.author && book.author.toLowerCase().trim() === author.toLowerCase().trim()
    );
    
    if (filtered_authors.length === 0) {
        return res.status(404).json({ 
            message: 'No books found for this author',
            author: author 
        });
    }
    
    res.send(filtered_authors);
});

// Get book details based on author (Task 12)
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    new Promise((resolve, reject) => {
        setImmediate(() => {
            const filtered_books = Object.values(books).filter((book) => 
                book.author && book.author.toLowerCase().trim() === author.toLowerCase().trim()
            );
            
            if (filtered_books.length > 0) {
                resolve(filtered_books);
            } else {
                reject(new Error("No books found for this author"));
            }
        });
    })
    .then(books => {
        res.json({
            author: author,
            books: books
        });
    })
    .catch(error => {
        res.status(404).json({ 
            message: error.message,
            author: author
        });
    });
});

// Get all books based on title (Task 4)
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    
    const filtered_titles = Object.values(books).filter((book) => 
        book.title && book.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    
    if (filtered_titles.length === 0) {
        return res.status(404).json({ 
            message: 'No books found for this title',
            title: title
        });
    }
    
    res.send(filtered_titles);
});

// Get book details based on title - simplified version
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    new Promise((resolve, reject) => {
        setImmediate(() => {
            const filtered_books = Object.values(books).filter((book) => 
                book.title && book.title.toLowerCase().trim() === title.toLowerCase().trim()
            );
            
            if (filtered_books.length > 0) {
                resolve(filtered_books);
            } else {
                reject(new Error("No books found with this title"));
            }
        });
    })
    .then(books => {
        res.json({
            title: title,
            count: books.length,
            books: books
        });
    })
    .catch(error => {
        res.status(404).json({ 
            message: error.message,
            title: title
        });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (isbn < 1 || isbn > 10){
        return res.status(404).json({ 
            message: 'No books found. Please input correct isbn.',
        });
    }
    let book = books[isbn];
    res.send(book["reviews"]);
});

module.exports.general = public_users;
