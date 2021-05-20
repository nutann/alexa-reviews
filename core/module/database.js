var MongoClient = require("mongodb").MongoClient;
var envConfig = require("../../env/" + process.env.NODE_ENV);

var client = null;
var db;

module.exports = {
  db,
  connect: function() {
    console.log("process.env.NODE_ENV" + process.env.NODE_ENV);
    var url = envConfig.server.DB_URL;
    db_name = envConfig.server.DB_NAME;
    collection = envConfig.server.COLLECTION;
    console.log("url === " + url);
    client = new MongoClient(url, { useUnifiedTopology: true });
    client.connect().then(client => {});
  },
  createCollection: function() {
    db = client.db(db_name);
    db.createCollection(collection, { strict: false }, async function(err, result) {
      if (err) throw err;
    });
  },
  storeData: async function(obj_json, many) {
      //for data in an array store insertmany else only one
    return new Promise(async function(resolve, reject) {
      if (many) {
        await db.collection(collection).insertMany(obj_json);
        resolve();
      } else {
        await db.collection(collection).insertOne(obj_json);
        resolve();
      }
    });
  },

  getData: function(options) {
    return new Promise(async function(resolve, reject) {
      console.log("options" + JSON.stringify(options));
      results = await db
        .collection(collection)
        .find(options)
        .toArray();
      resolve(results);
    });
  },

  getRatings: function(store) {
    return new Promise(async function(resolve, reject) {
      results = await db
        .collection(collection)
        .aggregate([
          { $match: { review_source: store } },
          {
            $group: {
              _id: {
                month: { $month: "$reviewed_date" },
                year: { $year: "$reviewed_date" }
              },
              avgRating: { $avg: "$rating" },
              total: { $sum: 1 }
            }
          },
          { $sort: { year: -1 } },
          {
            $project: {
              year: "$_id.year",
              month: "$_id.month",
              _id: 0,
              avgRating: "$avgRating"
            }
          }
        ])
        .toArray();
      console.log("results" + results);
      resolve(results);
    });
  },
  getTotalRatings: function(ratings, cb) {
    return new Promise(async function(resolve, reject) {
      var res = db
        .collection(collection)
        .aggregate([
          { $match: { rating: ratings } },
          {
            $count: "total_ratings"
          }
        ])
        .toArray();
      resolve(res);
    });
  }
};
