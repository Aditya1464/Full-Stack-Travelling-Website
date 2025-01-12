const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { reviewsSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/reviews.js");

const validateReview = (req, res, next) => {
  let { error } = reviewsSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, error);
  } else next();
};

//REVIEWS
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    let { rating, comment } = req.body.review;
    let newReview = await new Review({ rating, comment }).save();

    listing.reviews.push(newReview);
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${id}`);
  })
);

//DELETE REVIEW

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
