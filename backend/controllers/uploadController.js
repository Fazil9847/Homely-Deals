const cloudinary = require("../config/cloudinary");

const CLOUDINARY_UPLOAD_SEGMENT = "/upload/";

const extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  if (!url.includes("res.cloudinary.com") || !url.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return null;
  }

  const [basePath] = url.split("?");
  const uploadIndex = basePath.indexOf(CLOUDINARY_UPLOAD_SEGMENT);

  if (uploadIndex === -1) {
    return null;
  }

  const rawPath = basePath.slice(uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length);
  const pathWithoutVersion = rawPath.replace(/^v\d+\//, "");
  const extensionIndex = pathWithoutVersion.lastIndexOf(".");

  if (extensionIndex <= 0) {
    return null;
  }

  return pathWithoutVersion.slice(0, extensionIndex);
};

const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const publicId = extractCloudinaryPublicId(imageUrl);

    if (!publicId) {
      return res.status(400).json({ message: "Invalid Cloudinary image URL" });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "error") {
      return res.status(500).json({ message: "Failed to delete image from Cloudinary" });
    }

    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadImage, deleteImage };
