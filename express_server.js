const express = require("express"); //require express into express() variable
const app = express(); //put express() into a variable called app
const PORT = 8080; // assigns default port 8080
const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }))

//require bcrypt
const bcrypt = require('bcryptjs');

// //require cookie parser
// const cookieParser = require('cookie-parser');
// const req = require("express/lib/request");
// app.use(cookieParser())

//require cookie session
var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp']
}))

app.set('view engine', 'ejs');

//require helper functions
const { urlsForUser, emailLookUp, idLookUp } = require('./helper/helper.js');

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//url filter helper function
// function urlsForUser(id, urlDatabase) {
//   let filter = {}
//   for (let url in urlDatabase) {
//     if (id === urlDatabase[url].userID) {
//       filter[url] = urlDatabase[url];
//     }
//   }
//   return filter;
// }

// //users should be a parameter
// //instead of returning true, return id?
// //returns true if email matches, otherwise false
// function emailLookUp(email) {
//   for (let id in users) {
//     if (email === users[id].email) {
//       return true;
//     }
//   }
//   return false;
// };

// //returns id based on email
// function idLookUp(email, database) {
//   for (let id in database) {
//     if (email === database[id].email) {
//       return id;
//     }
//   }
// }


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
  const user = users[req.session.user_id];

  let filterDatabase = urlsForUser(req.session.user_id, urlDatabase)
  const templateVars = { urls: filterDatabase, user: user };
  res.render("urls_index", templateVars);
});


//goes to page to create shortURL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    const user = users[req.session.user_id];
    const templateVars = { urls: urlDatabase, user: user };
    res.render("urls_new", templateVars);
  }
});



//login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password


  if (!emailLookUp(email, users)) {
    return res.status(403).send("email not found");
  } else if (bcrypt.compareSync(req.body.password, users[idLookUp(email, users)].password)) {
    req.session.user_id = idLookUp(email, users) //creates cookie
    return res.redirect("/urls")
  } else {
    return res.status(403).send("password incorrect");
  }
});
// res.cookie("user_id", idLookUp(email)) 

// users[idLookUp(email)].password !== req.body.password
// users[idLookUp(email)].password === req.body.password

//get login
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { urls: urlDatabase, user: user };
  res.render("login", templateVars);
})

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie('user_id'); //deletes cookie
  res.redirect('/urls');
});

//post register
app.post("/register", (req, res) => {

  const userID = generateRandomString()
  const newEmail = req.body.email;
  const newPassword = bcrypt.hashSync(req.body.password, 10);

  if (emailLookUp(newEmail, users)) {
    return res.status(400).send("Email already registered")
  }

  if (newEmail === '') {
    return res.status(400).send("No email input")
  }

  req.session.user_id = userID;
  // res.cookie("user_id", userID);

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
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("user_registration", templateVars);
});

//create shortURL string
app.post("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send("You must login to create new URL");
  }
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  // console.log('shortURL');
  res.redirect(`/urls/${shortURL}`)
});

//UPDATE URL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send("You must login to create new URL");
  }
  const shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = req.body.longURL
  res.redirect("/urls");
});


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send("You must login to create new URL");
  }
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});

//directs me to shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("this TinyURL doesn't exist");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  res.render("urls_show", templateVars);
});

//redirects me to longURL
app.get("/u/:shortURL", (req, res) => {
  console.log('redirect longURL urldatabase', urlDatabase)
  console.log('redirect longURL req.params.shortURL', req.params.shortURL)
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});
