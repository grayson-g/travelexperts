module.exports = {
    apps : [
    {
        name:   "travelexperts",
        script: "npm run sync && npm run start",
        watch:  true,
        ignore_watch: ["node_modules", "media"]
    }]
}
