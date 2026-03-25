import asyncHandler from "express-async-handler";
import { Order, Product } from "../models/index.js";
import { AppError } from "../middlewares/error.middleware.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new AppError("No order items", 400);
  }

  let totalPrice = 0;

  const items = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);

      if (!product) throw new AppError("Product not found", 404);
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      totalPrice += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();

      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0]?.url,
      };
    })
  );

  const order = await Order.create({
    user: req.user.id,
    orderItems: items,
    shippingAddress,
    totalPrice,
  });

  res.status(201).json({
    status: true,
    message: "Order placed successfully",
    order,
  });
});

// Get My Orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });

  res.json({
    status: true,
    results: orders.length,
    data: orders,
  });
});

// Admin: Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email");

  res.json({
    status: true,
    results: orders.length,
    data: orders,
  });
});