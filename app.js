//? Modules Required
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("https");
require("dotenv").config();

//? App Setup
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//? API
app.route("/")
    .get((req, res) => {
        res.render(__dirname + "/views/index.ejs");
    })
    .post((req, res) => {
        const year = req.body.year;
        const month = req.body.month;
        const day = req.body.day;
        const country = req.body.country;
        const options = {
            "method": "GET",
            "hostname": process.env.HOSTNAME,
            "port": null,
            "path": "/report/country/name?date=" + year + "-" + month + "-" + day + "&name=" + country,
            "headers": {
                "x-rapidapi-key": process.env.KEY,
                "x-rapidapi-host": process.env.HOSTNAME,
                "useQueryString": true
            }
        };
        const request = http.request(options, function (response) {
            const reports = [];
            response.on("data", (report) => reports.push(report));
            response.on("end", () => {
                const data = Buffer.concat(reports);
                const covidData = JSON.parse(data);
                const confirmedCases = covidData[0].provinces[0].confirmed;
                const recoveredCases = covidData[0].provinces[0].recovered;
                const deathCases = covidData[0].provinces[0].deaths;
                res.render(__dirname + "/views/reports.ejs", {country: country, confirmedCases: confirmedCases, recoveredCases: recoveredCases, deathCases: deathCases});
            });
        });
        request.end();
    });

//? Server Port
app.listen(3000, () => console.log("Server running on port 3000"));