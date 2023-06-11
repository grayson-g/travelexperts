//load modules
const express = require("express");
const fs = require("fs");
const mysql = require ("mysql");
const path = require("path");

//listen
const app = express();
app.listen(8000, (err) => {
	if (err) throw err;
	console.log("server is currently running.");
});
//set up directory
app.use(express.static(path.join(__dirname, "views"),
{"extensions":["html","htm"]}));

app.use(express.static(path.join(__dirname, "public"), 
{"extensions":["css", "js"]}));

app.use(express.static(path.join(__dirname, "media"), 
{"extensions":["gif","png","jpg"]}));

//setup media, encode, and engine set ejs
app.use(express.static("media", {"extensions": ["gif", "jpg", "png"]}));
app.use(express.urlencoded({"extended": true}));
app.set("view engine", "ejs");

//login
function getDBH ()
{
		return mysql.createConnection({
		host: "localhost",
		user: "admin",
		password: "password",
		database: "travelexperts"
	});
}

//load pages
app.get("/registration",(req,res)=>{
	res.render("registerform", {"myTitle": "Registration Page"});
});



app.post("/register",(req, res)=>{
	var dbh = getDBH();
		
	dbh.connect((err)=>{
		if (err) throw err;
		//insert customer data
		var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustAddress`, `CustCity`, `CustProv`, `CustPostal`, `CustCountry`, `CustHomePhone`, `CustBusPhone`, `CustEmail`) VALUES (?,?,?,?,?,?,?,?,?,?)";
		var data = [ req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress, req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone, req.body.CustEmail];
		dbh.query({"sql": sql, "values": data}, (err, result)=>{
			if (err) throw err;
			console.log(result);
			var message = "";
			if (result.affectedRows == 0)
			{
				message = "Registeration failed.";
			}
			else
			{
				message = "Account registered successfully.";
			}
			res.render("thanks", { "myTitle": "Confirmation", "message": message });
				
			dbh.end((err)=>{
				if (err) throw err;
				console.log("disconnected from the database");
			});
		});
	});
});

