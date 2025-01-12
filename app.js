const express = require("express");
const app = express();

const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");


//router
const listings = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");

app.set("view engine", "ejs"); //set ejs as a view engine
app.set("views", path.join(__dirname, "views")); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

//ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Hii! I am root");
});

//session
const session = require("express-session");
const sessionoptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}
app.use(session(sessionoptions));

//flash
const flash = require("connect-flash");
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  // res.status(status).send(message);
  res.status(status).render("error.ejs", { status, message });
});

app.listen(3000, () => {
  console.log("app is listening");
});
