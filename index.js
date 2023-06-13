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
const port      = process.env.PORT || 3000;

const secrets   = require("./secrets");

const app       = express();

const dbc       = mysql.createPool({
    host:       secrets.host,
    user:       secrets.user,
    port:       25060,
    password:   secrets.pass,
    database:   "travelexperts",
    connectionLimit:    10,
    idleTimeout:        60000,
    enableKeepAlive:    true,
});

app.use(express.urlencoded({"extended": true}));

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
    res.sendFile(path.join(__dirname, "views", "mainpage.html")); 
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

    /*
     * Query the database for all packages, passing them as an array to
     * the EJS render function.
     *
     * The mysql pool (dbc) automatically creates and ends the connection
     */
    let sql = "SELECT * FROM packages;";
    dbc.query(sql, (err, rows, fields) => {
        if (!err)
        {
            for (let i = 0; i < rows.length; i++)
            {
                let package = rows[i];
                packages[i] = {
                    name:   package.PkgName,
                    sdate:  timefmt.format(package.PkgStartDate),
                    edate:  timefmt.format(package.PkgEndDate),
                    desc:   package.PkgDesc,
                    price:  Math.round(package.PkgBasePrice),
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

app.get("/order/package/:id", (req, res) =>
{
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
            console.log("Query Failed! \"" + sql + "\"");
            console.log("Query Error: " + err.stack);
        }
        else if (rows.length == 0)
        {
            res.render("package-error", {message: "Sorry, that package doesn't seem to exist"});
            return;
        }

        let package_row = rows[0];
        if (new Date(package_row.PkgEndDate) < new Date())
        {
            res.render("package-error", {message: "Sorry, that package is no longer available"});
            return;
        }

        res.render("order", {
            package: 
            {
                    name:   package_row.PkgName,
                    sdate:  timefmt.format(package_row.PkgStartDate),
                    edate:  timefmt.format(package_row.PkgEndDate),
                    desc:   package_row.PkgDesc,
                    price:  Math.round(package_row.PkgBasePrice),
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
            res.status(500).render("status", {status: 500, message: "Uh oh!"});
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
    dbc.query("SELECT * FROM agents", (err, result, fields) =>
    {
        if (err)
        {
            console.log("DB Query Error: " + err.stack);
            res.status(500).render("status", {status: 500, message: "Uh oh!"});
            return;
        }

        console.log("DB Query success");
        console.log("Results: " + result);

        var db_string = "";
        for (i = 0; i<result.length; i++){
            var temp = result[i];
            db_string += temp.AgtFirstName + " " + temp.AgtLastName + ", " + temp.AgtBusPhone + ", " + temp.AgtEmail;
            if (i != result.length-1) db_string += "; ";
        }
        res.render("contacts", {"contacts": db_string});
    });
});

//  404 handling -- Grayson Germsheid
app.use((req, res, next) =>
{
    console.log("404: " + req.url);
    res.render("status", {status: 404, message: "Sorry, that page doesn't exist"});
});

app.listen(port, () => { console.log("Listening on port: " + port); });
