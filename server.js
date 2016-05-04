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
		res.sendFile('/views/page.html', { root : __dirname}); 
	} else {
		renderView(__dirname + '/views/index.html', {title:"Ryan"}, function(code, str) {
			res.writeHead(code); res.end(str);
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
			return res.sendFile('views/page.html', { root : __dirname}); 
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
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
}, function (req, res) {
    req.logout();
	res.sendFile('/views/index.html', { root : __dirname}); 
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
	res.sendFile('/views/index.html', { root : __dirname}); 
});
/*
 * Chef registration.
 */
app.post('/register/chef', function (req, res) {
	res.sendFile('/views/index.html', { root : __dirname}); 
});





/*
 * Get all classes available.
 */
app.get('/user/class', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 1, next, function(req, res) {
			return res.sendFile('/views/nopermission.html', { root : __dirname}); 
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Get all classes you are registered in.
 */
app.get('/user/class/registered', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 2, next, function(req, res) {
			return res.sendFile('/views/nopermission.html', { root : __dirname}); 
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Submit a feedback rating to a class.
 */
app.put('/user/class/:classID(\\d+)/feedback', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 3, next, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 4, next, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 5, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
}, function (req, res) {
	var classID = parseInt(req.params.classID, 10),
	    sessionID = parseInt(req.params.sessionID, 10);
	res.end(JSON.stringify({
		
	}));
});
/*
 * Get all classes you created.
 */
app.get('/chef/class/created', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 6, function(req, res) {
			return res.sendFile('/views/nopermission.html', { root : __dirname}); 
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Create a class.
 */
app.put('/chef/class', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 7, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
}, function (req, res) {
	res.end(JSON.stringify({
		
	}));
});
/*
 * Delete a class.
 */
app.delete('/chef/class/:classID(\\d+)', function(req, res, next) {
    if (req.isAuthenticated()) {
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 8, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 9, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 10, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 11, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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
		var userID = req.session.passport.user;
		checkPermission(req, res, client, userID, 12, function(req, res) {
			return res.status(403).jsonp({message: notPermissionMessage});
		});
	} else {
		res.sendFile('/views/index.html', { root : __dirname}); 
	};
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

var io = socket.listen(server);
io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('a user left');
	});
});