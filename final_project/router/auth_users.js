const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
    const review = req.query.review;
    // Check if user is logged in
    if (!username) {
        return res.status(401).json({message: "User not logged in"});
    }
    // Check if review is provided
    if (!review) {
        return res.status(400).json({message: "Review is required"});
    }

    let book = books[isbn];
    if (book){
        let reviewSession = book["reviews"];
        // Check if this user already has a review for this book
        if (reviewSession[username]) {
            // Modify existing review
            reviewSession[username] = review;
            return res.send(`Review updated successfully for ISBN ${isbn}`);
        } else {
            // Add new review
            reviewSession[username] = review;
            return res.send(`Review added successfully for ISBN ${isbn}`);
        }
    }
    else{
        return res.status(404).send("Unable to find book!");
    }
    
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (!username) {
        return res.status(401).json({message: "User not logged in"});
    }
    if (!book) {
        return res.status(404).json({message: "Book not found"});
    }
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({message: "No review found for this user"});
    }
    delete book.reviews[username];
    return res.status(200).json({message: `Review by ${username} deleted successfully`});
    
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
