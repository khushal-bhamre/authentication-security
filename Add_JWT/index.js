import express from "express";
import bodyParser from "body-parser";
// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
// import db from "./db/dbConfig.js";
import validateUser from "./middleware/validate.js";
import passport, { Passport } from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";

const app = express();
const port = 3000;

const sessionConfig = {
  secret: "topSecret", // Replace with a strong, random secret
  resave: false,
  saveUninitialized: true,
  name: "express-sessionID", // Custom name for the session ID cookie
  cookie: {
    secure: false, // Set to 'true' in production for HTTPS
  },
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(session(sessionConfig));



passport.use(new GoogleStrategy({
    clientID: "851717440802-b42v66raev4mab5fi0rcvih4497phobh.apps.googleusercontent.com",
    clientSecret: "xujXq6ha9PaaskhevMvO9LW0",
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const data = jwt.verify(token, "secret");
      console.log(data);
      return res.redirect("/secrets")
    } catch (error) {
      console.log(error);
    }
    
  }

  res.render("login.ejs");
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/secrets',
  passport.authenticate( 'google', {
      successRedirect: '/secrets',
      failureRedirect: '/login'
}));

// app.get("/register", (req, res) => {
//   res.render("register.ejs");
// });

// app.post("/register", async (req, res) => {
//   const email = req.body.username;
//   const password = req.body.password;

//   try {
//     const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (rows.length > 0) {
//       res.send("Email already exists!");
//     } else {
//       const query = "INSERT INTO users(email, password) VALUES ($1, $2)";
//       const hashedPassword = await bcrypt.hash(password, 10);
//       await db.query(query, [email, hashedPassword]);
//       const token = jwt.sign({ email: email }, "secret", { expiresIn: '1d' });
//       res.cookie('token', token, { httpOnly: true });
//       res.render("secrets.ejs");
//     }
//   } catch (error) {
//     console.log("Error Inserting Data", error.stack);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/login", async (req, res) => {
//   const email = req.body.username;
//   const password = req.body.password;

//   try {
//     const query = "SELECT email, password FROM users WHERE email = $1";
//     const { rows } = await db.query(query, [email]);

//     if (rows.length < 1) {
//       res.send("User doesn't exist, Please register");
//     } else {
//       const checkPassword = await bcrypt.compare(password, rows[0].password);

//       if (checkPassword) {
//         const token = jwt.sign({ email: email }, "secret", { expiresIn: '1d' });
//         res.cookie('token', token, { httpOnly: true });
//         res.redirect("/secrets");
//       } else {
//         res.redirect("/login");
//       }
//     }
//   } catch (error) {
//     console.error("Error authenticating:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/secrets", validateUser, (req, res) => {
  res.render("secrets.ejs");
});

app.post("/logout", (req, res) => {
  res.clearCookie('token');
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
