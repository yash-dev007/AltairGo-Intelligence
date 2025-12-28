# AltairGo Intelligence 🌍✈️

**AltairGo Intelligence** is a next-generation travel planning platform designed to empower travelers with smart, data-driven insights. It combines a modern, responsive React frontend with a Flask-based backend to provide intelligent itinerary generation, budget estimation, and crowd-aware travel advice.

![Project Status](https://img.shields.io/badge/Status-In%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Key Features

*   **🤖 Smart Trip Planner**: AI-powered itinerary generation that creates personalized day-by-day plans based on your interests.
*   **🌍 Global Start Location**: Integrated **OpenStreetMap (Nominatim)** search allows you to pinpoint your exact starting origin, from major cities to rural villages.
*   **📅 Intelligent Date Selection**: 
    *   **Flexible Dates**: Plan by duration (e.g., "7 days in June").
    *   **Anytime**: Perfect for early-stage planning.
    *   **Fixed Dates**: Precise scheduling.
*   **💰 Budget Calculator**: Real-time estimation of travel costs based on your itinerary.
*   **👥 Crowd Intelligence**: unique "Smart Insights" that warn you about high tourist density and suggest optimal times to visit.
*   **🌏 Multi-Country Support**: Curated data for **India**, **Vietnam**, **Thailand**, **Philippines**, **Japan**, **France**, **Spain**, and **Italy**.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 19 (via Vite)
*   **Styling**: CSS Modules with modern Glassmorphism UI
*   **Icons**: Lucide React
*   **State**: React Hooks (useState, useEffect)

### Backend
*   **Server**: Python Flask
*   **AI Logic**: Custom heuristic algorithms for itinerary generation
*   **API**: RESTful endpoints (`/generate-itinerary`, `/calculate-budget`, `/smart-insight`)
*   **Data**: JSON-based destination data & OSM Nominatim API integration

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   Python (v3.9 or higher)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/yash-dev007/AltairGo-Intelligence.git
cd AltairGo-Intelligence
```

### 2. Backend Setup
The backend runs on Flask and serves the intelligent features of the app.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```
> The backend server will start at `http://127.0.0.1:5000`

### 3. Frontend Setup
The frontend is a fast Vite + React application.

```bash
# Open a new terminal and navigate to the root directory
# Install dependencies
npm install

# Start the development server
npm run dev
```
> The frontend will be available at `http://localhost:5173`

## 📂 Project Structure

```
AltairGo-Intelligence/
├── backend/                # Python Flask Application
│   ├── app.py             # Main application entry point & API routes
│   ├── destinations.py    # Destination data source
│   ├── regions.py         # Region data source
│   └── requirements.txt   # Python dependencies
├── src/                    # React Frontend Source
│   ├── components/        # Reusable UI components
│   │   └── TripPlanner/   # Complex planner components (DateModal, etc.)
│   ├── pages/             # Page components (TripPlannerPage, etc.)
│   ├── services/          # API integration services (TripAI.js)
│   ├── App.jsx            # Main App Layout
│   └── main.jsx           # Entry point
└── package.json            # Node.js dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
