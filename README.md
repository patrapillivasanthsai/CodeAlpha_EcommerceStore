# CodeAlpha E-Commerce Store (`CodeAlpha_EcommerceStore`)

Full-Stack E-Commerce Web Application developed for the **CodeAlpha Full Stack Development Internship**.

---

## 🌟 Project Overview

**CodeAlpha_EcommerceStore** is a modern, clean, and responsive full-stack e-commerce web application. It features real-time catalog browsing, category filtering, keyword search, guest and user shopping cart synchronization, safe password hashing, JWT authentication, and a simulated checkout flow powered by PostgreSQL transactions.

---

## ✨ Features

- **User Authentication**: Secure Registration & Login using `bcryptjs` password hashing and JWT token issuance.
- **Product Catalog**: View products, search by keyword, filter by categories, and sort by price or rating.
- **Product Details**: Detailed view with high-res product imagery, descriptions, rating indicators, and real-time inventory stock checking.
- **Shopping Cart**:
  - Guest Cart: Stored in `localStorage` for unauthenticated visitors.
  - User Cart: Stored in PostgreSQL database for registered users.
  - Cart Merging: Guest cart items automatically merge into the user's PostgreSQL database cart upon login/registration.
- **Simulated Checkout Flow**:
  - PostgreSQL transaction (`BEGIN`, `COMMIT`, `ROLLBACK`) handles checkout atomically.
  - Server-Side Calculation: Subtotal, tax (8%), shipping fee, and grand total calculated strictly on the backend to prevent price tampering.
  - Inventory Deduction: Stock quantity is validated and decremented safely inside the checkout transaction.
- **Order History**: View past orders with itemized breakdowns, total prices, shipping addresses, and status badges.
- **Responsive Design**: Custom CSS supporting desktop, tablet, and mobile displays.

---

## 🛠 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 + Vite |
| **Styling** | Custom Responsive CSS |
| **Icons** | Lucide React |
| **Backend Framework** | Node.js + Express.js |
| **Database** | PostgreSQL |
| **Database Driver** | `pg` (node-postgres) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) |
| **Password Hashing** | `bcryptjs` |
| **Input Validation** | `express-validator` |
| **API Client** | Axios |
| **API Style** | RESTful |

---

## 📁 Project Structure

```
CodeAlpha_EcommerceStore/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool configuration
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, Register, Profile endpoints
│   │   │   ├── productController.js  # Catalog, filters, search
│   │   │   ├── cartController.js     # Cart items & guest merging
│   │   │   ├── orderController.js    # PostgreSQL checkout transactions
│   │   │   └── userController.js     # Profile management
│   │   ├── database/
│   │   │   ├── schema.sql            # Table DDL definitions
│   │   │   ├── seed.sql              # Sample seed products
│   │   │   └── initDb.js             # Idempotent DB setup runner
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT authorization checker
│   │   │   ├── validateRequest.js    # Express-validator error handler
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── routes/                   # Express REST route handlers
│   │   └── server.js                 # Express server entry point
│   ├── .env.example                  # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Footer, ProductCard, Spinner, Alerts
│   │   ├── context/                  # AuthContext & CartContext
│   │   ├── pages/                    # Home, Catalog, Detail, Cart, Checkout, Auth, Orders
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with JWT interceptor
│   │   ├── styles/                   # index.css & App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`/backend/.env`)

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=codealpha_ecommerce

# JWT Secret Key
JWT_SECRET=super_secret_jwt_key_codealpha_2026_dev
JWT_EXPIRES_IN=7d
```

### Frontend (`/frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Step-by-Step Setup & How to Run

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL service is running on your machine.
Create a PostgreSQL database named `codealpha_ecommerce` or adjust credentials in `backend/.env`.

```sql
CREATE DATABASE codealpha_ecommerce;
```

Execute the database initialization script (creates tables idempotently and populates sample products):

```bash
cd backend
npm run db:init
```

### 2. Running the Backend Server

```bash
cd backend
npm install
npm run dev
```

The Express API server will start at `http://localhost:5000`.

### 3. Running the Frontend Application

Open a new VS Code terminal tab:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5174`.

---

## 📡 API Overview

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register new user.
- `POST /api/auth/login`: Authenticate user & return JWT.
- `GET /api/auth/me`: Get current user info (Protected).

### Product Endpoints (`/api/products`)
- `GET /api/products`: Fetch products (query params: `category`, `search`, `sort`).
- `GET /api/products/categories`: Fetch unique product categories.
- `GET /api/products/:id`: Fetch single product by ID.

### Cart Endpoints (`/api/cart`)
- `GET /api/cart`: Get authenticated user's cart (Protected).
- `POST /api/cart`: Add item to cart (Protected).
- `POST /api/cart/merge`: Merge guest `localStorage` items to database cart (Protected).
- `PUT /api/cart/:cartItemId`: Update cart item quantity (Protected).
- `DELETE /api/cart/:cartItemId`: Remove cart item (Protected).
- `DELETE /api/cart`: Clear entire user cart (Protected).

### Order Endpoints (`/api/orders`)
- `POST /api/orders/checkout`: Place order using PostgreSQL transaction (Protected).
- `GET /api/orders`: Get user order history (Protected).
- `GET /api/orders/:id`: Get order receipt by ID (Protected).

---

## 🛡 Security Practices

1. Password Hashing: Password hashes generated using `bcryptjs` with salt rounds = 10. Passwords are never stored in plain text or returned in API responses.
2. Route Protection: JWT verification middleware guards cart, order, and profile endpoints.
3. SQL Injection Prevention: All database queries use parameterized SQL (`$1`, `$2`).
4. Strict Server Calculations: Product prices and order totals are calculated on the backend during checkout to prevent client-side tampering.
