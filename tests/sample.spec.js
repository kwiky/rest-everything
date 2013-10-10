var frisby = require('frisby');
var config = require('../config');

var testModel = 'tests';
var host = 'localhost';

var itemSpecimen = {item:"jasmine"};
var itemSpecimenModified = {item:"jasmine-modified"};

var resource = 'http://' + host + ':' + config.server.port + '/' + testModel;
var resourceAuth = 'http://test:test@' + host + ':' + config.server.port + '/' + testModel;
var resourceNotEnabled = 'http://test:test@' + host + ':' + config.server.port + '/resourceNotEnabled';

if (config.auth) {
	frisby.create('Server should NOT respond to GET all without auth')
	  .get(resource)
	  .expectStatus(401)
	.toss();

	resource = resourceAuth;
}

if (config.resources) {
	frisby.create('Server should NOT respond to GET resource not enabled')
	  .get(resourceNotEnabled)
	  .expectStatus(403)
	.toss();
}

frisby.create('Server should respond to POST')
  .post(resource, itemSpecimen)
  .expectStatus(201)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON(itemSpecimen)
  .afterJSON(function(item) {
  	itemId = item._id;
  	frisby.create('Server should respond to GET all')
	  .get(resource)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength('', '> 0')	  
	  .afterJSON(function(item) {
		frisby.create('Server should respond to GET some')
		  .get(resource + '?item=' + itemSpecimen.item)
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .expectJSONLength('', '> 0')	  
		  .afterJSON(function(item) {
			frisby.create('Server should respond to GET one')
			  .get(resource + '/' + itemId)
			  .expectStatus(200)
			  .expectHeaderContains('content-type', 'application/json')  
			  .afterJSON(function(item) {
				frisby.create('Server should respond to PUT one')
				  .put(resource + '/' + itemId, itemSpecimenModified)
				  .expectStatus(200)
				  .expectHeaderContains('content-type', 'application/json')			   
				  .afterJSON(function(item) {
					frisby.create('Server should respond to DELETE one')
					  .delete(resource + '/' + itemId)
					  .expectStatus(200)		  		   
					  .after(function() {
						frisby.create('Server should respond to DELETE all')
						  .delete(resource)
						  .expectStatus(200)
						  .after(function() {
							frisby.create('Server should respond to GET all')
							  .get(resource)
							  .expectStatus(200)
							  .expectHeaderContains('content-type', 'application/json')
							  .expectJSONLength('', 0)
							.toss();
						  })
						.toss();
					  })
					.toss();
				  })
				.toss();
			  })
			.toss();
		  })
		.toss();
	  })
	.toss();
  })
.toss();