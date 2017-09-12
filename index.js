'use strict';

// server
let express = require('express');
let app = express();
let http = require('http');
let server = http.Server(app);

// various node modules
let path = require('path');
let passport = require('passport'); //
let LocalStrategy = require('passport-local').Strategy; //

// models
let db = require('./models/db.js')();
let User = require('./models/user.js');

// express middleware
let morgan = require('morgan'); //
let bodyParser = require("body-parser");
let minify = require('express-minify'); //
let compression = require('compression'); //
let sessionMiddleware = require('express-session')({
	secret: 'some-super-secret-random-string-should-probably-go-here',
	resave: true,
	saveUninitialized: true
}); //

// set app parameters
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(compression());
app.use(minify());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((email, password, done) => {
    User.getUserByEmail(db, email, (error, data) => {
       if (error) {
           return done(error);
       }
       
       // for security purposes, we don't actually tell the user if either the username
       // or password was incorrect. We'll just leave it as is for testing.
       
       // if the user objects exists in the DB 
       if (data) {
            if (data.checkPassword(password)) {
                // password is OK
                return done(null, data);
            } else {
                // password is not OK
                return done(null, false, { message: 'Incorrect password.' });
            }
       } else {
           // email does not exist in DB
           return done(null, false, { message: 'Incorrect username.' });
       }
    });
}))

// serve static files
app.get('/', express.static(path.join(__dirname, 'public')));

// load controllers
app.use(require('./controllers'));

app.post('/register', (request, reponse) => {
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let email = request.body.email;
    let password = request.body.password;
    let repeatpassword = request.body.repeatpassword;
    
    User.create(db, data)
    if (password !== repeatpassword)
    {
        // return error
    }
    if (!email.contains("@dusa") || !email.contains("@dundee"))
    {
        // return invalid email
    }
    if (password.length < 8)
    {
        //pass too short
    }
    
    var hashedPassword = User.setPassword(password, false);
    var data = [
        {firstName: firstName,
        lastName: lastName,
        email: email,
        hashedPassword: password,
        //salt: ,
        //accountType: ,
        isApproved: false}
        ]
});

   
// start up express server
let port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});