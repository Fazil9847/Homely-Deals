const Product = require("../models/product");
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

const deleteCloudinaryImages = async (imageUrls = [], { throwOnFailure = true } = {}) => {
  const publicIds = [
    ...new Set(
      imageUrls
        .map(extractCloudinaryPublicId)
        .filter(Boolean),
    ),
  ];

  if (!publicIds.length) {
    return;
  }

  const deletionResults = await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, { resource_type: "image" }),
    ),
  );

  const failed = deletionResults.filter((result) => result.status === "rejected");

  if (failed.length && throwOnFailure) {
    throw new Error("Failed to delete one or more images from Cloudinary");
  }

  return {
    total: publicIds.length,
    failedCount: failed.length,
  };
};

const getRemovedImageUrls = (previousProduct, nextPayload) => {
  const previousMain = previousProduct?.image || null;
  const hasNextMain = Object.prototype.hasOwnProperty.call(nextPayload || {}, "image");
  const nextMain = hasNextMain ? nextPayload?.image || null : previousMain;

  const previousGallery = Array.isArray(previousProduct?.galleryImages)
    ? previousProduct.galleryImages
    : [];
  const hasNextGallery = Object.prototype.hasOwnProperty.call(
    nextPayload || {},
    "galleryImages",
  );
  const nextGallery = hasNextGallery && Array.isArray(nextPayload?.galleryImages)
    ? nextPayload.galleryImages
    : previousGallery;

  const removedFromGallery = previousGallery.filter((url) => !nextGallery.includes(url));
  const removedMain = previousMain && previousMain !== nextMain ? [previousMain] : [];

  return [...removedMain, ...removedFromGallery].filter(Boolean);
};

const normalizeWoodType = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      woodType,
      price,
      image,
      category,
      availability,
      label,
      imagePosition,
      galleryImages,
      offer,
    } = req.body;

    let discountPercent = 0;

    if (offer?.originalPrice && offer?.offerPrice) {
      discountPercent = Math.round(
        ((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100,
      );
    }

    const product = new Product({
      name,
      description,
      woodType: normalizeWoodType(woodType),
      price,
      image,
      category,
      availability,
      label,
      imagePosition,
      galleryImages,
      offer: offer ? { ...offer, discountPercent } : null,
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageUrls = [
      product.image,
      ...(Array.isArray(product.galleryImages) ? product.galleryImages : []),
    ].filter(Boolean);

    await deleteCloudinaryImages(imageUrls);
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const removedImageUrls = getRemovedImageUrls(existing, req.body);
    const normalizedWoodType = normalizeWoodType(req.body.woodType);
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        woodType: normalizedWoodType,
        availability: req.body.availability || "Available on enquiry",
        label: req.body.label === "" ? null : req.body.label,
      },
      { new: true },
    );

    const deletionResult = await deleteCloudinaryImages(removedImageUrls, {
      throwOnFailure: false,
    });

    if (deletionResult.failedCount > 0) {
      console.warn(
        `Cloudinary cleanup partially failed for product ${req.params.id}: ${deletionResult.failedCount}/${deletionResult.total}`,
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById,
};
