const express = require("express"); //require express into express() variable
const app = express(); //put express() into a variable called app
const PORT = 8080; // assigns default port 8080
const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }))

//require bcrypt
const bcrypt = require('bcryptjs');

//require cookie parser
const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
app.use(cookieParser())


app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.random().toString(26).slice(-6)
}


//create database
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

//url database
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
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

//url filter helper function
function urlsForUser(id, urlDatabase) {
  let filter = {}
  for (let url in urlDatabase){
    if (id === urlDatabase[url].userID){
      filter[url] = urlDatabase[url];
    }
  }
  return filter;
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
  const user = users[req.cookies['user_id']];
  console.log('urlDatabase on /urls', urlDatabase);

  let filterDatabase = urlsForUser(req.cookies['user_id'], urlDatabase)
  console.log('filterDatabase', filterDatabase);
  const templateVars = { urls: filterDatabase, user: user };
  res.render("urls_index", templateVars);
});


//goes to page to create shortURL
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id'] === undefined){
    res.redirect("/login");
  } else {
  const user = users[req.cookies['user_id']];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
  }
});



//login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password

  if (!emailLookUp(email)){
    return res.status(403).send("email not found");
  } else if (users[idLookUp(email)].password !== req.body.password){
   return res.status(403).send("password incorrect"); 
  } else if (emailLookUp(email) && users[idLookUp(email)].password === req.body.password){
    res.cookie("user_id", idLookUp(email)) //creates cookie
    res.redirect("/urls")
  }
});

//get login
app.get("/login", (req, res) => {
  const user = users[req.cookies['user_id']];
  if (user){
    return res.redirect("/urls");
  }
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
  
  const userID = generateRandomString()
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (emailLookUp(newEmail)) {
    return res.status(400).send("Email already registered")
  }

  if (newEmail === ''){
    return res.status(400).send("No email input")
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
  const user = users[req.cookies['user_id']];
  if (user){
    return res.redirect("/urls");
  }
  const templateVars = {user: null };
  res.render("user_registration", templateVars);
});

//create shortURL string
app.post("/urls/new", (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!user){
    return res.send("You must login to create new URL");
  }
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID:req.cookies['user_id']
  } 
  // console.log('shortURL');
  res.redirect(`/urls/${shortURL}`)
});

//UPDATE URL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!user){
    return res.send("You must login to create new URL");
  }
  const shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = req.body.longURL
  console.log('req.body now', req.body);
  res.redirect("/urls");
});


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!user){
    return res.send("You must login to create new URL");
  }
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});

//directs me to shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!urlDatabase[req.params.shortURL]){
    return res.send("this TinyURL doesn't exist");
  }

  console.log(req.params.shortURL)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  console.log('templateVars on :shortURL page', templateVars);
  res.render("urls_show", templateVars);
});

//redirects me to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});
