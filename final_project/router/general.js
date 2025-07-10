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
public_users.get('/', (req, res) => {
    return Promise.resolve(books)
    .then(data => res.status(200).json({message: 'book retireval successful!', books: data}))
    .catch(err => res.status(500).json({err, message: 'Error in retriewing books'}))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let {isbn} = req.params
  const bookByIsbn = books[isbn]
  return Promise.resolve(books[isbn])
  .then(bookFound => {
    if(!bookFound) throw new Error("Book not found")
    return res.status(200).json(bookByIsbn)})
  .catch(err=> res.status(404).json({error: err.message}))
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let {author} = req.params;
  let  bookByAuthor;
    for(let isbn in books){
      if(books[isbn].author.toLowerCase() === author.toLowerCase()){
        bookByAuthor = books[isbn];}
    }
    return Promise.resolve(bookByAuthor)
    .then(book =>{
      if(!book) throw new Error(`No book by ${author}`)
      return res.status(200).json(book)
    })
    .catch(err => res.status(404).json({error: err.message}))
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const {title} = req.params;
  let bookByTitle
  for(let isbn in books){
    if(books[isbn].title.toLowerCase() === title.toLowerCase()){
      bookByTitle = books[isbn]
    }
  }
  return Promise.resolve(bookByTitle)
  .then(book =>{
    if(!book) throw new Error("No book by that title!")
      return res.status(200).json(book)
  })
  .catch(err=> res.status(404).json({error: err.message}))
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
