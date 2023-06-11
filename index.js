const express   = require("express");
const postgres  = require("pg");
const path      = require("path");
const port      = process.env.PORT || 3000;

const dbh = new postgres.Client(
{
    connectionString: "postgres://uvuffpmvma:{gra8&H Mg0rf Q\\}@travelexperts-server.postgres.database.azure.com/postgres?sslmode=require"
});

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/css", express.static(path.join(__dirname, "node_modules", "bootstrap", "dist", "css")));

app.use("/media", express.static(path.join(__dirname, "media")));

app.get("/favicon.ico", (req, res) =>
{
    console.log("Sending file: " + path.join(__dirname + "favicon.ico"));
    res.sendFile(path.join(__dirname + "favicon.ico"));
});

app.get("/", (req, res) =>
{
    res.render("home");
});

app.get("/packages", (req, res) =>
{
    res.render("packages", {packages: []});
    dbh.connect((err) =>
    {
        if (err)
        {
            console.log("Error connecting:");
            console.log(err.stack);
            return;
        }
        console.log("Connection successful");

        client.end();
    });
});

app.use((req, res, next) =>
{
    console.log("404: " + req.url);
    res.render("status", {status: 404, message: "Sorry, that page doesn't exist"});
});

app.listen(port, () => { console.log("Listening on port: " + port); });
