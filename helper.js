



//url filter helper function
function urlsForUser(id, urlDatabase) {
  let filter = {}
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      filter[url] = urlDatabase[url];
    }
  }
  return filter;
}

//see if emails match or not, returns true or false
function emailLookUp(email, database) {
  for (let id in database) {
    if (email === database[id].email) {
      return true;
    }
  }
  return false;
};

//returns id based on email
function idLookUp(email, database) {
  for (let id in database) {
    if (email === database[id].email) {
      return id;
    }
  }
}

//returns randomstring
function generateRandomString() {
  return Math.random().toString(26).slice(-6)
}


module.exports = { urlsForUser, emailLookUp, idLookUp, generateRandomString };