const Settings = require("../models/settings");

// GET
const getSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      shopName: "HOMLY DEALS",
      phone: "",
      location: "",
      mapLink: "",
      instagram: "",
      facebook: "",
      otherLink: "",
    });
  }

  res.json(settings);
};

// UPDATE
const updateSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings(req.body);
  } else {
    settings.shopName = req.body.shopName;
    settings.phone = req.body.phone;
    settings.location = req.body.location;
    settings.mapLink = req.body.mapLink;
    settings.instagram = req.body.instagram;
    settings.facebook = req.body.facebook;
    settings.otherLink = req.body.otherLink;
  }

  await settings.save();

  res.json(settings);
};

module.exports = { getSettings, updateSettings };
