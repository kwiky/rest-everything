var restify = require('restify')
  , Db = require('mongodb').Db
  , Server = require('mongodb').Server
  , save = require('save')
  , saveMongodb = require('save-mongodb')
  , auth = require('http-auth')
  , config = require('./config');

var db = new Db('api', new Server(config.database.host, config.database.port, {}));
var connection = null;
var server = null;

var modelsSave = [];

// Open your mongodb database.
db.open(function (error, c) {
	if (error == null) {
		console.log("MongoDb is connected");
		connection = c;
		server = restify.createServer({name: 'api'});

		server
		  .use(restify.fullResponse())
		  .use(restify.bodyParser());		  

		if (config.server.auth) {
			server.use(auth.connect(config.auth));
		}

		server.listen(config.server.port, function () {
			console.log('%s listening at %s', server.name, server.url);
		});

		server.get('/:model', function (req, res, next) {
		  modelSave = getModelSave(req.params.model);
		  modelSave.find({}, function (error, items) {
		    res.send(items);
		  });
		});

		server.post('/:model', function (req, res, next) {
		  modelSave = getModelSave(req.params.model);
		  delete req.params.model; 
		  modelSave.create(req.params, function (error, item) {
		    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors))); 
		    res.send(201, item);
		  });
		});

		server.get('/:model/:_id', function (req, res, next) {
		  modelSave = getModelSave(req.params.model);
		  modelSave.findOne({ _id: req.params._id }, function (error, item) {
		    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors))); 
		    if (item) {
		      res.send(item);
		    } else {
		      res.send(404);
		    }
		  });
		});

		server.put('/:model/:_id', function (req, res, next) {		  
		  modelSave = getModelSave(req.params.model);
		  delete req.params.model;
		  modelSave.update(req.params, function (error, item) {
		    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
		    res.send(item);
		  });
		});

		server.del('/:model/:_id', function (req, res, next) {
		  modelSave = getModelSave(req.params.model);
		  modelSave.delete(req.params._id, function (error, user) {
		    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));		 
		    res.send();
		  });
		});

		server.del('/:model', function (req, res, next) {
		  modelSave = getModelSave(req.params.model);
		  delete req.params.model;
		  modelSave.delete(req.params, function (error, user) {
		    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));		 
		    res.send();
		  });
		});
	} else {
		console.log(error);
	}
});

function getModelSave(model) {
	if (modelsSave[model] == null) {
		// Get a collection. This will create the collection if it doesn't exist.
		connection.collection(model, function (error, collection) {
			// Create a save object and pass in a mongodb engine.
			modelsSave[model] = save(model, { engine: saveMongodb(collection) });
			// Create the collection
			modelsSave[model].create({item:"specimen"}, function(error, item) {
				modelsSave[model].deleteMany({item:"specimen"}, function(error, item) {
					console.log("Collection created");
				});
			});
		});
	}
	return modelsSave[model];
}