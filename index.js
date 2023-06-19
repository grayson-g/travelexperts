/*
 * Team #3 -- OOSD Threaded Project Part 1
 * index.js
 * 
 * This file contains the server application for the Travel Experts website.
 *
 * Authors: Calvin Chen, Cameron Cote, Grayson Germsheid, Alisa Kim
 * 
 * Each group member implemented their own endpoints / database queries for
 * the pages they created and they have been merged together into this file.
 * The merging was done by Grayson, and the authors of each function have 
 * been commented above the function
 */
const express   = require("express");
const mysql     = require("mysql2");
const path      = require("path");
const port      = 8000;

/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
/* !!!!! MAKE SURE TO ENTER YOUR DATABASE CREDENTIALS FOR TESTING !!!!!!!!!!! */
/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
const secrets   = require("./secrets");

const app       = express();

const dbc       = mysql.createPool({
    host:       secrets.host,
    user:       secrets.user,
    port:       secrets.port,
    password:   secrets.pass,
    database:   "travelexperts",
    connectionLimit:    10,
    idleTimeout:        60000,
    enableKeepAlive:    true,
});

app.use(express.urlencoded({"extended": true}));
app.use(express.json());

// Use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/css", express.static(path.join(__dirname, "css")));
// We use bootstrap as an NPM module, so we make it discoverable under /css route
app.use("/css", express.static(path.join(__dirname, "node_modules", "bootstrap", "dist", "css")));

app.use("/media", express.static(path.join(__dirname, "media")));

app.get("/favicon.ico", (req, res) =>
{
    console.log("Sending file: " + path.join(__dirname, "favicon.ico"));
    res.sendFile(path.join(__dirname, "favicon.ico"));
});

//  /home page      -- Alisa Kim
app.get("/home", (req, res) =>
{
    res.render("mainpage");
    //res.sendFile(path.join(__dirname, "views", "mainpage.html")); 
});

app.get("/", (req, res) =>
{
    res.redirect("/home");
});

