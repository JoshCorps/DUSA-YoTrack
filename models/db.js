'use strict';

let mongojs = require('mongojs');
let db;

module.exports = () => {
  // if a database object doesn't exist yet, create it
  if (!db) {
    console.log('Connecting to database.');
    db = mongojs('mongodb://root:password@ds133054.mlab.com:33054/industrial-project');
     
    db.createCollection('users', {}, () => {
      // assign the user collection to this object so we can reuse it
      console.log('Created/verified user collection');
      db.users = db.collection('users');
    });
      
    db.createCollection('transactions', {}, () => {
      console.log('Created/verified transaction collection');
      db.transactions = db.collection('transactions');
    });
      
    // when the database is connected, fire this event.
    db.on('connect', () => {
      console.log('Connected to database.');
    });
      
    // when the database errors, fire this event.
    db.on('error', (e) => {
      console.log('Database error: ', e);
    });
  }  
  
  // I know I said don't use return, but this is the one case where it's acceptable :>
  return db;
};