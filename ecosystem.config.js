module.exports = {
    apps : [
    {
        name:   "travelexperts",
        script: "npm run start",
        watch_delay: 1000,
        watch:  true,
        ignore_watch: ["node_modules", "media", "views", "css"]
    }]
}
