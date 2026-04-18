# 🚀 PayFlux AI

**PayFlux AI** is a state-of-the-art, **Smart Payment Gateway** built with resilience, intelligence, and modern user experience in mind. It bridges the gap between conventional online transactions and real-world network unreliability by utilizing a sophisticated **Offline-First Processing Strategy** combined with **Payment Intelligence**.

Our application guarantees that you can collect, queue, and process payments without fear of network instability, while leveraging custom-built analytical rules to risk-score and categorize intents dynamically.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Project Architecture](#-project-architecture)
3. [Folder Structure](#-folder-structure)
4. [Backend Overview (Node.js)](#-backend-overview)
5. [Mobile Overview (React Native)](#-mobile-overview)
6. [Getting Started (Local Development)](#-getting-started)
7. [Environment Configuration](#-environment-configuration)

---

## ✨ Core Features

### 📡 Offline-First Execution Queue
- **Real-time Network Detection:** The mobile client actively listens to network changes.
- **Secure Local Queue Pipeline:** Transactions made offline are securely saved to `@react-native-async-storage/async-storage` and tagged with unique idempotency keys (`uuid`).
- **Background Sync Engine:** Once the network returns, the `SyncEngine` and `SyncManager` process the cached queue, sending transactions seamlessly to the backend for final execution.

### 🧠 Payment Intelligence
- **Intent Detector:** Captures contextual information to categorize if the payment is high-priority or standard.
- **Risk Scorer:** Dynamically evaluates transactions to reduce fraud risk based on amount, velocity, and frequency limits.
- **Dynamic Rules Engine:** Executes specific constraint configurations (Amount limits, location context, timeframe limits).

### 💳 Razorpay Gateway
- Fast, secure validation and processing securely connecting directly via **Razorpay APIs**.
- Highly robust backend webhooks parsing to confirm end-state updates accurately.

---

## 🏗 Project Architecture

PayFlux AI adopts a Client-Server decoupled architecture:

* **Presentation Layer (Mobile):** Built with React Native & Expo. Utilizing Context Providers (`PaymentContext`, `QueueContext`, `AuthContext`) for centralized state management. Native navigation via `@react-navigation`.
* **Business Logic Layer (Backend):** Built using Node.js & Express. Contains modular, separation-of-concerns logic utilizing Controllers, Services, and custom Middlewares (Authentication, Error Mapping, Validate).
* **Data Layer (MongoDB):** Highly schematic documents for Users, Payments histories, and Payment Queues utilizing `Mongoose`. 

---

## 📂 Folder Structure

```text
PayFlux_AI/
├── backend/                    # Node.js + Express backend service
│   ├── src/
│   │   ├── config/             # DB & Razorpay mappings
│   │   ├── controllers/        # Request handling and response formatting
│   │   ├── intelligence/       # AI Intent Detection, Risk Scoring & dynamic Rules 
│   │   ├── middleware/         # Security, validation, and error guards
│   │   ├── models/             # Mongoose schemas (User, Payment, PaymentQueue)
│   │   ├── routes/             # Express API routing definitions
│   │   ├── services/           # Heavy business logic & External API execution
│   │   └── utils/              # Cryptography, loggers, formatting
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Backend Node dependencies
│   └── server.js               # Express application entrypoint
│
└── mobile/                     # React Native Expo application
    ├── src/
    │   ├── components/         # Reusable UI parts (Loaders, PaymentCards, Banners)
    │   ├── hooks/              # Custom React hooks (useNetworkStatus, useQueue) 
    │   ├── navigation/         # Sub-app routing trees via React Navigation
    │   ├── screens/            # Full page views (Home, History, Payment, Queue, Auth)
    │   ├── services/           # API handlers, SyncManager, OfflineQueue
    │   ├── store/              # Context Providers (State Management)
    │   ├── theme/              # Centralized global styles and color pallets
    │   └── utils/              # Data structural formatters, Crypto, constants
    ├── App.js                  # Frontend root provider wrapper
    ├── app.json                # Expo config
    └── package.json            # React Native dependencies
```

---

## 🖥 Backend Overview

The `/backend` service binds the front-end requests to the database and payment processors.

- **Stack**: `Node.js`, `Express.js`, `MongoDB/Mongoose`.
- **Security**: JWT (`jsonwebtoken`) authentication, HTTP header safeguards (`helmet`), and Encrypted secrets (`bcryptjs`).
- **Core APIs Include:**
    - `POST /api/auth/*`: Registration, Login, and secure session handshakes.
    - `POST /api/payments/*`: Instantiating and capturing direct transactions.
    - `POST /api/queue/*`: Syncing buffered offline payment histories.
    - `POST /api/webhooks`: Secure endpoints receiving real-time payloads automatically from Razorpay.

---

## 📱 Mobile Overview

The `/mobile` directory holds our powerful frontend designed to give users a premium, non-blocking operational experience regardless of their geographical ISP state.

- **Stack**: `React Native`, `Expo`, `Axios`.
- **Intelligent Features**: 
    - **`SyncManager.js` & `OfflineQueue.js`**: Handle background hydration.
    - Context-driven layout that adapts visually if internet is lost (rendering the `IntelligenceBanner` and `QueueStatusBadge`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection URL
- Razorpay Account (Test Mode)
- Expo CLI or Expo Go app on physical mobile.

To effectively boot the systems, split your terminal to run both the backend and mobile modules concurrently.

#### 1. Boot up the Backend

```bash
cd backend
npm install

# Make sure to copy environment configurations (see next section)
cp .env.example .env

npm run dev
```

#### 2. Boot up the Mobile App

```bash
cd mobile
npm install

# Start the Expo bundler
npm start
```
*Hit `a` for android emulation, `i` for ios, or scan the QR code utilizing Expo Go.*

---

## 🔐 Environment Configuration

Within the `/backend` folder, set your `.env` variables aligned with `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/payflux
JWT_SECRET=your_super_secure_hash
RAZORPAY_KEY_ID=rzp_test_.......
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

*Note: The frontend (`mobile`) will by default interface with `http://localhost:5000` assuming the backend remains on Port 5000.*

--- 

> **Designed with 💡 for reliability.**
