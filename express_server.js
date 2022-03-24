const express = require("express"); //require express into express() variable
const app = express(); //put express() into a variable called app
const PORT = 8080; // assigns default port 8080
const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }))

const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
app.use(cookieParser())


app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.random().toString(26).slice(-6)
}


//create database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// username database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//returns true if email matches, otherwise false
function emailLookUp (email) {
  for (let id in users){
    if (email === users[id].email){
      return true;
    }
  }
  return false;
};

//returns id based on email
function idLookUp (email) {
  for (let id in users){
    if (email === users[id].email){
      return id;
    }
  }
}


//this line registers a handler for the root path, "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

//server is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//says hello world
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//homepage
app.get("/urls", (req, res) => {
  const user = users[req.cookies['user_id']]; //cookie from?
  (console.log('user variable', user));
  console.log(req.cookies)
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});


//renders page to create new short url
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id'] === undefined){
    res.redirect("/login");
  } else {

  console.log('req.cookies on /urls/new', req.cookies);
  
  const user = users[req.cookies['user_id']];
  console.log('user variable on /url/new/', user)
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
  }
});

//generate shortURL string
app.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString()
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL
  // console.log('shortURL');
  res.redirect(`/urls/${shortURL}`)
});

//login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password

  if (!emailLookUp(email)){
    res.send("403: email not found");
  } else if (users[idLookUp(email)].password !== req.body.password){
   res.send("403: password incorrect"); 
  } else if (emailLookUp(email) && users[idLookUp(email)].password === req.body.password){
    res.cookie("user_id", idLookUp(email)) //creates cookie
    res.redirect("/urls")
  }
});

//get login
app.get("/login", (req, res) => {
  const user = users[req.cookies['user_id']];
  console.log(req.cookies);
  const templateVars = { urls: urlDatabase, user: user };
  res.render("login", templateVars);
})

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); //deletes cookie
  res.redirect('/urls');
});

//post register
app.post("/register", (req, res) => {
  console.log("register req.body", req.body);
  
  const userID = generateRandomString()
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (emailLookUp(newEmail)) {
    res.send("400: Email already registered")
  }

  if (newEmail === ''){
    res.send("400: No email input")
  } 

  res.cookie("user_id", userID);  

  users[userID] = {
    id: userID,
    email: newEmail,
    password: newPassword
  }
  // console.log(users)
 
  res.redirect('/urls');
});

//get register page 
app.get("/register", (req, res) => {
  const templateVars = {user: null };
  res.render("user_registration", templateVars);
});



//UPDATE URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});

//directs me to shortURL page
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies['user_id'] === undefined){
    res.redirect("/login");
  } 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies['user_id'] };
  res.render("urls_show", templateVars);
});

//redirects me to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  res.redirect(longURL);
});
