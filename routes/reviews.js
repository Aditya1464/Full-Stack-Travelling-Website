const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


//REVIEWS
router.post(
  "/",isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    let { rating, comment } = req.body.review;
    let newReview = await new Review({ rating, comment });
    newReview.author = req.user._id;
    await newReview.save();
    console.log(newReview);
    listing.reviews.push(newReview);
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${id}`);
  })
);

//DELETE REVIEW

router.delete(
  "/:reviewId", isLoggedIn,isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
