const { MongoClient } = require("mongodb");
const database = require("./database");

let connection;
let db;
let collection;

describe("Testing Database Class", () => {
  afterEach(() => db.collection("reviews").remove({}));
  beforeAll(async done => {
    connection = await MongoClient.connect("mongodb://localhost:27017/reviewsdbtest", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db("reviewsdbtest");
    collection = await db.createCollection("reviews", { strict: false });
    database.db = db;
    database.connect();
    database.createCollection();
    done();
  });
  afterAll(done => {
    console.log("After all?");
    connection.close();
    db.close();
    done();
  });

  it("To check if the Insert in Database ", async () => {
    const reviews = db.collection("reviews");
    database.db = db;
    await database.storeData({ review: "d" }, false);

    const insertedUser = await reviews.findOne({ review: "d" });
    expect(insertedUser).toBeDefined();
  });
  it("To check Filter by rating ", async () => {
    await database.storeData(
      [
        { review: "d", rating: 1 },
        { review: 2, rating: 3 },
        { review: 3, rating: 1 }
      ],
      true
    );
    var res = await database.getData({ rating: 1 });
    expect(res.length).toBe(2);
  });
  it("To check Filter by store ", async () => {
    await database.storeData(
      [
        { review: "d", rating: 1, review_store: "iTunes" },
        { review: 2, rating: 3, review_store: "iTunes" },
        { review: 3, rating: 1, review_store: "googlestore" }
      ],
      true
    );
    var res = await database.getData({ review_store: "googlestore" });
    expect(res.length).toBe(1);
  });
  it("To check Filter by store no items", async () => {
    await database.storeData(
      [
        { review: "d", rating: 1, review_store: "iTunes" },
        { review: 2, rating: 3, review_store: "iTunes" },
        { review: 3, rating: 1, review_store: "googlestore" }
      ],
      true
    );
    var res = await database.getData({ review_store: "d" });
    expect(res.length).toBe(0);
  });
  it("To check Filter by date option ", async () => {
    var date = "2017-09-03T00:00:00.000Z";

    await database.storeData(
      [
        { review: "d", rating: 1, review_store: "iTunes", reviewed_date: date },
        { review: 2, rating: 3, review_store: "iTunes", reviewed_date: date },
        { review: 3, rating: 1, review_store: "googlestore", reviewed_date: date }
      ],
      true
    );

    var res = await database.getData({ reviewed_date: date });

    expect(res.length).toBe(3);
  });
  it("To check Filter no filters applied ", async () => {
    var date = "2017-09-03T00:00:00.000Z";

    await database.storeData(
      [
        { review: "d", rating: 1, review_store: "iTunes", reviewed_date: date },
        { review: 2, rating: 3, review_store: "iTunes", reviewed_date: date },
        { review: 3, rating: 1, review_store: "googlestore", reviewed_date: date }
      ],
      true
    );

    var res = await database.getData({});

    expect(res.length).toBe(3);
  });
  it("to Check get total Rating ", async () => {
    var date = "2017-09-03T00:00:00.000Z";
    await database.storeData(
      [
        { review: "d", rating: 1, review_store: "iTunes", reviewed_date: date },
        { review: 2, rating: 3, review_store: "iTunes", reviewed_date: date },
        { review: 3, rating: 1, review_store: "googlestore", reviewed_date: date }
      ],
      true
    );

    var res = await database.getTotalRatings(1);

    expect(res[0].total_ratings).toBe(2);
  });
  it("to Check get average rating per store per month ", async () => {
    var date = new Date("2017-09-03T00:00:00.000Z");
    var date1 = new Date("2017-10-03T00:00:00.000Z");
    await database.storeData(
      [
        { review: "d", rating: 1, review_store: "iTunes", reviewed_date: date },
        { review: 2, rating: 3, review_store: "iTunes", reviewed_date: date },
        { review: 3, rating: 1, review_store: "googlestore", reviewed_date: date },
        { review: 3, rating: 1, review_store: "googlestore", reviewed_date: date },
        { review: 3, rating: 3, review_store: "googlestore", reviewed_date: date1 },
        { review: 3, rating: 1, review_store: "googlestore", reviewed_date: date1 }
      ],
      true
    );

    //console.log("resxxx"+JSON.stringify(res[0]));
    var res1 = await database.getRatings("iTunes");
    console.log("res" + res1);
  });
});
