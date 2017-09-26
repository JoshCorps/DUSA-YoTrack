'use strict';

// server
let express = require('express');
let app = express();
let http = require('http');

// clusters
let cluster = require('cluster');
let numCPUs = require('os').cpus().length;

// various node modules
let path = require('path');
let passport = require('passport'); 

// express middleware
let morgan = require('morgan'); 
let bodyParser = require("body-parser");
let minify = require('express-minify');
let compression = require('compression');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let fileUpload = require('express-fileupload');
let cookieParser = require('cookie-parser');

let db = require('./models/db.js')();

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
app.use(cookieParser());
app.use(session({
	secret: 'some-super-secret-random-string-should-probably-go-here',
	resave: true,
	rolling: true,
	saveUninitialized: false,
	cookie: { maxAge: 1000 * 60 * 60 * 2 },
	store: new MongoStore({ url: 'mongodb://root:password@ds133054.mlab.com:33054/industrial-project?maxPoolSize=100' })
})); 
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// load controllers
app.use(require('./controllers'));
   
// start up express server
if (cluster.isMaster) {
	console.log(`Master is running: ${process.pid}`);
	
	// fork a worker for each cpu
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Worker ${worker.process.pid} died.`);
		// start another one to replace it
		cluster.fork();
	});
	
	cluster.on('listening', (worker, address) => {
		console.log(`Worker ${worker.process.pid} started`);
	});
} else {
	// share port between workers
	let port = process.env.PORT || 3000;
	let server = http.Server(app);
	server.listen(port, () => {
		console.log(server.address());
		console.log(`Listening on port ${port}`);
	});
	
	process.on('SIGINT', function() {
	  server.close();
	  process.exit();
	});
}
