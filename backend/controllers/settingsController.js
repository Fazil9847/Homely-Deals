const Settings = require("../models/settings");

const sanitizeExtraLinks = (links = []) =>
  Array.isArray(links)
    ? links
        .map((link) => ({
          title: link?.title?.trim() || "",
          url: link?.url?.trim() || "",
        }))
        .filter((link) => link.title && link.url)
    : [];

// GET
const getSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      shopName: "HOMLY DEALS",
      phone: "",
      email: "",
      businessHours: "",
      location: "",
      mapLink: "",
      instagram: "",
      facebook: "",
      extraLinks: [],
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
    settings.email = req.body.email;
    settings.businessHours = req.body.businessHours;
    settings.location = req.body.location;
    settings.mapLink = req.body.mapLink;
    settings.instagram = req.body.instagram;
    settings.facebook = req.body.facebook;
    settings.extraLinks = sanitizeExtraLinks(req.body.extraLinks);
  }

  await settings.save();

  res.json(settings);
};

module.exports = { getSettings, updateSettings };
