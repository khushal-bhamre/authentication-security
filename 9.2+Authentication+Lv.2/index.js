import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();
const port = 3000;

//pg-Client

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length > 0) {
      res.send("Emial already exists!");
    } else {
      const query = "INSERT INTO users(email,password) VALUES($1,$2)";
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(query, [email, hashedPassword]);
      //  console.log(result);
      res.render("secrets.ejs");
    }
  } catch (error) {
    console.log("Error Inserting Data", error.stack);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const query = "SELECT email,password FROM users WHERE email =$1";
    const { rows } = await db.query(query, [email]);

    if (rows.length < 1) {
      res.send("user does not exits");
    } else {
      const checkPassword = await bcrypt.compare(password, rows[0].password);
      checkPassword === true
      ? res.render("secrets.ejs")
      : res.send("Incorrect username or password");
    }
  } catch (error) {
    console.log("Error authenticating", error.stack);
    res.status(500).send("Internal server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
