# Invoice App - Setup & Configuration Guide

Welcome to the Setup & Configuration Guide for the Invoice Management Application. This document is the **single source of truth** for all manual setup, environment configurations, and external service provisioning required to build, run, and deploy this project. 

Whether you are a human developer or a future AI engineer cloning this repository, reading this document sequentially from top to bottom will ensure you have a perfectly configured environment.

---

## 1. Project Requirements

Before you begin, ensure your local development environment meets the following requirements:

- **Node.js (v18.0.0 or higher):** Required to run Vite and the modern JavaScript toolchain.
- **npm (v9.0.0 or higher):** The default package manager for this repository. We use standard `npm` to keep the tooling universally accessible.
- **Git (v2.30.0 or higher):** Required for version control and cloning the repository.
- **Operating System:** Windows, macOS, or Linux. The development environment is OS-agnostic.
- **Modern Browser:** Google Chrome, Mozilla Firefox, or Microsoft Edge. We rely heavily on `IndexedDB`, which is supported by all modern browsers.
- **VS Code (Recommended):** We recommend Visual Studio Code with the following extensions:
  - *ESLint*: For real-time code quality checking.
  - *Tailwind CSS IntelliSense*: For auto-completing utility classes.

**Why these requirements?**
This project is built using React, Vite, Tailwind CSS v4, and Firebase. Node.js is the backbone for our local development server, while modern browsers are required because our offline-first architecture leans heavily on native browser APIs (IndexedDB) as the primary data source.

---

## 2. Repository Setup

Follow these steps to get the codebase running locally on your machine.

### Clone the Repository
```bash
git clone <repository-url>
cd Invoice
```

### Install Dependencies
```bash
npm install
```
*Note: Do not use `yarn` or `pnpm` unless you plan to migrate the lockfile, as this project uses `package-lock.json` by default.*

### Folder Overview
- `src/app/`: Global application setup (Router, Layout).
- `src/core/`: Infrastructure (Firebase, Storage Repositories, Offline Sync Engine).
- `src/domain/`: Zod schemas and TypeScript types defining the business logic.
- `src/features/`: Feature-sliced UI and Zustand stores (Customers, Invoices, Settings, Auth).
- `src/shared/`: Reusable, dumb UI atoms (`Button`, `Input`, `Select`).

### First Project Startup
Once dependencies are installed, you can start the development server immediately. Because this is an offline-first app, you can test the UI before even configuring Firebase.
```bash
npm run dev
```

### How to verify the installation
Open your browser to `http://localhost:5173/`. You should see the login screen or the application layout.

---

## 3. Environment Variables

To connect the application to Firebase, you must provide environment variables. Vite requires these variables to be prefixed with `VITE_`.

Create a file named `.env.local` in the root of the project directory.

### Environment Variables Table

