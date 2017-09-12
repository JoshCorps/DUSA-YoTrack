let sha512 = require('sha512');
let randomID = require("random-id");

class User {
  constructor(user) {
      this.firstName = user.firstName || undefined;
      this.lastName = user.lastName || undefined;
      this.email = user.email || undefined;
      this.password = user.password || undefined; 
      this.salt = user.salt || undefined;
      this.accountType = user.accountType || undefined;
      this.isApproved = user.isApproved || false;
  }
  
  update(db, data, callback) {
    // sync changes to database
    db.users.update({'email': this.email}, { 
      'firstName': data.firstName,
      'lastName': data.lastName,
      'password': data.password,
      'salt': data.salt,
      'accountType': data.accountType,
      'isApproved': data.isApproved
    }, callback);
  }
  
  setPassword(password, update) {
    // if there's nothing there, make it true by default
    update = update || true;
    
    // set a new random salt
    this.salt = randomID(16);
    // hash password + salt
    this.password = sha512(password + this.salt).toString('hex');
    
    // if we're inserting a new user, we don't want to call this.
    if (update) {
      this.update();
    }
  }
  
  checkPassword(inputPassword) {
    // hash input + salt
    let hashedPassword = sha512(inputPassword + this.salt).toString('hex');
    
    // check if they match
    if (hashedPassword === this.password) {
      return true;
    } else {
      return false;
    }
  }
  
  static create(db, data, callback) {
    let user = new User(data);
    db.users.insert(data, callback());
  }
  
  static getUserByEmail(db, email, callback) {
    
  }
 
  static getUnapprovedUsers(db, callback) {
    //get list of unapproved users from db
    db.users.find({'isApprved': false}, (err, userData) => {
      if (err) {
        callback(err);
        return;
      }
      var users;
      // loop through array and return user array
      for (let i=0; i<userData.length; i++) {
        var user = new User(userData[i]);
        users.push(user);
      }
      callback(null, users);
    });
  }
  
  static deleteUsersByEmails(db, emails, callback) {
    var query = {
      'email':{
        $in: emails
      }
    };
    
    db.users.deleteMany(query, (err, deleted) => {
      if (err) {
        callback(err);
      }
      callback(null, deleted.result.n);
    });
  }
  
  static approveUsers(db, emails, callback) {
    var query = {
      'email':{
        $in: emails
      }
    };
    db.users.update(query, {'isApproved': true}, (err, res) => {
      if (err) {
        callback(err);
      }
    });
  }
}

module.exports = User;