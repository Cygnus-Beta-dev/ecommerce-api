import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: [
      {
        fileName: String,
        url: String,
        mimetype: String,
        size: Number,
      },
    ],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });

productSchema.methods.updateAverageRating = async function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.numOfReviews = 0;
  } else {
    const totalRating = this.ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0,
    );
    this.averageRating = totalRating / this.ratings.length;
    this.numOfReviews = this.ratings.length;
  }
  await this.save();
};

export const Product = mongoose.model("Product", productSchema);
