# FoodieGo — Restaurant Food Ordering System (Zomato-style)

MCA Project | Full-Stack Web App

## Tech Stack
- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JS (fetch API)
- **Backend:** Node.js, Express.js (REST API)
- **Database:** SQLite (file-based, zero-setup) — schema written in plain SQL so it's a **direct drop-in for MySQL**
- **Auth:** JWT + bcrypt (register/login ready)

## Features
- Restaurant listing with 
- Filters: Under ₹100, Under ₹200, Buy 1 Get 1, Veg/Non-Veg, Fast Delivery, Rating 4.0+
- Restaurant menu modal with veg/non-veg indicators
- Cart with quantity controls
- Coupon codes (FOODIE50, WELCOME20, BOGO) — validated server-side
- Live billing: item total + delivery fee + GST + discount = grand total
- Orders saved permanently to the database
- User register/login API (JWT)

## How to Run

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:5000** in your browser. That's it — frontend and backend both run from one server. Database auto-creates and seeds itself on first run (`backend/foodapp.db`).

## Project Structure
```
foodapp-full/
├── backend/
│   ├── config/db.js       # DB connection + schema + seed data
│   ├── routes/
│   │   ├── restaurants.js # GET /api/restaurants, /api/restaurants/:id
│   │   ├── orders.js      # POST /api/orders, GET /api/orders
│   │   ├── coupons.js     # POST /api/coupons/apply
│   │   └── auth.js        # POST /api/auth/register, /login
│   ├── server.js          # Express app entry point
│   └── package.json
└── frontend/
    └── index.html         # Full UI (Bootstrap + JS, calls the API above)
```

## API Endpoints
| Method | Endpoint                  | Purpose                        |
|--------|----------------------------|---------------------------------|
| GET    | /api/restaurants          | List all restaurants + menus   |
| GET    | /api/restaurants/:id      | Single restaurant + menu       |
| POST   | /api/orders                | Place an order, get bill       |
| GET    | /api/orders                | Order history                  |
| POST   | /api/coupons/apply         | Validate & apply coupon        |
| POST   | /api/auth/register          | Create user account            |
| POST   | /api/auth/login             | Login, get JWT                 |

## Switch to Real MySQL (for your college submission if MySQL is required)
1. `npm install mysql2`
2. Set up MySQL and create a database, e.g. `foodiego`
3. In `backend/config/db.js`, replace the `better-sqlite3` connection with:
   ```js
   const mysql = require('mysql2/promise');
   const pool = mysql.createPool({
     host: 'localhost', user: 'root', password: 'yourpassword', database: 'foodiego'
   });
   ```
4. Convert the `CREATE TABLE` statements (already plain SQL) into a `schema.sql` file and run it once via MySQL CLI or Workbench.
5. In each route file, change `db.prepare(...).get()/.all()/.run()` calls to `await pool.query(...)` — the SQL strings themselves barely change.

## Switch to MongoDB (alternative)
1. `npm install mongoose`
2. Create Mongoose schemas for Restaurant, MenuItem (or embed menu in Restaurant), Order, User, Coupon — mirroring the SQL columns above.
3. Replace `db.prepare(...)` calls in routes with Mongoose model calls (`Restaurant.find()`, `Order.create()`, etc).

## Notes for your project report
- This uses a layered MVC-style structure (routes → controllers logic inline → db) typical of Express REST APIs.
- Passwords are hashed with bcrypt; sessions handled via JWT tokens.
- Billing logic (GST 5%, free delivery above ₹299, BOGO = pay for half quantity rounded up) is calculated server-side in `orders.js` so it can't be tampered with from the browser.