| Variable Name | Purpose | Required | Example Value | Where to obtain it |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Authenticates API requests to Firebase. | **Yes** | `AIzaSyD...` | Firebase Console > Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | The domain Firebase uses for OAuth popups. | **Yes** | `your-app.firebaseapp.com` | Firebase Console > Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | The globally unique identifier for your project. | **Yes** | `your-app-id` | Firebase Console > Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET`| Where Firebase Storage files are kept. | **Yes** | `your-app.appspot.com` | Firebase Console > Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Used for Cloud Messaging (not heavily used here). | **Yes** | `123456789012` | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Identifies this specific Web App within Firebase. | **Yes** | `1:123456789:web:abcde` | Firebase Console > Project Settings |

### `.env.example` Structure
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Security Considerations:**
These variables are bundled into the frontend client. They are technically public. Security is enforced via **Firestore Security Rules**, not by keeping these keys secret. Do not commit your `.env.local` file to version control.

---

## 4. Firebase Project Setup

Because this project utilizes Firebase for Cloud Synchronization and Authentication, you must manually create a Firebase project.

1. **Go to the Firebase Console:** Navigate to [console.firebase.google.com](https://console.firebase.google.com/).
2. **Create a Project:** Click "Add Project".
3. **Name your Project:** Choose a clear name (e.g., `agency-invoice-app`).
4. **Google Analytics:** You can disable Google Analytics for this project, as we do not rely on it.
5. **Select Region:** If prompted, select a geographical region closest to your target user base.
6. **Register the Web App:**
   - From the Project Overview page, click the Web icon (`</>`).
   - Give the app a nickname (e.g., `invoice-web-client`).
   - Do NOT check "Also set up Firebase Hosting" yet (we will handle this in deployment).
   - Click "Register app".
7. **Copy Configuration:** Firebase will display a `const firebaseConfig = { ... }` block. Copy the values from this block and paste them into your `.env.local` file, mapping them to the variables outlined in Section 3.
8. **Continue to Console:** Click "Continue to console".

---

## 5. Firebase Authentication

We use Firebase Authentication to identify the user and map their offline data to their specific cloud namespace.

1. **Navigate to Authentication:** In the left sidebar of the Firebase Console, click "Build" -> "Authentication".
2. **Get Started:** Click the "Get Started" button.
3. **Enable Google Provider:**
   - Go to the "Sign-in method" tab.
   - Click "Add new provider".
   - Select "Google".
   - Toggle the "Enable" switch.
   - Select a Project support email from the dropdown.
   - Click "Save".
4. **Authorized Domains:**
   - Go to the "Settings" tab under Authentication, then "Authorized domains".
   - Ensure `localhost` is listed for local development.
   - When you deploy your application, you must add your production domain here.

**Common Mistakes:**
If you receive an `auth/unauthorized-domain` error during login, it means your current domain (e.g., a Vercel preview URL or custom domain) has not been added to the "Authorized domains" list.

---

## 6. Firestore Setup

**CRITICAL REMINDER:** Firestore is **NOT** our primary database. **IndexedDB is our Source of Truth.** Firestore acts strictly as a background backup and synchronization layer. 

1. **Navigate to Firestore:** In the left sidebar, click "Build" -> "Firestore Database".
2. **Create Database:** Click "Create database".
3. **Location:** Select a location (e.g., `nam5` for US Central) and click "Next". Choose carefully; this cannot be changed later.
4. **Start in Production Mode:** Select "Start in production mode". (We will configure the exact security rules in the next step).
5. **Spark Plan Limitations:** Ensure you stay within the free Spark Plan limits. Because our app is offline-first and batches writes, we naturally consume vastly fewer reads/writes than a traditional cloud-first app.

---

## 7. Firebase Security Rules

Because our application writes data from the browser, we must enforce security directly on the database. 

1. **Navigate to Rules:** Inside the Firestore Database dashboard, click the "Rules" tab.
2. **Apply Strict Rules:** Replace the default rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access their own document space
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny for everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
3. **Publish:** Click "Publish".

**Why these rules exist:**
Our `CloudSyncService` writes all entities to a path formatted as `users/{userId}/{entityType}/{entityId}`. These rules guarantee that a user can only ever access data that lives under their specific `userId` directory.

---

## 8. Firebase Storage (If Used)

Currently, **Firebase Storage is intentionally NOT used** in this project.

**Why?**
To maintain pure offline capabilities, agency logos are uploaded and converted directly to **Base64 strings** in the browser and saved within IndexedDB (and subsequently Firestore). This prevents the application from failing to load logos when the user drops offline, avoiding complex asset caching strategies.

If future iterations require heavy asset uploads (like large PDF attachments), Firebase Storage can be provisioned via the console.

---

## 9. Firestore Synchronization

To work on this codebase, you must understand the Offline-First Sync philosophy.

### Architecture Flow:
`React UI` → `Zustand Store` → `IndexedDB Repositories` → `Sync Queue` → `CloudSyncService` → `Firestore`

1. **Offline-First Architecture:** When a user creates an invoice, the data is saved instantly to IndexedDB. The UI never waits for a network request.
2. **The Sync Queue:** Every time an IndexedDB repository mutates data, it adds a JSON payload representing that mutation (CREATE, UPDATE, DELETE) to the local `syncQueue` table.
3. **Background Synchronization:** The `useSyncWorker` hook silently runs in the background. If the `navigator.onLine` API reports true, it drains the queue, pushes the changes to Firestore using `CloudSyncService`, and deletes the completed items from the queue.
4. **Retry Strategy:** If a push fails, the queue item is marked with an `ERROR` status but remains in IndexedDB. The worker will attempt to flush the queue again periodically.

This architecture ensures the app feels blazing fast and works 100% perfectly on airplanes or spotty connections.

---

## 10. Running the Project

### Development Mode
Runs the app with Hot Module Replacement (HMR).
```bash
npm run dev
```

### Type Checking
Ensure you haven't introduced any TypeScript errors.
```bash
npm run typecheck
```

### Production Build
Compiles the application to static files.
```bash
npm run build
```

### Preview Production Build
Locally serve the compiled static files.
```bash
npm run preview
```

---

## 11. Deployment

This project compiles down to purely static files (HTML, CSS, JS). It has no backend Node.js server. 

### Firebase Hosting Deployment
If you are deploying to Firebase Hosting:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```
2. **Login:**
   ```bash
   firebase login
   ```
