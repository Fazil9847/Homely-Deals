const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById);

// PROTECTED (admin only)
router.post("/", protect, createProduct);
router.delete("/:id", protect, deleteProduct);
router.put("/:id", protect, updateProduct);

module.exports = router;
