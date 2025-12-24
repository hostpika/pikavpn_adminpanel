# Project Setup Guide

This guide covers how to set up the project locally, configure environment variables, and connect to Firebase.

## Prerequisites

- **Node.js**: Version 20.x or later.
- **Package Manager**: `npm`, `yarn`, or `pnpm`.

## 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository_url>
cd vpn-admin-panel
npm install
```

## 2. Environment Variables

This project uses two types of environment variables:
1.  **Public Variables**: Safe to expose to the browser (prefixed with `NEXT_PUBLIC_`). Stored in `.env`.
2.  **Private Secrets**: Sensitive keys for the backend (Admin SDK). Stored in `.env.local`.

### A. `.env` (Public Configuration)

This file should be committed to the repository (if it doesn't contain secrets). It contains client-side configuration.

**Ensure your `.env` looks like this:**

```ini
# Firebase Client Configuration (Get these from Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Defaults
NEXT_PUBLIC_ADMIN_EMAIL=your_email@example.com
```

### B. `.env.local` (Private Secrets)

**CRITICAL**: This file MUST NOT be committed to Git. It contains your private service account keys.

Create a file named `.env.local` in the root directory and add the following:

```ini
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"

# Backend Secrets
JWT_SECRET=generate_a_long_random_string_here
ENCRYPTION_KEY=generate_a_random_encryption_key
```

### How to get Firebase Admin Keys:
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Project Settings** -> **Service accounts**.
3.  Click **Generate new private key**.
4.  Open the downloaded JSON file.
5.  Copy the `client_email` to `FIREBASE_CLIENT_EMAIL`.
6.  Copy the `private_key` to `FIREBASE_PRIVATE_KEY` (Keep the `\n` newlines inside the quotes).

## 3. Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### `.env` vs `.env.local`?
- **`.env`**: Default values for all environments.
- **`.env.local`**: Local overrides. **Use this for crucial secrets** like private keys that should never be shared. Next.js automatically loads both.

### Firebase Initialization Errors?
- Ensure `FIREBASE_PRIVATE_KEY` in `.env.local` is enclosed in quotes and includes the `\n` characters.
- Ensure you have enabled **Authentication** and **Firestore** in your Firebase Console.

## 4. Firebase Console Setup

You must manually enable the following services in your Firebase Console for the app to work:

1.  **Authentication**:
    - Go to **Build** -> **Authentication** -> **Get Started**.
    - Enable **Email/Password** provider (for Admin login).
    - Enable **Google** provider (if used for user login).

2.  **Cloud Firestore**:
    - Go to **Build** -> **Firestore Database** -> **Create Database**.
    - Start in **Production mode**.
    - Choose a location (e.g., `us-central1`).
    - *Note: Security rules are provided in `firestore.rules`.*

3.  **Storage**:
    - Go to **Build** -> **Storage** -> **Get Started**.
    - Start in **Production mode**.
    - *Note: Security rules are provided in `storage.rules`.*

4.  **Cloud Messaging (FCM)**:
    - This is usually enabled by default, but check **Project Settings** -> **Cloud Messaging** to ensure you have a "Server key" or verify the API is enabled in Google Cloud Console if needed.

