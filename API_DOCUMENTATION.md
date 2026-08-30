# MGM DABHA - REST API Documentation (V12.0)

## 1. Authentication & Users
- `POST /api/signup`: Register new customer account (`name`, `email`, `phone`, `password`).
- `POST /api/login`: Authenticate customer/admin account.
- `POST /api/referral/claim`: Claim referral code (`user_id`, `referral_code`) for +100 bonus loyalty points.

## 2. Menu & Inventory
- `GET /api/menu`: Fetch full food menu catalog with stock quantity.
- `PUT /api/inventory/update`: Update item stock quantity and availability (`food_id`, `stock_quantity`, `is_available`).

## 3. Cart & Orders
- `GET /api/cart`: Fetch user's cart items.
- `POST /api/cart`: Add dish item with custom add-ons to cart.
- `POST /api/order`: Place food order and auto dispatch to Kitchen Display System (KDS).
- `POST /api/reorder/:order_id`: Reorder past order items directly to cart.

## 4. Portals APIs
- `GET /api/kitchen/orders`: Fetch active chef preparation queue.
- `PUT /api/kitchen/order-status/:id`: Update KDS status (**Preparing ➔ Ready**).
- `GET /api/owner/summary`: Executive owner financial revenue & expense overview.
- `POST /api/owner/expenses`: Log new restaurant operating expense.
- `GET /api/delivery/orders`: Fetch assigned delivery orders.
- `PUT /api/delivery/order-status/:id`: Update delivery order pipeline status.

## 5. DevOps & Admin APIs
- `GET /api/admin/backup/export`: Generate and stream downloadable `.sql` database backup.
- `GET /api/admin/live-notifications`: Aggregate real-time admin alert metrics.
