import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {type:String},
    description: String,
    price: Number,
    category: String,
    stock: Number,
    images: [String],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
      },
    ],
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
