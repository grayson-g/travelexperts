const express   = require("express");
const mysql     = require("mysql2");
const path      = require("path");
const port      = process.env.PORT || 3000;

const app       = express();

const dbc       = mysql.createConnection({
    host:       "dbaas-db-6177002-do-user-14227005-0.b.db.ondigitalocean.com",
    user:       "doadmin",
    port:       25060,
    password:   "AVNS_nVWX9ncDGAfn6igOvYV",
    database:   "travelexperts"
});

app.use(express.urlencoded({"extended": true}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/css", express.static(path.join(__dirname, "node_modules", "bootstrap", "dist", "css")));

app.use("/media", express.static(path.join(__dirname, "media")));

app.get("/favicon.ico", (req, res) =>
{
    console.log("Sending file: " + path.join(__dirname, "favicon.ico"));
    res.sendFile(path.join(__dirname, "favicon.ico"));
});

app.get("/", (req, res) =>
{
    res.redirect("/contacts");
});

app.get("/packages", (req, res) =>
{
    res.render("packages", {packages: []});
    dbc.connect((err) =>
    {
        if (err)
        {
            console.log("Error connecting to DB:");
            console.log(err.stack);
            res.status(500).render("status", {status: 500, message: "Uh oh!"});
        }

        dbc.end();
    });
});

app.get("/registration",(req,res)=>{
	res.render("registerform", {"myTitle": "Registration Page"});
});

app.get("/contacts", (req, res) =>{
	
	dbc.connect((err)=>{
		if (err)
        {
            res.status(500).render("status", {status: 500, message: "Uh oh!"});
        }
		dbc.query("select * from agents where AgtPosition='Junior Agent'", (err, result) =>{
			if (err)
            {
                res.status(500).render("status", {status: 500, message: "Uh oh!"});
                dbc.end();
            }
			var Str = "";
			for (i = 0; i<result.length; i++){
				var temp = result[i];
				Str += temp.AgtFirstName + " " + temp.AgtLastName + ", " + temp.AgtBusPhone + ", " + temp.AgtEmail;
				if (i != result.length-1) Str += "; ";
	 		
			}
			dbc.end();
	 	res.render("contacts", {"contacts":""});
        });
	});
});

app.get("/getinsertform", (req, res) =>{
	res.render("insertform", {"myTitle":"Insert Form"});
});

app.get("/getupdateform/:id", (req, res) =>{
	// var DBH = getDBH();
	// DBH.connect((err) =>{
	// 	if(err) throw err;
	// 	console.log(req.params.id);
	// 	var sql = "select * from agents where AgentId=?";
	// 	DBH.query({"sql":sql, "values":[req.params.id]}, (err, result, fields) =>{
	// 		if (err) throw err;
	// 		console.log(result);
			res.render("updateform", {"myTitle":"Update Form", "agent":""});
		// });
	// });
});

app.use((req, res, next) =>
{
    console.log("404: " + req.url);
    res.render("status", {status: 404, message: "Sorry, that page doesn't exist"});
});

app.listen(port, () => { console.log("Listening on port: " + port); });
