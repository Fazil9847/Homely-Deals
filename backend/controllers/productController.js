const Product = require("../models/product");

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
      offer
    } = req.body;

    let discountPercent = 0;

    if (offer?.originalPrice && offer?.offerPrice) {
      discountPercent = Math.round(
        ((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100
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
      offer: offer
        ? { ...offer, discountPercent }
        : null
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
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
  const normalizedWoodType = normalizeWoodType(req.body.woodType);
  const updated = await Product.findByIdAndUpdate(
  req.params.id,
  {
    ...req.body,
    woodType: normalizedWoodType,
    availability: req.body.availability || "Available on enquiry",
    label: req.body.label === "" ? null : req.body.label
  },
  { new: true }
);
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
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



module.exports = { createProduct, getProducts, deleteProduct, updateProduct, getProductById };
