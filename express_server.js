//require express
const express = require("express");
const app = express();

const PORT = 8080; // assigns default port 8080

//require bodyParser
const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }));

//require bcrypt
const bcrypt = require('bcryptjs');

//require cookie session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp']
}));

app.set('view engine', 'ejs');

//require helper functions
const { urlsForUser, emailLookUp, idLookUp, generateRandomString } = require('./helper.js');

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
};

//this line registers a handler for the root path, "/"
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  res.send("Hello!");
  if (user) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

//server is listening
app.listen(PORT, () => {
  console.log(`PORT ${PORT} is listening`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//says hello world
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//urls homepage
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  let filterDatabase = urlsForUser(req.session.user_id, urlDatabase);
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



//post login into account
app.post("/login", (req, res) => {
  const email = req.body.email;
  const passwordInput = req.body.password;
  const hashPassword = users[idLookUp(email, users)].password;

  if (!emailLookUp(email, users)) {
    return res.status(403).send("email not found");
  } else if (bcrypt.compareSync(passwordInput, hashPassword)) {
    req.session.user_id = idLookUp(email, users); //create cookie for login
    return res.redirect("/urls");
  } else {
    return res.status(403).send("password incorrect");
  }
});

//get login page
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { urls: urlDatabase, user: user };
  res.render("login", templateVars);
});

//logout and delete cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//post register a new account
app.post("/register", (req, res) => {

  const userID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = bcrypt.hashSync(req.body.password, 10);

  if (newEmail === '') {
    return res.status(400).send("No email input");
  }

  if (req.body.password === '') {
    return res.status(400).send("No password input");
  }

  if (emailLookUp(newEmail, users)) {
    return res.status(400).send("Email already registered");
  }

  req.session.user_id = userID; //create cookie for registration

  users[userID] = {
    id: userID,
    email: newEmail,
    password: newPassword
  };

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
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You must login to create new URL");
  }

  let longURL = '';
  if (req.body.longURL.includes("https://") || req.body.longURL.includes("http://")) {
    longURL = req.body.longURL;
  } else {
    longURL = "https://" + req.body.longURL;
  }

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You must login to delete new URL");
  }

  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send("This TinyURL is not from your account, you do not have access to this page");
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//UPDATE URL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You must login to edit URL");
  }

  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send("This TinyURL is not from your account, you do not have access to this page");
  }

  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//directs me to shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You must login to view this page");
  }

  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send("This TinyURL is not from your account, you do not have access to this page");
  }

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send("this TinyURL doesn't exist");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  res.render("urls_show", templateVars);
});

//redirects me to longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send("this TinyURL doesn't exist");
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
