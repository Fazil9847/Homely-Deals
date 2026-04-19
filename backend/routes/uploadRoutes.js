const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
const { uploadImage, deleteImage } = require("../controllers/uploadController");

router.post("/", upload.single("image"), uploadImage);
router.delete("/", protect, deleteImage);

module.exports = router;
