const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  shopName: String,
  phone: String,
  location: String,
  mapLink: String,
  instagram: String,
  facebook: String,
  otherLink: String,
});

module.exports = mongoose.model("Settings", settingsSchema);
