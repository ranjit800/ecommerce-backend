# E-Commerce Backend API

Multi-vendor e-commerce platform backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (CUSTOMER, VENDOR, SUPERADMIN)
- **Multi-Vendor Support**: Complete vendor management system
- **Product Management**: CRUD operations with categories, images, variants
- **Order Processing**: Multi-vendor order handling with status tracking
- **Payment Integration**: Ready for payment gateway integration
- **Multi-Currency**: Support for INR and USD

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Express Validator
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Create `.env` file in root:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Vendors (SUPERADMIN)
- `GET /api/superadmin/vendors` - Get all vendors
- `PUT /api/superadmin/vendors/:id/approve` - Approve vendor
- `PUT /api/superadmin/vendors/:id/reject` - Reject vendor
- `PUT /api/superadmin/vendors/:id/suspend` - Suspend vendor

### Products (VENDOR)
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/vendor/orders` - Get vendor orders
- `PUT /api/orders/:id/status` - Update order status

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (SUPERADMIN)
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── .gitignore
└── package.json
```

## 🔐 Default Credentials

**SUPERADMIN:**
- Email: `superadmin@gmail.com`
- Password: `super123456`

**VENDOR:**
- Email: `vendor@gmail.com`
- Password: `vendor123456`

## 🚀 Deployment

### Deploy to Railway/Render

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=production_secret_key_minimum_32_characters
JWT_EXPIRE=30d
NODE_ENV=production
```

## 📝 License

MIT

## 👨‍💻 Author

Your Name
