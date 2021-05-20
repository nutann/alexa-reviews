var express = require("express");
const bodyParser = require("body-parser");

var database = require("./core/module/database");
const lineReader = require("line-reader");
var envConfig = require("./env/" + process.env.NODE_ENV);

var app = express();
httpServer = require("http").createServer(app);

eachLine = (filename, iteratee) =>
  new Promise((resolve, reject) => {
    lineReader.eachLine(filename, iteratee, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

module.exports = httpServer.listen(envConfig.server.port || 3000, async () => {
  console.log("Listening to port " + envConfig.server.port);
  //connect to database
  database.connect(envConfig.server.DB_URL);
  database.createCollection();
});
module.exports.stop = () => {
  console.log("stop listening");
  // Then close the server when done...
  httpServer.close();
};
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

//API to insert the review
//imports the data from the file
app.post("/reviews/import", async (req, res) => {
  var array_obj = [];
  //read from the file each line and store the data in the db
  await eachLine("alexa.json", function(line) {
    line = JSON.parse(line);
    line.reviewed_date = new Date(line.reviewed_date);
    line.rating = parseInt(line.rating);
    array_obj.push(line);
    console.log("done");
  });

  database.storeData(array_obj, true, () => {
    res.json("done");
  });
});

//API to insert the review
app.post("/reviews/add", async (req, res) => {
  var basic_data = {
    review: "",
    rating: 1,
    author: "Unknown",
    product_name: "Amazon Alexa",

    review_source: ""
  };
  bodyJson =
    typeof req.body.review_data === "string"
      ? JSON.parse(req.body.review_data)
      : req.body.review_data;
  //var bodyJson = JSON.parse(req.body.review_data)
  var data = { ...basic_data, ...bodyJson };
  await database.storeData(data, false);
  res.status(200);
  res.send("done");
});

//API to insert the filter review based on reviews/filter?store=iTunes&rating=2
//pass date value in miisec
app.get("/reviews/filter", async (req, res) => {
  var options = {};
  if (req.query.reviewed_date) options.reviewed_date = new Date(req.query.reviewed_date);
  if (req.query.store) options.review_source = req.query.store;
  if (req.query.rating) options.rating = parseInt(req.query.rating);
  console.log("call get function 2", options);
  var results = await database.getData(options);
  res.json(results);
});

//API to get the average rating for each store reviews/ratings/store?store=iTunes
app.get("/reviews/ratings/store", async (req, res) => {
  console.log("call review rating");
  var results = await database.getRatings(req.query.store);
  res.json(results);
});

//API to get the total rating reviews/ratings/total?rating=2
app.get("/reviews/ratings/total", async (req, res) => {
  var rating = parseInt(req.query.rating);
  var results = await database.getTotalRatings(rating);
  res.json(results);
});
