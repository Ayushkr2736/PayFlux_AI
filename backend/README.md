# PayFlux AI - Backend

The backend engine for PayFlux AI, built on Node.js, Express, and MongoDB.

## Features
- **Authentication**: JWT-based secure user sessions and profile management.
- **Payment APIs**: Core routes for handling Razorpay transactions, webhooks, and custom logic rules.
- **Offline Queue Support**: Specific routes to handle and store offline payments synced from the mobile application.

## Setup and installation
1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Rename `.env.example` to `.env` and configure your credentials (e.g., MongoDB URI, Razorpay Keys, JWT Secrets).

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

The server will be available dynamically on the configured PORT.
