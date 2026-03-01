# AltairGo Intelligence 🌍✈️

**AltairGo Intelligence** is a state-of-the-art travel planning platform that leverages the power of Large Language Models (LLMs) to provide travelers with personalized, data-driven insights. From intelligent itinerary generation to a collaborative "Destination Architect" system, AltairGo simplifies the complexities of travel planning.

![Project Status](https://img.shields.io/badge/Status-In%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Key Features

*   **🤖 AI-Powered Itinerary Planner**: Uses **Google Gemini** to generate highly personalized day-by-day itineraries based on user preferences, dates, and budget.
*   **🏗️ AI Destination Architect**: A unique system for users to suggest new destinations. Includes an automated verification flow where AI validates destination details before admin approval.
*   **🌍 Global Origin Search**: Integrated **OpenStreetMap (Nominatim)** for precise start location selection.
*   **📅 Flexi-Schedule Engine**: Support for multiple planning modes:
    *   **Duration-Based**: "10 days in October."
    *   **Fixed Dates**: Precise scheduling with calendar integration.
    *   **Anytime**: Exploratory planning for the future.
*   **💰 Dynamic Budget Estimation**: Real-time travel cost calculation integrated with itinerary steps.
*   **🎟️ Affiliate & Booking System**: Seamless integration with booking services for attractions, stays, and flights via curated affiliate links.
*   **🛡️ Admin Control Plane**: Dedicated dashboard for administrators to manage destination requests and site content.

## 🆕 Recent Updates (March 2026)
*   **Admin Panel UI Overhaul**: completely redesigned with a pristine white theme, live visitor charts, KPI stat cards, and full CRUD modals for destinations and content.
*   **Enhanced QA & Testing**: Implemented a comprehensive automated test suite (`pytest`) for the AI itinerary generator, covering edge cases like multi-city trips and budget constraints.
*   **Project Organization**: Cleaned up the file structure, removed legacy linting outputs, and established strict feature-based directory groupings.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **UI/UX**: Custom CSS Modules with **Glassmorphism** aesthetics.
- **Icons**: Lucide React & FontAwesome.
- **Data Fetching**: Axios with custom API interceptors.

### Backend
- **Core**: Python Flask
- **AI Integration**: Google Generative AI (Gemini SDK)
- **Database**: SQLite with **SQLAlchemy ORM** for robust data management.
- **Architecture**: Modular Service-Route-Model pattern for scalability.
- **Routing**: Secure RESTful API endpoints with structured JSON responses.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yash-dev007/AltairGo-Intelligence.git
cd AltairGo-Intelligence
```

### 2. Backend Setup
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_api_key_here
SECRET_KEY=your_flask_secret
DATABASE_URL=sqlite:///travel.db
```

Install and run:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup
```bash
# From root directory
npm install
npm run dev
```

## 📂 Project Structure

```text
AltairGo-Intelligence/
├── backend/                # Flask Backend
│   ├── routes/            # API Endpoints (Admin, AI, Destinations)
│   ├── services/          # Business Logic (Gemini, Itinerary, Images)
│   ├── models.py          # SQLAlchemy Database Models
│   ├── validation.py      # Schema & Pydantic Validation
│   └── app.py             # Flask App Factory
├── src/                    # React Frontend
│   ├── components/        # Reusable Atomic & Grouped UI
│   ├── pages/             # Route-level Page Components
│   ├── services/          # Frontend API Clients (TripAI.js)
│   └── App.jsx            # Main Router & Layout
├── public/                 # Static Assets
└── vite.config.js          # Vite configuration with SPA proxying
```

## 🤝 Contributing
Contributions make the open-source community an amazing place to learn and inspire. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
