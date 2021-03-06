//import the mongodb native drivers.
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url_mongo = 'mongodb://172.16.100.139:27017/test'	;
// Use connect method to connect to the Server
//read data from DB
//var test_str = '{ "_id": 4, "lati": 57.916336, "longi": 63.431212 }';
//var user_data= JSON.parse(test_str);
var url = require( "url" );
var queryString = require( "querystring" );
var http = require('http');


http.createServer(function(req, res)
{
    if (req.method == 'POST') 
    {
        var jsonString = '';
        req.on('data', function (data) 
        {
            jsonString += data;
        });
        req.on('end', function ()
        {
            console.log(jsonString);
            var user_data = JSON.parse(jsonString);
            // coll_users.find({email: user_data.email}).toArray(function (err, result)
            // if (err)
            // {
            // 	console.log(err);
            // } 
            // else if (result.length) 
            // {
            // 	var flag = result.isActive;
            // }

            console.log(user_data);
    		MongoClient.connect(url_mongo, function (err, db)
    		{
				if (err) 
				{
					console.log('Unable to connect to the mongoDB server. Error:', err);
				}
				else 
				{		
						var coll_users = db.collection('users');
						var coll_ambulances = db.collection('ambulances');
						var event_id = 5;

						coll_users.count(function(err, count) {
					        // assert.equal(null, err);
					        event_id = count;
					        console.log("count ",event_id);
					        // console.log("err ",err);
					        // db.close();
					    });


					// var collections = db.collectionNames();

					// // print('Collections inside the db:');
					// for(var i = 0; i < collections.length; i++){
					//   var name = collections[i];

					//   if(name.substr(0, 6) != 'system')
					//     console.log(name + ' - ' + db[name].count() + ' records');
					// }


				    //HURRAY!! Connected :)

				    console.log('Connection established to', url);
				    if(Object.keys(user_data).length==1)//User app sends Ambulance Id..So return position of that ambulance only by querying DB
					{
						// Get the documents collection
						var collection = db.collection('ambulances');
						collection.find({_id: user_data.id}).toArray(function (err, result) 
						{
							if (err)
							{
								console.log(err);
							} 
							else if (result.length) 
							{
								var alloted_ambulance = result[0];//only onddddddde element will be there
								console.log(alloted_ambulance);
								res.write(JSON.stringify(alloted_ambulance));
							}
							else 
							{
								console.log('\nNo document(s) found with defined "find" criteria!');
							}
							//Close connection
							res.end();
						    db.close();
						});
					}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					// else if(flag == 1){

					// }
				    else
				    {
				    	//Send User_Data to Kibana Server
				    	var request = new http.ClientRequest({
						    hostname: "172.16.100.139",
						    port: 9200,
						    path: "/btp108/trial/",
						    method: "POST",
						    headers: {
						        "Content-Type": "application/json",
						        "Content-Length": Buffer.byteLength(JSON.stringify(user_data))
						    }
						})	
						request.end(JSON.stringify(user_data));
						//Send User_Data to Kibana Server END
				    	var collection = db.collection('ambulances');
						collection.find().toArray(function (err, result)
						{
							if (err) 
							{
								console.log(err);
							} 
							else if (result.length)
							{	
								var mini_dist = 10000.999;
								var best_ambulance_id = 0;
								var best_ambulance;
								for(var i =0; i<result.length;i++)
								{																			
									var temp_ambulance  = result[i];
									var dist = Math.sqrt( Math.pow((temp_ambulance.lati-user_data.lati),2) + Math.pow((temp_ambulance.longi-user_data.longi),2) );
									// changed to false // add corner case
									if(dist<mini_dist && temp_ambulance.isActive == false)
									{
										mini_dist = dist;
										best_ambulance = temp_ambulance;
										best_ambulance_id = temp_ambulance._id;
										console.log("minimum dist is ",mini_dist);
									}
								}
								res.write(JSON.stringify(best_ambulance));
								console.log("best ambulance id is: ",best_ambulance_id);
								console.log("best ambulance tuple is: ",best_ambulance);



								console.log("Event idd: ", event_id);

								var email = user_data.email;
								var name = user_data.name;
								var contact = user_data.contact;
								var lati = user_data.lati;
								var longi = user_data.longi;
								var time =  new Date();
								var amb_id = best_ambulance_id;
								var beingServed = true;

								var json_object = {
									eventId: event_id,
									email: email,
									name: name,
									contact: contact,
									lati: lati,
									longi: longi,
									time: time,
									amb_id: amb_id,
									beingServed: beingServed
								};

								coll_users.insert(json_object);
							} 
							else 
							{
								console.log('\nNo ambulance(s) found with defined "find" criteria!');
							}
							//Close connection
							res.end();
						    db.close();
						});
					}
				}
			});
        });
    }
}).listen(3000);
