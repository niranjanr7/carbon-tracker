# Carbon Tracker 🌱

Carbon Tracker is a web application designed to help users understand, monitor, and manage their carbon footprint. It provides tools to calculate emissions, track progress, set sustainability goals, and explore recommendations for adopting environmentally friendly habits.

## Features

- **Carbon Calculator:** Estimate your carbon footprint based on daily activities.
- **Dashboard:** View an overview of your carbon footprint and sustainability progress.
- **Analytics:** Explore carbon emission trends and visual insights.
- **Activity History:** Review previously recorded carbon footprint information.
- **Sustainability Goals:** Set and monitor personal environmental goals.
- **Recommendations:** Explore suggestions to reduce your carbon footprint.
- **Achievements:** Track milestones and sustainability-related accomplishments.
- **User Authentication:** Access login and registration pages.
- **Reports:** View carbon footprint reports.

## Technology Stack

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- Bun
- Vitest

## Project Structure

```text
Carbon-Tracker/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── test/
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── .gitignore
├── bun.lock
├── bunfig.toml
├── components.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Prerequisites

Before running the project, ensure that you have installed:

- Node.js (LTS version recommended)
- Bun
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd Carbon-Tracker
```

### 3. Install dependencies

```bash
bun install
```

### 4. Configure Firebase

Create a root-level `.env.local` file with the Firebase web app settings:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

In Firebase Console, enable **Authentication → Email/Password** and create a database under **Firestore Database**. In Firestore **Rules**, publish the contents of [`firestore.rules`](./firestore.rules). The rules restrict each signed-in user to documents under their own UID.

The app syncs records, profile, and goals with Firestore across browsers and devices. On first sign-in from each browser, that browser's existing local data is merged into the signed-in account without overwriting records already in Firestore.

### 5. Start the development server

```bash
bun run dev
```

### 6. Open the application

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## Running Tests

To execute the project's tests:

```bash
bun run test
```

Check `package.json` for the available scripts.

## Production Build

To generate a production build:

```bash
bun run build
```

The generated production files will typically be available in the `dist/` directory.

## Development

You can use Visual Studio Code or any other code editor to modify and extend the application.

To stop the development server, press:

```text
Ctrl + C
```

## License

This project is intended for educational and development purposes.
