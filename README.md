# 🍔 BiteFlow - Canteen POS & Billing Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Stack](https://img.shields.io/badge/stack-MERN--Zustand-blue.svg)](#)
[![Design](https://img.shields.io/badge/design-Slate%20Dark-indigo.svg)](#)

BiteFlow is a state-of-the-art, high-performance Point of Sale (POS) and inventory management system designed specifically for canteens and restaurants. Featuring a highly responsive MERN architecture, BiteFlow is powered by **Zustand** for lightweight state management and optimized rendering performance.

---

## 🚀 Key Features

*   **⚡ Point of Sale (POS) Terminal**: High-performance cart and checkouts, kitchen order tickets (KOT) generation, and print-ready receipts.
*   **👥 Smart Table Sharing**: Multi-customer support on a single physical dining table with independent active carts (`Cust 1`, `Cust 2`, etc.), shared table indicators, and concurrent status tracking.
*   **📐 Dynamic Table adjustments**: Live layout editor allowing the owner to add new tables, adjust capacity inline, or delete tables on the fly.
*   **🌐 Online Order Integrations**: Track and log orders from delivery partners (Zomato, Swiggy, WhatsApp, Website, etc.) with platform indicators.
*   **📊 Analytics Dashboard**: Visual sales analytics, 7-day revenue charts (Recharts), monthly sales targets, category breakdowns, and low-stock reorder warnings.
*   **📦 Dishes & Recipe Management**: Connect dishes to raw ingredients. Selling a dish automatically deducts appropriate quantities from inventory stock levels.
*   **🧾 Complete Billing History**: Chronological invoice tracking with search, status filtering (`kitchen`, `served`, `paid`, `cancelled`), and print actions.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, Zustand, Recharts, Lucide Icons
*   **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), Bcrypt
*   **Optimization**: Zustand selective selectors for rendering optimization, local stock deduplication.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/          # DB connection configuration
│   ├── controllers/     # Controller handlers (orders, tables, dishes, products)
│   ├── middleware/      # Auth security filters
│   ├── models/          # Mongoose database models
│   ├── routes/          # RESTful endpoint routes
│   └── server.js        # Main server entrypoint
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI controls & Modals
    │   │   └── pos/     # Modularized POS sub-components
    │   ├── store/       # Zustand reactive state store (usePosStore.js)
    │   ├── pages/       # Dashboard, POS, Inventory, Suppliers
    │   └── App.jsx      # Navigation routers
```

---

## ⚙️ Quick Start

### 1. Backend Setup
1. Navigate to `/backend` and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure environmental variables in `/backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to `/frontend` and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Launch the Vite dev server:
   ```bash
   npm run dev
   ```

---

## 📜 Database & Activity Logs

<details>
<summary>📂 View Simulation Transaction Log (JSON Format)</summary>
<br>

<p align="left"><font size="2" color="gray">The following logs simulate Mongoose schema state changes during table-sharing and online orders:</font></p>

```json
[
  {
    "timestamp": "2026-05-28T16:15:30.125Z",
    "event": "ORDER_KOT_SUBMITTED",
    "details": {
      "billNo": "BILL-20260528-0012",
      "type": "dine-in",
      "tableNo": "Table 4",
      "items": [
        { "name": "Kadai Chicken", "quantity": 1, "price": 200 }
      ],
      "total": 210.00,
      "status": "kitchen"
    },
    "tableState": {
      "tableNo": "Table 4",
      "status": "occupied",
      "activeCustomersCount": 1
    }
  },
  {
    "timestamp": "2026-05-28T16:16:42.340Z",
    "event": "ORDER_SHARED_KOT_SUBMITTED",
    "details": {
      "billNo": "BILL-20260528-0013",
      "type": "dine-in",
      "tableNo": "Table 4",
      "items": [
        { "name": "Onion curry", "quantity": 2, "price": 100 }
      ],
      "total": 210.00,
      "status": "kitchen"
    },
    "tableState": {
      "tableNo": "Table 4",
      "status": "occupied",
      "activeCustomersCount": 2
    }
  },
  {
    "timestamp": "2026-05-28T16:18:10.990Z",
    "event": "ORDER_ONLINE_SETTLED",
    "details": {
      "billNo": "BILL-20260528-0014",
      "type": "online",
      "platform": "Swiggy",
      "items": [
        { "name": "Onion curry", "quantity": 1, "price": 100 }
      ],
      "total": 105.00,
      "paymentMethod": "upi",
      "status": "paid"
    }
  },
  {
    "timestamp": "2026-05-28T16:20:05.110Z",
    "event": "ORDER_SHARED_PAID_PARTIAL",
    "details": {
      "billNo": "BILL-20260528-0012",
      "type": "dine-in",
      "tableNo": "Table 4",
      "paymentMethod": "cash",
      "status": "paid"
    },
    "tableState": {
      "tableNo": "Table 4",
      "status": "occupied",
      "activeCustomersCount": 1,
      "notes": "Table remains occupied by BILL-20260528-0013"
    }
  },
  {
    "timestamp": "2026-05-28T16:22:15.550Z",
    "event": "ORDER_SHARED_PAID_FINAL",
    "details": {
      "billNo": "BILL-20260528-0013",
      "type": "dine-in",
      "tableNo": "Table 4",
      "paymentMethod": "card",
      "status": "paid"
    },
    "tableState": {
      "tableNo": "Table 4",
      "status": "available",
      "activeCustomersCount": 0,
      "notes": "All orders settled. Table released."
    }
  }
]
```
</details>

<details>
<summary>📋 View Development Milestone Changelog</summary>
<br>

*   <small>**v1.0.0**: Base POS terminal launch. Simple dine-in and takeaway billing.</small>
*   <small>**v1.1.0**: Inventory tracking and raw ingredient stock automatic deductions.</small>
*   <small>**v1.2.0**: Added dynamic dining table layout adjustments and capacities editor.</small>
*   <small>**v1.3.0**: Decoupled tables from single orders. Added multi-customer table sharing, online orders (Zomato/Swiggy), and Zustand selective selectors.</small>
</details>
