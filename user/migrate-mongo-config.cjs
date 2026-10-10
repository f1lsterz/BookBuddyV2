const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = {
  mongodb: {
    url: process.env.DATABASE_URL,
  },
  migrationsDir: path.join(__dirname, "migrations"),
  changelogCollectionName: "schema_migrations",
};
