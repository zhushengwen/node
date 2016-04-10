var redis   = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');
client.on("error", function (err) {  
    console.log("Error " + err);  
});


client.on("connect", runSample);
 
function runSample() {

	var key = 'incr_test';
    // Set a value
    client.incr(key,function (err, reply) {
        console.log(reply);
		// Get a value
		client.get(key, function (err, reply) {
			console.log(reply.toString());
			process.exit();
		});
    });
    
}