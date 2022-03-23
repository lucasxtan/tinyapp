const express = require("express"); //require express into express() variable
const app = express(); //put express() into a variable called app
const PORT = 8080; // assigns default port 8080
const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }))

const cookieParser = require('cookie-parser')
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



//this line registers a handler for hte root path, "/"
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
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});


//renders url_new
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_new");
});

//generate shortURL string
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL
  // console.log('shortURL');
  res.redirect(`/urls/${shortURL}`)
});

//login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username) //creates cookie
  res.redirect("/urls")
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('username'); //deletes cookie
  res.redirect('/urls');
});

//register
// app.post("/register", (req, res) => {
  // const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
//   res.render("user_registration", templateVars)
// });

//get register page 
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies['username'] };
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


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  console.log(req.params.shortURL);
  console.log(urlDatabase);
  res.redirect(longURL);
});
