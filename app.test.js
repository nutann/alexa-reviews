const supertest = require("supertest");
const app = require("./app");

var MongoClient = require("mongodb").MongoClient;
jest.mock("./core/module/database");
var database = require("./core/module/database");

describe("Testing App Class", () => {
  afterEach(() => jest.resetAllMocks());

  it("To check  Add review end point", async () => {
    var spy = jest.spyOn(database, "storeData").mockImplementation((data, many) => {
      Promise.resolve();
    });

    const response = await supertest(app)
      .post("/reviews/add")
      .send({ review_data: { auhor: "abc" } });

    console.log("response ===" + response);
    // await Common.getCollection({ url: 'mongodb://localhost:27017', db_name: 'reviewsdb', collection_name: 'reviews' });
    expect(response.status).toBe(200);
    expect(spy).toBeCalled();
  });
  it("To check Add review API with basic object", async () => {
    var data_recieved;
    var spy = jest.spyOn(database, "storeData").mockImplementation((data, many) => {
      data_recieved = data;
      Promise.resolve();
    });
    //pass empty object
    const response = await supertest(app)
      .post("/reviews/add")
      .send({});

    var basic_data = {
      review: "",
      rating: 1,
      author: "Unknown",
      product_name: "Amazon Alexa",

      review_source: ""
    };

    expect(JSON.stringify(data_recieved)).toBe(JSON.stringify(basic_data));
    expect(response.status).toBe(200);

    expect(spy).toBeCalled();
  });
  it("To check Add review API  with detailed object", async () => {
    var data_recieved;
    var spy = jest.spyOn(database, "storeData").mockImplementation((data, many) => {
      data_recieved = data;
      Promise.resolve();
    });
    var data = { review_data: { auhor: "abc" } };
    //pass empty object
    const response = await supertest(app)
      .post("/reviews/add")
      .send({ data });

    var basic_data = {
      review: "",
      rating: 1,
      author: "Unknown",
      product_name: "Amazon Alexa",

      review_source: ""
    };
    var expected = { ...data.review, ...basic_data };

    // await Common.getCollection({ url: 'mongodb://localhost:27017', db_name: 'reviewsdb', collection_name: 'reviews' });
    expect(JSON.stringify(data_recieved)).toBe(JSON.stringify(basic_data));
    expect(response.status).toBe(200);

    expect(spy).toBeCalled();
  });

  it("To check if the filter API with detailed object", async () => {
    var mock = database.getData.mockReturnThis();
    var spy = jest.spyOn(database, "getData").mockImplementation(data => {
      Promise.resolve([]);
    });
    const response = await supertest(app).get("/reviews/filter?store=iTunes");
    var expected = { review_source: "iTunes" };
    cb = jest.fn();
    // await Common.getCollection({ url: 'mongodb://localhost:27017', db_name: 'reviewsdb', collection_name: 'reviews' });
    expect(response.status).toBe(200);
    expect(database.getData).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalled();
  });

  it("To check if the rating for store been with detailed object", async () => {
    var mock = database.getData.mockReturnThis();
    var spy = jest.spyOn(database, "getRatings").mockImplementation(data => {
      Promise.resolve({ avg: 2.5 });
    });
    console.log("call get function 3");
    const response = await supertest(app).get("/reviews/ratings/store?store=iTunes");
    var expected = { review_source: "iTunes" };

    console.log("response is ", JSON.stringify(response));
    // await Common.getCollection({ url: 'mongodb://localhost:27017', db_name: 'reviewsdb', collection_name: 'reviews' });
    expect(response.status).toBe(200);
    expect(database.getRatings).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalled();
  });
  it("To check if the total rating type", async () => {
    var spy = jest.spyOn(database, "getTotalRatings").mockImplementation(data => {
      Promise.resolve({ total_ratings: 10 });
    });
    console.log("call get function 3");
    const response = await supertest(app).get("/reviews/ratings/total?rating=2");
    var expected = { review_source: "iTunes" };

    console.log("response is ", JSON.stringify(response));
    // await Common.getCollection({ url: 'mongodb://localhost:27017', db_name: 'reviewsdb', collection_name: 'reviews' });
    expect(response.status).toBe(200);
    expect(database.getTotalRatings).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalled();
  });
});
