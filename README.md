# PayFlux AI

**PayFlux AI** is a Smart Payment Gateway equipped with *Offline-First Processing* and *Payment Intelligence*. It ensures a seamless transaction experience even when network connectivity drops, queues your payments securely, and offers smart analytics on your transactions.

This repository is divided into two major components:
- **[Backend](./backend/)**: Node.js/Express server providing robust API endpoints, secure Razorpay integration, offline queue handling, and payment intelligence logic.
- **[Mobile](./mobile/)**: React Native Expo app providing the user interface, offline queuing, and transaction management components.

## Getting Started

Please check the individual documentation in each folder to run the services:
- [Backend Documentation](./backend/README.md)
- [Mobile Documentation](./mobile/README.md)

## Key Features
- **Offline-First Payments**: Queue payments when disconnected from the internet and process them automatically once online.
- **Payment Intelligence**: Built-in rules and risk-scorers configured to process, assess, and organize payments dynamically.
- **Razorpay Integration**: Handles direct payment capturing safely and reliably.
