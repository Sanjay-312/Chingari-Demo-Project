const { Client } = require("pg");
const env = require("dotenv");
env.config();

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PGPORT,
});
module.exports = client;
