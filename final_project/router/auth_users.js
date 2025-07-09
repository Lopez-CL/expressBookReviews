const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const foundUser = users.some(user => username === user.username);
  if(!foundUser){throw new Error("User not found in records")}
  return foundUser;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const userAuthentic = users.filter(user =>
    (user.username === username && user.password === password))
    if(!userAuthentic){throw new Error("Issue with login credentials")}
    return userAuthentic.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  /* 1. validate user, 2. then authenticate to see if password and username match/authenticate, 3. save user session via JWT */
  const {username, password} = req.body;
  if(!username || !password){return res.status(404).json({message: "Issues with login credentials"})}
  if(isValid(username) || authenticatedUser(username,password)){
    let accessToken = jwt.sign({
      data: password}, 'access', {expiresIn: 6000 * 6000 * 2400})
    req.session.authorization = {accessToken, username}
      return res.status(200).json({message:'user successfully logged in!'})
    }else{
      res.status(401).json({message:"Invalid login. Issues with credentials"})
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.query.review;
  const {username} = req.session.authorization
  const {isbn} =req.params;
  let bookToReview = books[isbn];
  if(!review.trim() && !review){
    return res.status(401).json({message: "No review provided. Try again."})
  }
  if(!bookToReview.reviews[username]){
    bookToReview.reviews[username] = review;
    return res.status(200).json({message: "Review added", bookToReview});
  }else if(bookToReview.reviews[username]){
    bookToReview.reviews[username] = review;
    return res.status(200).json({message: "Review modified", bookToReview});
  }
  return res.status(401).json({message: "Review addition unsuccessful"})
});

regd_users.delete('/auth/review/:isbn', (req,res)=>{
  const {username} = req.session.authorization;
  const {isbn} = req.params;
  let reviewToDel = books[isbn];
  if(!books[isbn]){
    return res.status(401).json({message: `No book was found. Check ISBN number`})
  }
  delete reviewToDel.reviews[username]
  return res.status(201).json({message: `Review successfully deleted for ${books[isbn].title} See more at`, reviewToDel})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
