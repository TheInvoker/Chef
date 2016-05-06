var express = require('express');
var app = express();
var qs = require('querystring');
var pg = require('pg');
var pg_escape = require('pg-escape');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var socket = require('socket.io');
var fs = require('fs');
var handlebars = require('handlebars');

/*   NOTE:
 *   get a GET parameter
 *     req.params.param
 *   get a POST parameter
 *     req.body.param
 */


var NOT_AUTHENTICATED_MESSAGE = 'Access denied, please log in';
var PERMISSION_DENIED_MESSAGE = 'You do not have permission';
var NO_USER_FOUND_MESSAGE = 'no user found';
var USER_AUTHENTICATED = 'ok';

var connectionString = process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/piq';
var client = new pg.Client(connectionString);
client.connect();



app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({ secret: 'keyboard cat', cookie: { maxAge: 1000 * 60 * 14 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	var sql = pg_escape('SELECT * FROM "user" where id=%L', id.toString());
	var query = client.query(sql);
	query.on('row', function(row, result) {
		result.addRow(row);
	});
	query.on('end', function(data) { 
		if (data.rows.length == 1) {
			return done(null, data.rows[0]);
		}
		return done(null, false);
	});
});

passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	session: true
}, function(email, password, done) {
	var sql = pg_escape('SELECT * FROM "user" where email=%L and password=%L', email, password);
	var query = client.query(sql);
	query.on('row', function(row, result) {
		result.addRow(row);
	});
	query.on('end', function(data) { 
		if (data.rows.length == 1) {
			return done(null, data.rows[0]);
		}
		return done(null, false);
	});
}));



function checkPermission(req, res, sqlClient, userID, moduleID, callback, failedCallback) {
	var sql = pg_escape('SELECT count(mp.*) AS count \
	                     FROM "modulePermission" mp \
	                     JOIN "user" u ON u.id=%L \
						 WHERE mp."moduleID"=%L and mp."roleID"=u."roleID"', userID.toString(), moduleID.toString());
	var query = client.query(sql);
	query.on('row', function(row, result) {
		result.addRow(row);
	});
	query.on('end', function(data) { 
		if (data.rows[0].count === '1') {
			return callback();
		}
		return failedCallback(req, res);
	});
}

function renderView(sourceFile, jsonObj, callback) {
	fs.readFile(sourceFile, function(err, data){
		if (!err) {
			// make the buffer into a string
			var source = data.toString();
			// call the render function
			callback(200, renderToString(source, jsonObj));
		} else {
			// handle file read error
			callback(500, "Error occured on server when rendering view.");
		}
	});
}

function renderToString(source, data) {
  var template = handlebars.compile(source);
  var outputString = template(data);
  return outputString;
}


/*
 * Visit the home page.
 */
app.get('/', function (req, res) {
	if (req.isAuthenticated()) {
		var sql = pg_escape('SELECT * FROM question');
		var query = client.query(sql);
		query.on('row', function(row, result) {
			result.addRow(row);
		});
		query.on('end', function(sqldata) {
			fs.readFile(__dirname + '/views/header.html', function(err, data){
				renderView(__dirname + '/views/page.html', {
					header : data,
					questions : sqldata.rows
				}, function(code, str) {
					res.writeHead(code); res.end(str);
				});
			}); 
		});
	} else {
		fs.readFile(__dirname + '/views/header.html', function(err, data){
			renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
				res.writeHead(code); res.end(str);
			});
		});
	};
});
/*
 * Login.
 */
app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
			return next(err);
		}
        if (!user) {
			return res.status(403).jsonp({message: NO_USER_FOUND_MESSAGE});
        }

        // Manually establish the session...
        req.login(user, function(err) {
            if (err) {
				return next(err);
			}
			res.redirect('/');
        });
    })(req, res, next);
});
/*
 * Logout.
 */
app.get('/logout', function(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		fs.readFile(__dirname + '/views/header.html', function(err, data){
			renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
				res.writeHead(code); res.end(str);
			});
		});
	};
}, function (req, res) {
    req.logout();
	fs.readFile(__dirname + '/views/header.html', function(err, data){
		renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
			res.writeHead(code); res.end(str);
		});
	});
});
/*
 * Forgot password.
 */
app.get('/forgetpassword', function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * User registration.
 */
app.post('/register', function (req, res) {
	fs.readFile(__dirname + '/views/header.html', function(err, data){
		renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
			res.writeHead(code); res.end(str);
		});
	});
});






/*
 * Get a question.
 */
app.get('/questions/:questionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 1, next, function(req, res) {
			return res.status(403).jsonp({message: PERMISSION_DENIED_MESSAGE});
		});
	} else {
		fs.readFile(__dirname + '/views/header.html', function(err, data){
			renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
				res.writeHead(code); res.end(str);
			});
		});
	};
}, function (req, res) {
	var questionID = parseInt(req.params.questionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Edit a question.
 */
app.post('/questions/:questionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 1, next, function(req, res) {
			return res.status(403).jsonp({message: PERMISSION_DENIED_MESSAGE});
		});
	} else {
		fs.readFile(__dirname + '/views/header.html', function(err, data){
			renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
				res.writeHead(code); res.end(str);
			});
		});
	};
}, function (req, res) {
	var questionID = parseInt(req.params.questionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Create a question.
 */
app.post('/questions', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 1, next, function(req, res) {
			return res.status(403).jsonp({message: PERMISSION_DENIED_MESSAGE});
		});
	} else {
		fs.readFile(__dirname + '/views/header.html', function(err, data){
			renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
				res.writeHead(code); res.end(str);
			});
		});
	};
}, function (req, res) {
	var userID = req.session.passport.user;
	var question = req.body.question;
	var sql = pg_escape('INSERT INTO question (question,date_created,date_modified,user_id,yes,no) \
						 VALUES (%L,now(),now(),%L,0,0) RETURNING id', question, userID.toString());
	var query = client.query(sql);
	query.on('row', function(row, result) {
		result.addRow(row);
	});
	query.on('end', function(data) {
		var id = data.rows[0].id;
		res.end(JSON.stringify({
			"id" : id
		}));
	});
});
/*
 * Delete a question.
 */
app.delete('/questions/:questionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 1, next, function(req, res) {
			return res.status(403).jsonp({message: PERMISSION_DENIED_MESSAGE});
		});
	} else {
		fs.readFile(__dirname + '/views/header.html', function(err, data){
			renderView(__dirname + '/views/index.html', {header:data}, function(code, str) {
				res.writeHead(code); res.end(str);
			});
		});
	};
}, function (req, res) {
	var questionID = parseInt(req.params.questionID, 10);
	res.end(JSON.stringify({
		
	}));
});





var server = app.listen(process.env.PORT || 3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('QuickyHealth started at http://%s:%s', host, port);
});

var io = socket.listen(server);
io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('a user left');
	});
});