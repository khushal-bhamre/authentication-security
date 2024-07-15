import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from 'express-session'
import sessionConfig from "./sessionConfig.js";

const app = express();
const port = 3000;

//Pg-Client
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "basicAuth",
  password: "kkmani2001",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session(sessionConfig));

function validateUser(req, res, next) {
  const userEmail = req.session.user;

  if (userEmail) {
    ///Iss user ne pehle login kar chuka hai aur iska user id hum pehle se apne session me store kar chuke hai- Iska matlab ye valid user hai
    next();
  } else {
    //agar humare paas humare session me iss session id ke corresponding koi email nahi hai matlab ye user ne login nahi kiya hai iski login page pe bhejo
    res.redirect('/login')
  }

 
}

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  if(req.session.user){
    return res.redirect('/secrets');
  }
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
      res.send("Email already exits!");
    } else {
      const query = "INSERT INTO users(email,password) VALUES ($1,$2)";
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(query, [email, hashedPassword]);
      console.log(result);
      req.session.user = email;
     res.redirect('/secrets')
    }
  } catch (error) {
    console.log("Error Inserting Data", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {

  const email = req.body.username;
  const password = req.body.password;

  try {
    const query = "SELECT email, password FROM users WHERE email = $1";
    const { rows } = await db.query(query, [email]);

    if (rows.length < 1) {
      res.send("User doesn't exist, Please register");
    } else {
      const checkPassword = await bcrypt.compare(password,rows[0].password);
      if (checkPassword) {
        req.session.user = email;
        res.redirect('/secrets');
      } else {
        res.redirect('/login')
      }
    }
  } catch (error) {
    console.error("Error authenticating:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/logout',(req,res)=>{
  //Delete corresponding user session from in-store
  req.session.destroy(); // Destroy session on logout

  res.redirect('/');
})

app.get('/secrets',validateUser,(req,res)=>{
  //protected 
  res.render('secrets.ejs');
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});