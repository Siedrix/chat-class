var express = require('express');
var mongoose = require('mongoose');

var Messages = mongoose.model('Message')

var router = express.Router();  

router.all('*', function (req, res, next) {
	if(!res.locals.user){
		return res.send(403, 'Forbidden')
	}

	next()
})

router.get('/', function(req, res){
	Messages.find({})
	.populate('user')
	.exec(function(err, docs){
		if(err){
			return res.send(500, 'Internal server error')
		}

		var publicDocs = docs.map(function(item){
			var data = item.toJSON()

			data.user = data.user.username
			return data
		})

		res.send(publicDocs)
	})
})

router.post('/', function(req, res){
	Messages.create({
		content: req.body.content,
		user: res.locals.user
	}, function(err, doc){
		if(err){
			return res.send(500, 'Internal server error')
		}

		var data = doc.toJSON()

		data.user = data.user.username
		res.send(data)
	})
})

router.put('/:uuid', function(req, res){
	Messages.findOne({uuid: req.params.uuid}, function(err, doc){
		if(err){
			return res.send(500, 'Internal server error')
		}

		if(!doc){
			return res.send(404, 'Not found')
		}

		if( !doc.user.equals( res.locals.user._id ) ) {
			return res.send(403, 'Not found')
		}

		doc.content = req.body.content

		doc.save(function(){
			if(err){
				return res.send(500, 'Internal server error')
			}

			var data = doc.toJSON()

			data.user = data.user.username
			res.send(data)
		})
	})
})

router.delete('/:uuid', function(req, res){
	Messages.findOne({uuid: req.params.uuid}, function(err, doc){
		if(err){
			return res.send(500, 'Internal server error')
		}

		if(!doc){
			return res.send(404, 'Not found')
		}

		if( !doc.user.equals( res.locals.user._id ) ) {
			return res.send(403, 'Not found')
		}

		doc.remove(function(){
			if(err){
				return res.send(500, 'Internal server error')
			}

			res.send({success: true})
		})
	})
})

module.exports = router;