3. **Initialize Hosting (First time only):**
   ```bash
   firebase init hosting
   ```
   *Select your project. Set `dist` as your public directory. Configure as a single-page app (rewrite all urls to `/index.html`).*
4. **Build and Deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

**Common Deployment Mistakes:**
- Forgetting to add your production domain to the Firebase Authentication "Authorized Domains" list.
- Uploading the `public/` directory instead of the compiled `dist/` directory.

---

## 12. Troubleshooting

### Firebase not connecting / Missing variables
**Cause:** Your `.env.local` file is missing or improperly formatted.
**Solution:** Ensure the file is exactly named `.env.local` in the root folder, and that Vite is restarted after creating it.

### Authentication failing (Popup Closed)
**Cause:** The user closed the Google OAuth popup too quickly, or third-party cookies are heavily blocked.
**Solution:** Clear browser caches, ensure popups are allowed, and try again.

### Permission denied (Firestore)
**Cause:** Security rules are incorrectly configured.
**Solution:** Ensure your `firestore.rules` exactly match the code block in Section 7. Verify that the user is successfully authenticated before sync triggers.

### Dependency installation failures
**Cause:** Node version mismatch.
**Solution:** Ensure you are using Node v18+. Delete `node_modules` and `package-lock.json` and run `npm install` again.

---

## 13. Verification Checklist

Use this checklist to ensure your local environment is perfectly configured:

- [ ] Firebase project created.
- [ ] `.env.local` populated with all 6 required variables.
- [ ] Google Authentication provider enabled in Firebase Console.
- [ ] Firestore Database created in production mode.
- [ ] Firestore Security rules updated to restrict access to `/users/{userId}/`.
- [ ] `npm install` executed successfully.
- [ ] `npm run dev` starts without errors.
- [ ] You can log in via Google in the browser.
- [ ] Creating a customer offline reflects instantly in the UI.
- [ ] When online, the Sync Indicator reports "Cloud Synced".
- [ ] `npm run typecheck` reports 0 errors.
- [ ] `npm run build` succeeds.

---

## 14. Maintenance

- **Updating Dependencies:** Periodically run `npm outdated` and update packages carefully. Pay special attention to React, Zustand, and Firebase SDK updates, as major version bumps can introduce breaking API changes.
- **Switching Environments:** If you need a staging environment, create a separate Firebase project. Create a `.env.staging` file and pass it to Vite during build (`vite build --mode staging`).
- **Rotating Credentials:** If your Firebase config is ever compromised, you can generate new Web App credentials from the Firebase Console. Update your `.env.local` and redeploy. Because we use strict Security Rules, exposed client keys do not give attackers access to user data.
