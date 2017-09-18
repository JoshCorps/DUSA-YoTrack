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
    db.users.update({'email': this.email}, {$set:{ 
      'firstName': data.firstName,
      'lastName': data.lastName,
      'password': data.password,
      'salt': data.salt,
      'accountType': data.accountType,
      'isApproved': data.isApproved
    }}, callback);
  }
  
  setPassword(password, update) {
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
  
  isMasterAccount() {
    return (this.accountType == 'master');
  }
  
  static create(db, data, callback) {
    let user;
    if (data instanceof User) {
      user = data;
    } else {
      user = new User(data);
    }
    db.users.insert(user, callback());
  }
  
  static getUserByEmail(db, email, callback) {
    db.users.findOne({'email': email}, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      if (data) {
        let user = new User(data);
        callback(null, user)
      } else {
        callback(null, null);
      }
    });
  }
 
  static getUnapprovedUsers(db, callback) {
    //get list of unapproved users from db
    db.users.find({'isApproved': false}, (err, userData) => {
      if (err) {
        callback(err);
        return;
      }
      var users = [];
      // loop through array and return user array
      if(userData) {
        for (let i=0; i<userData.length; i++) {
          var user = new User(userData[i]);
          users.push(user);
        }
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
    
    db.users.remove(query, (err, deleted) => {
      if (err) {
        callback(err);
      }
      callback(null, deleted);
    });
  }
  
  static approveUsers(db, users, callback) {
    for(let i=0; i<users.length; i++) {
      console.log('Account type: '+users[i].accountType);
      db.users.update({email: users[i].email}, {$set: {'isApproved': true, 'accountType': users[i].accountType}}, (err, res) => {
        if (err) {
          callback(err);
        }
      });
    }
  }
}

module.exports = User;