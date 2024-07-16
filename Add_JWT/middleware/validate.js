import jwt from "jsonwebtoken";

export default function validateUser(req, res, next) {
  const token = req.cookies.token; // Use 'token' as the key to match the main code
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const data = jwt.verify(token, "secret");
    console.log(data);
    next();
  } catch (err) {
    let errorMessage = "Invalid token!";
    if (err.name === "TokenExpiredError") {
      errorMessage = "Token expired!";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = err.message;
    }
    console.log(errorMessage);
    res.redirect("/login");
  }
}
