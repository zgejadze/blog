const mongoDb = require("mongodb");

const mongoClient = mongoDb.MongoClient;

let database;

async function connect() {
  const client = await mongoClient.connect("mongodb://127.0.0.1:27017");
  database = client.db('new-blog');
}

function getDb() {
    if(!database){
        throw{message:'database connection not established'}
    }

    return database;
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDb
}

