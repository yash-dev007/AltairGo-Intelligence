# Client Side Plan (Frontend)

This document outlines the frontend architecture of the **AltairLabs Travel Intelligence Platform**.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite (Fast HMR and bundling)
- **Routing**: React Router DOM v6
- **Styling**: CSS Modules + Global CSS Variables
- **Icons**: Lucide React

## Core Architecture
- **Single Page Application (SPA)**: The app provides smooth transitions (e.g., between Home and Details) without full page reloads.
- **Routing Structure (`App.jsx`)**:
    - `/`: Home Page (Hero, Features, Carousel).
    - `/destinations`: Grid of all destinations.
    - `/destinations/:id`: Dynamic details page fetching data by ID.
    - `/planner`: Complex multi-step wizard for trip planning.

## Data Flow
- **Fetching**: Components consume data directly from the Backend API using standard `fetch` API.
    - `fetch('http://localhost:5000/destinations/1')`
- **State Management**:
    - **Local State (`useState`)**: Used for form inputs (Search, Reviews), UI toggles (Modals), and sorting logic.
    - **Effect Hooks (`useEffect`)**: Used to trigger data fetching on page load or ID change.
- **Optimistic UI**: 
    - When a user submits a review, the UI updates the review list *immediately* before waiting for the server response. This makes the app feel instant and responsive.

## Styling System
- **CSS Modules**: We use `.module.css` (e.g., `DestinationDetails.module.css`) to scope styles to components, preventing global namespace collisions.
- **Global Variables (`index.css`)**: 
    - Colors: `--primary`, `--text-main`, `--bg-light`
    - Typography: Standardized font sizes and weights for a premium look.
- **Responsive Design**: All components use media queries to adapt to Mobile (375px), Tablet (768px), and Desktop layouts.
