const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


const validateListing = (req, res, next) => {
  // console.log(req.body);
  let { error } = listingSchema.validate(req.body);
  // console.log(error);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else next();
};

//INDEX ROUTE
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
  })
);

//CREATE: NEW & CREATE ROUTE
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    console.log(req.body.listings);
    await new Listing(req.body.listings).save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect("/listings");
  })
);

//EDIT ROUTE AND UPDATE ROUTE
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "Cannot find the listing!");
      return res.redirect("/listings");
    }
    else res.render("listings/edit.ejs", { listing });
  })
);

router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, {
      ...req.body.listings,
    });
    req.flash("success", "Successfully updated a listing!");
    res.redirect(`/listings/${id}`);
  })
);

//READ : SHOW ROUTE
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flash("error", "Cannot find the listing!");
      return res.redirect("/listings");
    }
    else res.render("listings/show.ejs", { listing });
  })
);

//DELETE
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
  })
);

module.exports = router;