//  /packages page  -- Grayson Germsheid
app.get("/packages", (req, res) =>
{
    var packages = [];
    var timefmt = new Intl.DateTimeFormat('en-CA',
        {
            day:    "2-digit",
            month:  "short",
            year:   "numeric"
        });
    var dbfmt = new Intl.DateTimeFormat('default',
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    
    // var dbnow = dbfmt.formatToParts(new Date());
    // dbnow = dbnow.year + "-" + dbnow.month + "-" + dbnow.day + " " + dbnow.hour + ":" + dbnow.minute + ":" + dbnow.second;
    // console.log("NOW IS: " + dbnow);
    var dbnow = new Date();
    dbnow = dbnow.toISOString();
    dbnow = dbnow.replace(/t/i, " ");
    dbnow = dbnow.replace(/\..*/, "");
    /*
     * Query the database for all packages, passing them as an array to
     * the EJS render function.
     *
     * The mysql pool (dbc) automatically creates and ends the connection
     */
    // let sql = "SELECT * FROM packages WHERE PkgStartDate >= ?;";
    let sql = "SELECT * FROM packages WHERE PkgStartDate >= ?;";
    dbc.query(sql, [dbnow], (err, rows, fields) => {
        if (!err)
        {
            if (rows.length === 0)
            {
                console.log("0 packages found with PkgStartDate >= " + new Date());
            }
            for (let i = 0; i < rows.length; i++)
            {
                let package = rows[i];
                packages[i] = {
                    name:   package.PkgName,
                    sdate:  timefmt.format(package.PkgStartDate),
                    edate:  timefmt.format(package.PkgEndDate),
                    desc:   package.PkgDesc,
                    bprice: Math.round(package.PkgBasePrice),
                    cprice: Math.round(package.PkgAgencyCommission),
                    price:  Math.round(
                                parseInt(package.PkgBasePrice)
                             +  parseInt(package.PkgAgencyCommission)),
                    id:     package.PackageId
                }
            }
        }
        else
        {
            console.log("Query Failed! \"" + sql + "\"");
            console.log("Query Error: " + err.stack);
        }

        res.render("packages", {packages: packages});
    });
});

// Orders page -- Grayson Germsheid
app.get("/packages/:id", (req, res) =>
{
    // Format the time on the server -- should be done locally
    var timefmt = new Intl.DateTimeFormat('en-CA',
        {
            day:    "2-digit",
            month:  "short",
            year:   "numeric"
        });

    let sql = "SELECT * FROM packages WHERE PackageId = " + req.params.id + ";";
    dbc.query(sql, (err, rows, fields) => {
        if (err)
        {
            // DB Error
            console.log("Query Failed! \"" + sql + "\"");
            console.log("Query Error: " + err.stack);
        }
        else if (rows.length == 0)
        {
            // Package w/ ID doesn't exist
            res.status(404).render("status", 
                {
                    status: 404,
                    colour: "#E71D36",
                    message: "Sorry, that package doesn't seem to exist",
                    redirect: false
                });
            return;
        }

        let package_row = rows[0];
        if (new Date(package_row.PkgEndDate) < new Date())
        {
            // Package start date < current date
            res.status(401).render("status", 
                {
                    status: "Unavailable",
                    colour: "#003F91",
                    message: "Sorry, that package is no longer available",
                    redirect: false
                });
            return;
        }

        res.render("order", {
            package: 
            {
                    name:   package_row.PkgName,
                    sdate:  timefmt.format(package_row.PkgStartDate),
                    edate:  timefmt.format(package_row.PkgEndDate),
                    desc:   package_row.PkgDesc,
                    bprice: Math.round(package_row.PkgBasePrice),
                    cprice: Math.round(package_row.PkgAgencyCommission),
                    price:  Math.round(
                                parseInt(package_row.PkgBasePrice)
                             +  parseInt(package_row.PkgAgencyCommission)),
                    id:     package_row.PackageId
            },
            trip_types: [
                {
                    id:     "B",
                    name:   "Business"
                },
                {
                    id:     "L",
                    name:   "Leisure"
                },
                {
                    id:     "G",
                    name:   "Group"
                }
            ]});
    });
});

// Order confirmation page -- Grayson Germsheid
// This _should_ insert a package into the bookings table, but that functionality
// isn't actually implemented
app.post("/packages/:id/order", (req, res, next) =>
{
    console.log("Received post: %j", req.body);
    res.status(202).render("status",
        {   
            status: "Thanks!", 
            colour: "#9BC53D",
            message: "You should receive a confimation email with you booking number soon.",
            redirect: true
        });
});

//  /login page     -- Calvin Chen
app.get("/login",(req,res)=>{
	res.render("login", {"myTitle": "Login page"});
});

//  /registration page -- Calvin Chen
app.get("/registration", (req,res) =>
{
	res.render("registerform", {"myTitle": "Registration Page"});
});

// /register endpoint -- Calvin Chen
app.post("/register", (req, res) =>
{
    var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustAddress`, `CustCity`, `CustProv`, `CustPostal`, `CustCountry`, `CustHomePhone`, `CustBusPhone`, `CustEmail`) VALUES (?,?,?,?,?,?,?,?,?,?)";
    var data = [ req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress, req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone, req.body.CustEmail];
    dbc.query({"sql": sql, "values": data}, (err, result, fields) =>
    {
        if (err)
        {
            console.log("DB Connection Error: " + err.stack);
            res.status(500).render("status", 
                {
                    status: 500,
                    colour: "#E71D36",
                    message: "Sorry, something went wrong",
                    redirect: false
                });
            return;
        }

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
    });
});

//  /contacts page -- Cameron Cote
app.get("/contacts", (req, res) =>
{
	dbc.query("select * from agents", (err, result) =>{
		if (err)
        {
            res.status(500).render("status", 
                {
                    status: 500,
                    colour: "#E71D36",
                    message: "Sorry, something went wrong",
                    redirect: false
                });
            return;
        }
		var Str = "", Str2 = "";
		for (i = 0; i<result.length; i++){
			var temp = result[i];
			if (temp.AgencyId == "1") {
				Str += temp.AgtFirstName + " " + temp.AgtLastName + ", " + temp.AgtBusPhone + ", " + temp.AgtEmail + "; ";
			}
			else if(temp.AgencyId == 2) {
				Str2 += temp.AgtFirstName + " " + temp.AgtLastName + ", " + temp.AgtBusPhone + ", " + temp.AgtEmail + "; ";
			}
					
		}
		dbc.query("select * from agencies", (err, result) =>{
            if (err)
            {
                res.status(500).render("status", 
                    {
                        status: 500,
                        colour: "#E71D36",
                        message: "Sorry, something went wrong",
                        redirect: false
                    });
                return;
            }
			Str = "Agency 1, "+ result[0].AgncyPhone + ", "+result[0].AgncyAddress + " " + result[0].AgncyCity + " " + result[0].AgncyProv + " " + result[0].AgncyCountry + "; " + Str;
			Str2 = "Agency 2, "+ result[1].AgncyPhone + ", "+result[1].AgncyAddress + " " + result[1].AgncyCity + " " + result[1].AgncyProv + " " + result[1].AgncyCountry + "; " + Str2;
			res.render("contacts", {"contacts":Str+Str2});
		});
	}); 
});

//  404 handling -- Grayson Germsheid
app.use((req, res, next) =>
{
    console.log("404: " + req.url);
    res.status(404).render("status", 
        {
            status: 404,
            colour: "#E71D36",
            message: "Sorry, that page doesn't seem to exist",
            redirect: false
        });
});

app.listen(port, () => { console.log("Listening on port: " + port); });
