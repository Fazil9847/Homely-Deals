const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  shopName: String,
  phone: String,
  location: String,
});

module.exports = mongoose.model("Settings", settingsSchema);
