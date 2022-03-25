



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

module.exports = { urlsForUser, emailLookUp, idLookUp };