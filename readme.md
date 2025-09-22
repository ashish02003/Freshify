🥬 Freshify – Online Grocery Delivery Platform

Freshify is a full-stack web application inspired by Blinkit, built to provide users with a seamless grocery shopping experience. Customers can register, search, order groceries, make payments (Cash on Delivery & Online via Stripe), and track their orders. An Admin Dashboard is also included to manage products, categories, orders, and revenue.

✨ Features
👨‍💻 User Side

🔐 Authentication & Authorization

Register & Login

Email verification after registration

Forgot & Reset password via email

👤 Profile Management

Upload/change profile picture

Save multiple delivery addresses

🛒 Shopping & Orders

Search products by text or voice input 🎙️

Place orders with Cash on Delivery or Stripe Payment

Track order status in real-time

Cancel orders before delivery

View complete order history

Write reviews for delivered items

🛠️ Admin Dashboard

📂 Manage Categories & Subcategories (Add / Edit / Delete)

📦 Manage Products (Upload / Update / Delete)

👥 Manage Users and their orders

🚚 Handle delivery operations (Confirmed/shipped/delivered)

💰 View total revenue and order analytics

🏗️ Tech Stack

Frontend: React.js, Redux, Tailwind CSS

Backend: Node.js, Express.js, MongoDB Atlas

Authentication: JWT, bcrypt,cookies Resend(Email)

Payments: Stripe API

Other: Cloudinary (for images), Toast notifications, Voice recognition API

⚙️ Installation & Setup

1.> Clone this repository :

git clone https://github.com/ashish02003/Freshify


2.> Install dependencies

# Install server dependencies
cd Backend
npm install

# Install frontend dependencies
cd Frontend
npm install

3.> Set up environment variables
Create .env files in both backend & frontend folders. Example:

Backend .env

FRONTEND_URL = "http://localhost:5173"
MONGODB_URI = your_online_mongodb_url
RESEND_API =your_resend_api_key
SECRET_KEY_ACCESS_TOKEN = your_access_token_secret
SECRET_KEY_REFRESH_TOKEN =your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET_KEY=your_cloudinary_api_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_ENPOINT_WEBHOOK_SECRET_KEY=your_stripe_webhook_secret_key


Frontend .env

VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_API_URL:"http://localhost:8080"

4.>Run the application

# Run backend
cd Backend
npm run dev

# Run frontend
cd Frontend
npm run dev
