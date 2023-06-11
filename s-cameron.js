const express = require("express");
const mysql = require("mysql");

const app = express();
app.listen(8000, (err) => {
	if (err) throw "Nope";
	console.log("running.");
});

app.set("views", __dirname + "/views");
app.use(express.static("./images", {"extensions":["png", "jpg", "gif"]}));
app.use(express.static("./public", {"extensions":["css"]}));
app.use(express.urlencoded({"extended": true}));
app.set("view engine", "ejs");

function getDBH(){
	return mysql.createConnection({"host":"localhost", "user":"Pay", "password":"Settings", "database":"travelexperts"});
}

app.get("/", (req, res)=>{
	res.render("main");
});

//This is the main part we are looking for, this handles my contacts page.
//It calls the getDBH function and makes a connection to the return.
//We then request all fields from agents when their position is equal to Junior Agent.
//Aftwards we concatinate their name, phone, and email onto the Str variable, and if it isn't the last agent in the list it adds a comma.
//After we are done in the for loop it closes the database connection, renders the page for the user to view, passing in the string Str we created as contacts to be used
//by the webpage. 
//My webpage has a javascript to split the string based on commas and semi-colins. which you can check out near the end of the page.
app.get("/contacts", (req, res) =>{
	
	var DBH = getDBH();
	DBH.connect((err)=>{
		if (err) throw err;
		DBH.query("select * from agents where AgtPosition='Junior Agent'", (err, result) =>{
			if (err) throw err;
			var Str = "";
			for (i = 0; i<result.length; i++){
				var temp = result[i];
				Str += temp.AgtFirstName + " " + temp.AgtLastName + ", " + temp.AgtBusPhone + ", " + temp.AgtEmail;
				if (i != result.length-1) Str += "; ";
				
			}
			DBH.end();
			res.render("contacts", {"contacts":Str});
		})
	});
});

app.get("/getinsertform", (req, res) =>{
	res.render("insertform", {"myTitle":"Insert Form"});
});

app.get("/getupdateform/:id", (req, res) =>{
	var DBH = getDBH();
	DBH.connect((err) =>{
		if(err) throw err;
		console.log(req.params.id);
		var sql = "select * from agents where AgentId=?";
		DBH.query({"sql":sql, "values":[req.params.id]}, (err, result, fields) =>{
			if (err) throw err;
			console.log(result);
			res.render("updateform", {"myTitle":"Update Form", "agent":result});
		});
	});
});

app.post("/insert", (req, res) =>{
	var DBH = getDBH();
	DBH.connect((err) =>{
		if(err) throw err;
		var sql = "INSERT INTO `agents`(`AgentId`, `AgtFirstName`, `AgtMiddleInitial`, `AgtLastName`, `AgtBusPhone`, `AgtEmail`, `AgtPosition`, `AgencyId`) "+
		"VALUES (0,?,?,?,?,?,?,?)";
		var data = [req.body.AgtFirstName, req.body.AgtMiddleInitial, req.body.AgtLastName, req.body.AgtBusPhone, req.body.AgtEmail, req.body.AgtPosition, req.body.AgencyId];
		DBH.query({"sql":sql, "values":data}, (err, result) =>{
			if (err) {
				res.render("submitPage", {"myTitle":"Failed!", "didSucceed":"Failed to add.", "message":"Thank you for your submission, it unfortunately wasn't added.", "failmessage":err+""})
			}
			res.render("submitPage", {"myTitle":"Success!", "didSucceed":"Successfully Added", "message":"Thank you for your submission, it has been added.", "failmessage":""})
			DBH.end();
			
		});
	});
});

app.post("/update", (req, res) =>{
	var DBH = getDBH();
	DBH.connect((err) =>{
		if(err) throw err;
		var sql = "UPDATE `agents` SET `AgtFirstName`=?, `AgtMiddleInitial`=?, `AgtLastName`=?, `AgtBusPhone`=?, `AgtEmail`=?, `AgtPosition`=?, `AgencyId`=? WHERE `AgentId`=?"
		var data = [req.body.AgtFirstName, req.body.AgtMiddleInitial, req.body.AgtLastName, req.body.AgtBusPhone, req.body.AgtEmail, req.body.AgtPosition, req.body.AgencyId, req.body.AgentId];
		DBH.query({"sql":sql, "values":data}, (err, result) =>{
			if (err) {
				res.render("submitPage", {"myTitle":"Failed!", "didSucceed":"Failed to add.", "message":"Thank you for your submission, it unfortunately wasn't updated.", "failmessage":err+""})
			}
			res.render("submitPage", {"myTitle":"Success!", "didSucceed":"Successfully Added", "message":"Thank you for your submission, it has been added.", "failmessage":""})
			DBH.end();
			
		});
	});
});
