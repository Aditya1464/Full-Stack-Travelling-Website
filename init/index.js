const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initdata = require("./data.js")


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

main()
.then(() => console.log("connection successful"))
.catch(err => console.log(err));

const initDB = async ()=>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({...obj, owner: "6783ae1d2c426a19ae1d670c"}));
    await Listing.insertMany(initdata.data);
}

initDB();