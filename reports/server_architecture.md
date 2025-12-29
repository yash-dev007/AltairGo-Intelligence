# Server Side Plan (Backend)

This document outlines the backend architecture of the **AltairLabs Travel Intelligence Platform**.

## Tech Stack
- **Language**: Python 3
- **Framework**: Flask (Microframework)
- **Storage**: JSON File Storage (NoSQL-like flat file)

## API Layer (`app.py`)
The backend provides RESTful endpoints to serve data to the frontend.
- **Get All Destinations**: `GET /destinations`
- **Get Destination Details**: `GET /destinations/<id>`
    - *Logic*: Fetches static destination info + merges dynamic reviews from storage.
- **Get Static Data**: `GET /countries`, `GET /packages`, `GET /blogs`
- **Submit Review**: `POST /destinations/<id>/reviews`
    - *Logic*: Receives JSON payload, saves to `reviews.json`.
- **AI Planning**: `POST /smart-insight`
    - *Logic*: Analyzes user's itinerary to generate warnings (Crowd) or tips (Budget).

## Data Architecture

### 1. Static Content (CMS Legacy)
High-quality, curated content is stored in Python structures. This acts as our "Content Management System" for immutable data.
- `destinations.py`: Detailed destination info, itineraries, images, local prices.
- `packages.py`: Travel packages.

### 2. Persistence Layer (`reviews.json`)
We use a JSON file as a lightweight database to simplify deployment and local development.
- **Why JSON?**: Zero-setup persistence. Data survives server restarts.
- **Structure**:
    ```json
    {
        "El Nido": [
            { "name": "User", "rating": 5, "text": "...", "date": "..." }
        ],
        "Kyoto": [ ... ]
    }
    ```
- **Concurrency**: Basic file I/O operations (`load_reviews()`, `save_reviews()`) handle read/write data integrity for this scale.

## "Intelligence" Logic
The backend distinguishes itself with "Smart" features:
- **Crowd Intelligence**: Checks valid crowd levels for specific dates/regions.
- **Budget Calculator**: `calculate_budget` endpoint sums up `estimatedCostPerDay` for all selected locations in the itinerary.
