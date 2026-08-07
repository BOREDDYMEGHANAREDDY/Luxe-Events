const mongoose = require("mongoose");

const uri =
  "mongodb+srv://Admin:Test12345@event.5sammdl.mongodb.net/?retryWrites=true&w=majority&appName=Event";

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });