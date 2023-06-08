const express   = require("express");
const path      = require("path");
const app       = express();
const port      = process.env.PORT || 3000;

let views_path      = path.join(__dirname, "views");
let styles_path     = path.join(__dirname, "styles");
let scripts_path    = path.join(__dirname, "scripts");
let media_path      = path.join(__dirname, "media");
let modules_path    = path.join(__dirname, "node_modules");

app.set("views", views_path);
app.set("view engine", "ejs");

app.use("/styles", express.static(styles_path));
app.use("/media", express.static(media_path));
app.use("/scripts", express.static(scripts_path));

function pathname(path)
{
    if (path) { return path.substring(1); }

    return "";
}

app.listen(port, () => {
    console.log("Listening on port " + port + "...");
});

app.get("/leader-line.min.js", (request, response) => {
    response.sendFile(path.join(modules_path, "leader-line", "leader-line.min.js"));
});

app.get("/", (request, response) => {
    response.render("index");
});

app.use((request, response, next) => {
    console.log("404 for: " + request.url);
    response.render("status", {
        title:          pathname(request.url),
        status:         "404!",
        status_message: "Sorry, that page doesn't exist"
    });
});
