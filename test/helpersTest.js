
const { assert } = require('chai');

const { urlsForUser, emailLookUp, idLookUp } = require('../helper.js');

const testUsers = {
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
};

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

describe('helper function', () => {
  it('idlookup: should return a user with valid email', () => {
    const user = idLookUp("user@example.com", testUsers)
    assert.equal("userRandomID", user);
  });

  it('urlforuser: it should return a filtered object', () => {
    const filtered = urlsForUser('aJ48lW', urlDatabase)
    assert.deepEqual(filtered, {
      b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
      i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
    })
  })

  it('emaillookup: returns true if matches the email in database', () => {
    assert.equal(emailLookUp('user2@example.com', testUsers), true)
  })

});