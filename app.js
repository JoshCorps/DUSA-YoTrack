'use strict';

// server
let express = require('express');
let app = express();
let http = require('http');
let server = http.Server(app);

// various node modules
let path = require('path');
let passport = require('passport'); 

// express middleware
let morgan = require('morgan'); 
let bodyParser = require("body-parser");
let minify = require('express-minify');
let compression = require('compression');
let session = require('express-session');
let fileUpload = require('express-fileupload');
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
app.use(session({
	secret: 'some-super-secret-random-string-should-probably-go-here',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
})); 
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// load controllers
app.use(require('./controllers'));

//add conversion function for money
Number.prototype.ToPounds = function ToPounds() {
    return this/100;
};
   
// start up express server
let port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});