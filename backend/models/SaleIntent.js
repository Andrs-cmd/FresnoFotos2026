const mongoose = require("mongoose");

const saleIntentSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo",
        required: true
      }
    ],

    qty: Number,
    promoLabel: String,
    totalPrice: Number,

    status: {
      type: String,
      enum: ["pending", "paid", "delivered"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaleIntent", saleIntentSchema);
