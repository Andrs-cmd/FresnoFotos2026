const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema(
  {
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // 🖼️ Preview (pixelado + watermark)
    imageUrl: {
      type: String,
      required: true
    },

    // 🖼️ Imagen ORIGINAL (alta resolución – descarga admin)
    originalUrl: {
      type: String,
      default: null // ⚠️ fotos viejas no lo tienen
    },

    // 🖼️ Thumbnail optimizado
    thumbUrl: {
      type: String,
      required: true,
      index: true
    },

    title: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      default: 0
    },

    sessionDate: {
      type: Date,
      required: true,
      index: true
    },

    isPublic: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Photo", PhotoSchema);
