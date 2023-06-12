const express   = require("express");
const mysql     = require("mysql2");
const path      = require("path");
const port      = process.env.PORT || 3000;

const secrets   = required("../secrets");

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
    let packages = [];
    let timefmt = new Intl.DateTimeFormat('en-CA',
        {
            day:    "numeric",
            month:  "long",
            year:   "numeric"
        });

    let sql = "SELECT * FROM packages;";
    dbc.query(sql, (err, rows, fields) => {
        if (err)
        {
            console.log("Query Error: " + err.stack);
            res.status(500).render("status", {status: 500, message: "Uh oh!"});
            return;
        }

        for (let i = 0; i < rows.length; i++)
        {
            let package = rows[i];
            packages[i] = {
                name:   package.PkgName,
                sdate:  timefmt.format(package.PkgStartDate),
                edate:  timefmt.format(package.PkgEndDate),
                desc:   package.PkgDesc,
                price:  package.PkgBasePrice,
                id:     package.PackageId
            }
        }

        console.log("got rows: " + rows);

        res.render("packages", {packages: packages});
    });
});

app.get("/login",(req,res)=>{
	res.render("login", {"myTitle": "Login page"});
});

app.get("/registration", (req,res) =>
{
	res.render("registerform", {"myTitle": "Registration Page"});
});

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

app.get("/login",(req,res)=>{
	res.render("login", {"myTitle": "Login page"});
});

app.get("/contacts", (req, res) =>
{
    // WHERE AgtPosition='Junior Agent'
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

app.use((req, res, next) =>
{
    console.log("404: " + req.url);
    res.render("status", {status: 404, message: "Sorry, that page doesn't exist"});
});

app.listen(port, () => { console.log("Listening on port: " + port); });
