import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "basicAuth",
  password: "kkmani2001",
  port: 5432,
});

db.connect();

export default db;
