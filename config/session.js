const mongoDbStore = require("connect-mongodb-session");

function createSessionStore(session) {
  const MongoDbStore = mongoDbStore(session);

  const sessionStore = new MongoDbStore({
    uri: "mongodb://127.0.0.1:27017",
    databaseName: "new-blog",
    collection: "sessions",
  });

  return sessionStore;
}

function createSessionConfig(session) {
    return {
        secret: "secret-blog",
        resave: false,
        saveUninitialized: false,
        store: session,
        cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 },
      }
}

module.exports = {
    createSessionStore: createSessionStore,
    createSessionConfig: createSessionConfig
}