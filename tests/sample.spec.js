var frisby = require('frisby');

var testModel = 'tests';
var host = 'localhost';

var itemSpecimen = {item:"specimen"};
var itemSpecimenModified = {item:"jasmine"};

var resource = 'http://' + host + '/' + testModel;

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