const mongoose = require("mongoose");

const extraLinkSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
  },
  { _id: false },
);

const settingsSchema = new mongoose.Schema({
  shopName: String,
  phone: String,
  email: String,
  businessHours: String,
  location: String,
  mapLink: String,
  instagram: String,
  facebook: String,
  extraLinks: [extraLinkSchema],
});

module.exports = mongoose.model("Settings", settingsSchema);
