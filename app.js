var restify = require('restify')
  , Db = require('mongodb').Db
  , mdbServer = require('mongodb').Server
  , config = require('./config')
  , server = require('./server')
  , service = require('./service');

var db = new Db(config.database.databaseName, new mdbServer(config.database.host, config.database.port), config.database.options);

// Open your mongodb database.
db.open(function (error, dbConnection) {
	if (error == null) {
		// Authenticate to database
		dbAuthenticate(config.database, function(err, result) {
			console.log("MongoDb is connected");
			lService = service.init(config, dbConnection);
			lServer = server.create(config, lService);
		});
	} else {
		console.log(error);
	}
});

function dbAuthenticate(configDatabase, callback) {
	if (configDatabase.user) {
		db.authenticate(configDatabase.user, configDatabase.password, function(err, result) {
			callback(err, result);
		});
	} else {
		callback();
	}
}