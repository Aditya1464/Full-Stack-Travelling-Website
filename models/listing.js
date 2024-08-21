const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({

    title: {
        type: String,
        required : true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "http://surl.li/tnwmju",
        set : (v) => v==="" ? "http://surl.li/tnwmju" : v,
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;