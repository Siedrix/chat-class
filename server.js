var express = require('express')
var swig = require('swig')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var uuid = require('uuid')
var bcrypt = require('bcrypt-nodejs')

var session = require('express-session')
var RedisStore = require('connect-redis')(session)
var MongoStore = require('express-session-mongo')
var flash = require('flash')

var Schema = mongoose.Schema

// mongoose.connect('mongodb://localhost/base-server')
var dbURI = 'mongodb://localhost/base-server'
if (process.env.NODE_ENV === 'production') {
	dbURI = process.env.MONGOLAB_URI
}
mongoose.connect(dbURI)

// Declara tus modelos en este espacio
var userSchema = Schema({
	username: String,
	displayName: String,
	password: String,
	uuid : {type: String, default: uuid.v4}
})

var User = mongoose.model('User', userSchema)
// Termina la declaracion de modelos

var app = express()

// Add sessions and flash
var sessionConfig = {
	// secret: 'keyboard cat',
	// store: new MongoStore(),
	saveUninitialized: true,
	resave: true
}

if (process.env.NODE_ENV === 'production') {
	// sessionConfig.store = new RedisStro
	sessionConfig.secret = 'WYYZ5epfgC3AmF348DNXXC3jsrtYgPv5hTMB6qYw'
	sessionConfig.store = new RedisStore({url: process.env.REDISTOGO_URL})
}else{
	sessionConfig.secret = 'keyboard cat'
	sessionConfig.store = new MongoStore()

}
app.use(session(sessionConfig))
// Correr en MongoDB:
// use express-sessions
// db.sessions.ensureIndex( { "lastAccess": 1 }, { expireAfterSeconds: 3600 } )
app.use( flash() )

// Configurar de swig!
app.engine('html', swig.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname + '/views')

// Configurar cache
app.set('view cache', false)
swig.setDefaults({cache:false})// <-- Cambiar a true en produccion

// Agregamos body parser a express
app.use( bodyParser.urlencoded({ extended:false }) )

// Declara tus url handlers en este espacio
app.use(function (req, res, next) {
	if(!req.session.userId){
		return next()
	}

	User.findOne({uuid: req.session.userId}, function(err, user){
		if(err){
			return res.send(500, 'Internal Server Error')
		}

		res.locals.user = user
		next()
	})
});

app.get('/', function (req, res) {
	res.render('index')
})

app.get('/sign-up', function (req, res){
	var error = res.locals.flash.pop()

	res.render('sign-up', {
		error: error
	})
})

app.get('/log-in', function (req, res){
	var error = res.locals.flash.pop()

	res.render('log-in',{
		error: error
	})
})

app.get('/log-out', function (req, res){
	req.session.destroy()
	res.redirect('/')
})

app.post('/sign-up', function (req, res){
	if(!req.body.username || !req.body.password){
		req.flash('sign-up-error', 'To sign up you need a username and a password')
		return res.redirect('/sign-up')		
	}

	User.findOne({username: req.body.username}, function(err, doc){
		if(err){
			return res.send(500, 'Internal Server Error')
		}

		if(doc){
			req.flash('sign-up-error', 'Username is taken')
			return res.redirect('/sign-up')
		}

		bcrypt.hash(req.body.password, null/* Salt */, null, function(err, hashedPassword) {
			if(err){
				return res.send(500, 'Internal Server Error')
			}

			User.create({
				username: req.body.username,
				password: hashedPassword
			}, function(err, doc){
				if(err){
					return res.send(500, 'Internal Server Error')
				}

				req.session.userId = doc.uuid
				res.redirect('/')
			})
		});
	})
})

app.post('/log-in', function (req, res){
	if(!req.body.username || !req.body.password){
		req.flash('log-in-error', 'To log in you need a username and a password')
		return res.redirect('/log-in')
	}

	User.findOne({username: req.body.username}, function(err, doc){
		if(err){
			return res.send(500, 'Internal Server Error')
		}

		if(!doc){
			req.flash('log-in-error', 'Invalid user')
			return res.redirect('/log-in')
		}

		bcrypt.compare(req.body.password, doc.password, function(err, result){
			if(err){
				return res.send(500, 'Internal Server Error')
			}

			req.session.userId = doc.uuid
			res.redirect('/')
		})
	})
})

app.get('/env', function(req, res){
	res.send(process.env)
})

var port = 3000
// En caso de que nos encontremos en un ambiente de producción, leemos la variable de entorno
if (process.env.NODE_ENV === 'production') {
	port = process.env.PORT
}

// Termina la declaracion de url handlers
app.listen(port, function () {
	console.log('Example app listening on port '+port+'!')
})