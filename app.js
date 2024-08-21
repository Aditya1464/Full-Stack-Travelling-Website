const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require("./schema.js")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

main()
.then(() => console.log("connection successful"))
.catch(err => console.log(err));

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, error)
    }
    else next();
}

//ROOT ROUTE
app.get("/", (req,res) => {
    res.send("Hii! I am root");
})

//INDEX ROUTE
app.get("/listings", wrapAsync(async (req,res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
}))


//CREATE: NEW & CREATE ROUTE
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
})

app.post("/listings", validateListing, wrapAsync(async (req,res, next) => {
    // if(!req.body.listings) {
    //     throw new ExpressError(400, "Send valid data for listing")
    // }

    await new Listing(req.body.listings).save();
    res.redirect("/listings");
}));


//EDIT ROUTE AND UPDATE ROUTE
app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}))

app.put("/listings/:id",validateListing, wrapAsync( async (req,res)=>{ 
    let {id} = req.params;
    // if(!req.body.listings) {
    //     throw new ExpressError(400, "Send valid data for listing")
    // }

    await Listing.findByIdAndUpdate(id, {
        ...req.body.listings
    });

    res.redirect(`/listings/${id}`);
}))

//READ : SHOW ROUTE
app.get("/listings/:id", wrapAsync(async (req,res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}))


//DELETE
app.delete("/listings/:id", wrapAsync(async (req,res) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
}))

app.all("*", (req,res, next) =>  {
    next(new ExpressError(404, "Page Not Found"))
})

app.use((err, req, res, next) => {
    let {status=500, message="Something went wrong"} = err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs", {status, message});
})

app.listen(3000, ()=>{
    console.log("app is listening");
})