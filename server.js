var express = require('express');
var app = express();
var qs = require('querystring');
//var pg = require('pg');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

/*   NOTE:
 *   get a GET parameter
 *     req.params.param
 *   get a POST parameter
 *     req.body.param
 */



app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	done(null, {
		'id':1,
		'username': 'j',
		'password': 'h'
	});
});

passport.use(new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	session: true
}, function(username, password, done) {
	//return done(null, false);
	return done(null, {
		'id':1,
		'username': username,
		'password': password
	});
}));


/*
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:root@localhost:5432/piq';
var client = new pg.Client(connectionString);
client.connect();

var query = client.query("SELECT * FROM test");
//fired after last row is emitted
query.on('row', function(row) {
	console.log(row);
});
query.on('end', function() { 
	console.log("end");
	client.end();
});
*/



/*
 * Visit the home page.
 */
app.get('/', function (req, res) {
	res.redirect('/index.html');
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
			return res.status(403).jsonp({message: 'no user found'});
        }

        // Manually establish the session...
        req.login(user, function(err) {
            if (err) {
				return next(err);
			}
			return res.status(200).jsonp({message: 'user authenticated'});
        });
    })(req, res, next);
});
/*
 * logout.
 */
app.post('/logout', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
    req.logout();
	res.end(JSON.stringify({
		
	}));
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
app.post('/register/user', function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Chef registration.
 */
app.post('/register/chef', function (req, res) {
	res.end(JSON.stringify({
		
	}));
});



/*
 * Get all classes available.
 */
app.post('/user/class', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Get all classes you are registered in.
 */
app.post('/user/class/registered', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Submit a feedback rating to a class.
 */
app.put('/user/class/:classID(\\d+)/feedback', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Sign up for a class with a session.
 */
app.put('/user/class/:classID(\\d+)/session/:sessionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10),
	    sessionID = parseInt(req.params.sessionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Cancel a class with a session.
 */
app.delete('/user/class/:classID(\\d+)/session/:sessionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10),
	    sessionID = parseInt(req.params.sessionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Get all classes you created.
 */
app.post('/chef/class/created', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Create a class.
 */
app.put('/chef/class', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Delete a class.
 */
app.delete('/chef/class/:classID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Edit a class.
 */
app.post('/chef/class/:classID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Create a class session.
 */
app.put('/chef/class/:classID(\\d+)/session/:sessionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10),
	    sessionID = parseInt(req.params.sessionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Delete a class session.
 */
app.delete('/chef/class/:classID(\\d+)/session/:sessionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10),
	    sessionID = parseInt(req.params.sessionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Edit a class session.
 */
app.post('/chef/class/:classID(\\d+)/session/:sessionID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		next();
	} else {
		return res.status(403).jsonp({message: 'Access denied, please log in'});
	}
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10),
	    sessionID = parseInt(req.params.sessionID, 10);
	res.end(JSON.stringify({
		
	}));
});







var server = app.listen(process.env.PORT || 3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('My app started at http://%s:%s', host, port);
});







var io = require('socket.io').listen(server);

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('a user left');
	});
});