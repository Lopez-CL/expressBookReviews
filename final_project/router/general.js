const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username.trim() || !password.trim()){
    return res.status(400).json({message: 'Issue with login credentials!'})
  }
  const userExists = users.some(user => user.username === username);
  if(userExists){
    return res.status(409).json({message: 'username already exisits!'})
  }
  try{
    users.push({username,password})
    return res.status(201).json({message:`${username} added to the registered users`,registeredUsers: users})
  }catch(err){
    return res.status(500).json({err, message:"Registration Failed"})
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const booksData = books
  return res.status(200).json(booksData);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let {isbn} = req.params
  const bookByIsbn = books[isbn]
  if(!bookByIsbn){
    return res.status(404).json({message: "No book by that isbn!"})
  }
  return res.status(200).json(bookByIsbn);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let {author} = req.params;
  // author = author.replaceAll("-", " ")
  let  bookByAuthor;
    for(let isbn in books){
      if(books[isbn].author.toLowerCase() === author.toLowerCase()){
        bookByAuthor = books[isbn];}
    }
    if(!bookByAuthor){return res.status(404).json({message:"No book by that author!"})}
    return res.status(200).json(bookByAuthor);
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const {title} = req.params;
  for(let isbn in books){
    if(books[isbn].title.toLowerCase() === title.toLowerCase()){
      return res.status(200).json(books[isbn]);
    }
  }
  return res.status(404).json({message: "Unable to locate book by title"})
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const {isbn} = req.params;
  let bookByIsbn = books[isbn];
  if(bookByIsbn){
    return res.status(200).json(bookByIsbn.reviews);
  }else{
    return res.status(404).json({message: `Could not find book by ${isbn} as isbn`})
  }
});

module.exports.general = public_users;
