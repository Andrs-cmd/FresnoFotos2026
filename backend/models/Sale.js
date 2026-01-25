const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ✅ Fotos vendidas: solo un array de ObjectId referenciando Photo
    photos: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Photo" }
    ],

    totalPhotos: {
      type: Number,
      required: true
    },

    totalPrice: {
      type: Number,
      required: true
    },

    clientPhone: {
      type: String
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Sale", SaleSchema);
