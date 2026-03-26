# E-Commerce Backend API

A secure and scalable RESTful API for an E-Commerce platform built using **Node.js, Express, MongoDB, JWT, and Multer**.

---

## Features

- Authentication (JWT + Refresh Token)
- Role-based Authorization (Admin / Customer)
- Product Management (CRUD + Image Upload)
- Category Management
- Product Reviews & Ratings
- Order Management
- Password Reset via Email (Nodemailer)
- Security (Helmet, Rate Limit, Validation, Sanitization)

---

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Upload)
- Nodemailer (Email)
- Express Validator

---

## Project Structure
src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/


---

## Installation

```bash
git clone https://github.com/Cygnus-Beta-dev/ecommerce-api.git
cd ecommerce-api
npm install
```

---

## Environment Variables
PORT=8080
MONGODB_URI=your_mongodb_url

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

NODE_ENV=development

## Dev Mode
```bash
npm run dev 
```

---

## Base URL

`http://localhost:8080/v1/api`

## Auth API's

| Method | Endpoint                      | Description      |
| ------ | ----------------------------- | ---------------- |
| POST   | `/auth/register`              | Register user    |
| POST   | `/auth/login`                 | Login            |
| POST   | `/auth/refresh-token`         | Refresh token    |
| POST   | `/auth/logout`                | Logout           |
| GET    | `/auth/me`                    | Get current user |
| POST   | `/auth/forgot-password`       | Send reset email |
| POST   | `/auth/reset-password/:token` | Reset password   |


## Product Api

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/products`                      | Get all products       |
| GET    | `/products/:id`                  | Get product            |
| GET    | `/products/category/:categoryId` | Products by category   |
| POST   | `/products`                      | Create product (Admin) |
| PUT    | `/products/:id`                  | Update product (Admin) |
| DELETE | `/products/:id`                  | Delete product (Admin) |
| POST   | `/products/:id/rating`           | Add rating             |


## Category API's

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| GET    | `/categories`     | Get all categories      |
| POST   | `/categories`     | Create category (Admin) |
| PUT    | `/categories/:id` | Update category         |
| DELETE | `/categories/:id` | Delete category         |

## Order API's

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | `/orders`           | Create order       |
| GET    | `/orders/my-orders` | My orders          |
| GET    | `/orders`           | All orders (Admin) |


## File Upload (Product Images)
Use multipart/form-data
Key: images
Max: 4 images


## Authentication

Use:

Authorization: Bearer <access_token>
OR cookies (auto-handled)


## Security Features
Helmet
Rate Limiting
Input Validation
MongoDB Injection Protection
Password Hashing (bcrypt)


## Key Highlights
Modular architecture
Clean error handling
Secure authentication with token rotation
Optimized query filtering (pagination, search, sort)


## Bonus Features
Image upload with Multer
Email-based password reset
Product rating system