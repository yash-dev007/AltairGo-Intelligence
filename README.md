# AltairGo Intelligence 🌍✈️

**AltairGo Intelligence** is a next-generation travel planning platform designed to empower travelers with smart, data-driven insights. It combines a modern, responsive React frontend with a Flask-based backend to provide intelligent itinerary generation, budget estimation, and crowd-aware travel advice.

![Project Status](https://img.shields.io/badge/Status-In%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Key Features

*   **🤖 Smart Trip Planner**: An AI-powered tool that generates personalized itineraries based on your destination and preferences.
*   **💰 Budget Calculator**: Estimate your daily travel costs with our integrated budget simulation tool.
*   **crowd-aware Intelligence**: Get real-time advice on crowd levels and "smart insights" to avoid peak tourist traffic.
*   **🌏 Multi-Country Support**: Detailed guides and planning for destinations like **India**, **Vietnam**, **Thailand**, and the **Philippines**.
*   **📦 Curated Packages**: Explore pre-built travel packages for seamless adventure.
*   **📝 Travel Blog**: Read inspiring stories and tips from fellow travelers.

## 🛠️ Tech Stack

### Frontend
*   **Fraimwork**: React 19 (via Vite)
*   **Routing**: React Router DOM 7
*   **Styling**: CSS Modules, Modern CSS3
*   **Icons**: Lucide React

### Backend
*   **Server**: Python Flask
*   **API**: RESTful endpoints (`/generate-itinerary`, `/calculate-budget`, `/smart-insight`)
*   **Data**: JSON-based destination data

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
> The frontend will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
AltairGo-Intelligence/
├── backend/                # Python Flask Application
│   ├── app.py             # Main application entry point & API routes
│   ├── data.py            # Static data source for destinations
│   └── requirements.txt   # Python dependencies
├── src/                    # React Frontend Source
│   ├── components/        # Reusable UI components (Navbar, Footer, etc.)
│   ├── data/              # Frontend static data
│   ├── pages/             # Page components (Home, TripPlanner, Blogs, etc.)
│   ├── App.jsx            # Main App Layout
│   └── main.jsx           # Entry point
├── public/                 # Static assets
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

This project is licensed under the MIT License - see the LICENSE file for details.
