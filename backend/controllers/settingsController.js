const Settings = require("../models/settings");

// GET
const getSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      shopName: "HOMLY DEALS",
      phone: "",
      location: "",
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
  }

  await settings.save();

  res.json(settings);
};

module.exports = { getSettings, updateSettings };
