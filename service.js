var save = require('save')
  , saveMongodb = require('save-mongodb');

module.exports = {
	init: init,
	getModelSave: getModelSave,
	find: find,
	findOne: findOne,
	create: create,
	update: update,
	del: del
}

var modelsSave = [];
var dbConnection = null;

function init(vConf, vDbConnection) {
	dbConnection = vDbConnection;
	return this;
}

function getModelSave(model, callback) {
	if (modelsSave[model] == null) {
		// Get a collection. This will create the collection if it doesn't exist.
		dbConnection.collection(model, function (error, collection) {
			// Create a save object and pass in a mongodb engine.
			modelsSave[model] = save(model, { engine: saveMongodb(collection) });
			// Create the collection
			modelsSave[model].create({item:"specimen"}, function(error, item) {
				modelsSave[model].deleteMany({item:"specimen"}, function(error, item) {
					console.log("Collection created");
					callback(modelsSave[model]);
				});
			});
		});
	} else {
		callback(modelsSave[model]);
	}
}

function find(model, query, callback) {
	model.find(query, function (error, items) {
		callback(error, items);
	});
}

function findOne(model, query, callback) {
	model.findOne(query, function (error, item) {
		callback(error, item);
	});
}

function create(model, data, callback) {
	model.create(data, function (error, item) {
		callback(error, item);
	});
}

function update(model, data, callback) {
	model.update(data, function (error, item) {
		callback(error, item);
	});
}

function del(model, query, callback) {
	model.delete(query, function (error, item) {
		callback(error, item);
	});
}