'use strict';

let mongojs = require('mongojs');
let db;

module.exports = () => {
  // if a database object doesn't exist yet, create it
  if (!db) {
    console.log('Connecting to database.');
    db = mongojs('mongodb://root:password@ds133054.mlab.com:33054/industrial-project?maxPoolSize=100');
     
    db.createCollection('users', {}, () => {
      // assign the user collection to this object so we can reuse it
      console.log('Created/verified user collection');
      db.users = db.collection('users');
      db.users.createIndex('email');
      db.users.reIndex();
    });
      
    db.createCollection('transactions', {}, () => {
      console.log('Created/verified transaction collection');
      db.transactions = db.collection('transactions');
      db.transactions.createIndex('dateTime');
      db.transactions.reIndex();
    });
    
    db.createCollection('uploads', {}, () => {
      console.log('Created/verified uploads collection');
      db.uploads = db.collection('uploads');
    });
    
    db.createCollection('tribe_analyses', {}, () => {
      console.log('Created/verified tribe analyses collection');
      db.tribe_analyses = db.collection('tribe_analyses');
    });
    
    db.createCollection('tribes', {}, () => {
      console.log('Created/verified tribes collection');
      db.tribes = db.collection('tribes');
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