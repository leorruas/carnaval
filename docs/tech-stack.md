# Architecture & Tech Stack

## Core
- **Runtime**: Node.js
- **Build Tool**: Vite
- **Language**: JavaScript / TypeScript (Migrating to TS recommended if not already)
- **Library**: React

## Styling
- **Engine**: TailwindCSS
- **PostCSS**: Configured via `postcss.config.js`
- **Animations**: Framer Motion

## State Management
- **Store**: Zustand (Global state for favorites)
- **Persistence**: `localStorage` (via Zustand middleware)

## Integrations
- **Maps**: Google Maps Links / OSRM
- **Transport**: Uber Deep Links
- **Backend (Optional)**: Firebase (Auth, Firestore)

## Folder Structure
- `src/`: Source code
- `docs/`: Documentation (This folder)
- `.agent/`: AI Agent configurations
