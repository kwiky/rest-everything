var restify = require('restify')
  , auth = require('http-auth');

var config = null;
var service = null;

module.exports = {
	create: create
}

function create(vConf, vService) {
	config = vConf;
	service = vService;
	var server = restify.createServer({name: 'api'});

	server
	  .use(restify.fullResponse())
	  .use(restify.bodyParser())		  
	  .use(restify.queryParser());

	if (config.auth) {
		server.use(auth.connect(config.auth));
	}

	server.listen(config.server.port, config.server.host, function () {
		console.log('%s listening at %s', server.name, server.url);
	});

	server.get('/', function (req, res, next) {
		var data = {
			message:"Welcome !"
		}
		res.send(data);
	});

	server.get('/:model', function (req, res, next) {
		checkResource(req.params.model, res, function(modelSave, res) {
			delete req.params.model;
			service.find(modelSave, req.query, function (error, items) {
				res.send(items);
			});
		});
	});

	server.post('/:model', function (req, res, next) {
		checkResource(req.params.model, res, function(modelSave, res) {
			delete req.params.model; 
		 	service.create(modelSave, req.params, function (error, item) {
		    	if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors))); 
		    	res.send(201, item);
		  	});
	  	});
	});

	server.get('/:model/:_id', function (req, res, next) {
		checkResource(req.params.model, res, function(modelSave, res) {
			service.findOne(modelSave, { _id: req.params._id }, function (error, item) {
				if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors))); 
				if (item) {
					res.send(item);
				} else {
					res.send(404);
				}
			});
		});
	});

	server.put('/:model/:_id', function (req, res, next) {
		checkResource(req.params.model, res, function(modelSave, res) {	
			delete req.params.model;
			service.update(modelSave, req.params, function (error, item) {
				if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
				res.send(item);
			});
		});
	});

	server.del('/:model/:_id', function (req, res, next) {
		checkResource(req.params.model, res, function(modelSave, res) {
			delete req.params.model;
			service.del(modelSave, req.params._id, function (error, item) {
				if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));		 
				res.send(204);
			});
		});
	});

	server.del('/:model', function (req, res, next) {
		checkResource(req.params.model, res, function(modelSave, res) {
			delete req.params.model;
			service.del(modelSave, req.params, function (error, item) {
				if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));		 
				res.send(204);
			});
		});
	});
}

function checkResource(modelName, res, callback) {
	if (config.resources && config.resources.indexOf(modelName) == -1) {
		console.log("Resource " + modelName + " not authorized");
		res.send(403);
	} else {
		service.getModelSave(modelName, function(modelSave) {
			callback(modelSave, res);
		});
	}
}