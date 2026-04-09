const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: String,
    woodType: {
      type: [String],
      default: [],
    },
    price: Number,
    image: String,
    category: {
  type: String,
  required: true
},
availability: {
  type: String,
  default: "Available on enquiry"
},
label: {
  type: String,
  default: ""
},
imagePosition: {
  type: String
},
galleryImages: {
  type: [String],
  default: []
},
offer: {
  isOffer: { type: Boolean, default: false },
  originalPrice: Number,
  offerPrice: Number,
  discountPercent: Number,
  offerText: String ,  // "Upto 50% Off + Extra 5%"
  expiresAt: Date  
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
