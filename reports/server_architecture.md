# Server Side Architecture (Technical Specification)

> [!NOTE]
> This document is the **Backend Specification** for the **AltairLabs Travel Intelligence Platform**. It includes the exact JSON schemas, algorithm weights, and service internals.

## 1. Core Runtime

*   **Language**: Python 3.12
*   **Web Server**: Flask (WSGI)
*   **Concurrency**: Threaded (`app.run(threaded=True, port=5000)`)
*   **CORS**: Allow All (`*`) for easy development using `flask_cors`.

## 2. API Specification (OpenAPI Style)

### A. Destinations
**Endpoint**: `GET /destinations`
**Response Schema**: `List[Destination]`

```json
[
  {
    "id": 101,
    "name": "Fushimi Inari Taisha",
    "desc": "Famous for its thousands of vermilion torii gates...",
    "price": "Free",
    "rating": 4.8,
    "tag": "Historic",
    "location": "Kyoto",
    "image": "https://images.unsplash.com/photo-147839...",
    "reviews_count_str": "12k"
  }
]
```

### B. Region Population (The AI Agent)
**Endpoint**: `POST /regions/:id/populate`
**Trigger**: Called when a user selects a region with < 5 destinations.

**Algorithm (`services/ai_destination_service.py`):**
1.  **Input**: Region Name (e.g., "Kyoto"), Country Name.
2.  **AI Query**: Uses `google-genai` SDK with models (e.g., `gemini-2.0-flash`).
    *   **Prompt**: "Generate a list of 50 tourist destinations in {region_name}..."
3.  **Filtering & Enrichment**:
    *   **Images**: Fetches images via Unsplash API using `services.image_service`.
    *   **Deduplication**: Checks against existing database entries.
4.  **Output**: Returns list of newly created `Destination` objects.
5.  **Limit**: Max **50 Items** per request.

### C. Smart Destination Generation
**Endpoint**: `POST /generate-destinations`
**Payload**: `{ "query": "Paris" }`

**Algorithm (`services/generation_service.py`):**
Uses AI to generate smart suggestions based on the user's free-text query.

### D. Itinerary Generation
**Endpoint**: `POST /generate-itinerary`
**Payload**: `{ "selectedDestIds": [...], "preferences": {...} }`

**Algorithm (`services/gemini_service.py`):**
1.  **Context**: Fetches full details of selected destinations from DB.
2.  **AI Generation**: Generates a day-by-day itinerary JSON.
3.  **Image Enrichment**: Adds Unsplash images to the generated itinerary items.

## 3. Database Schema (SQLAlchemy)

The system uses a **Polymorphic Data Model** where `Destination` is the central node.

```python
class Destination(Base):
    __tablename__ = 'destinations'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    
    # Metadata
    crowd_level = Column(String(50)) # "High", "Low"
    vibe_tags = Column(JSON) # e.g. ["Nature", "Peaceful"]
    
    # Relationships
    state_id = Column(Integer, ForeignKey('states.id'))
```

## 4. Hybrid persistence Strategy

> [!WARNING]
> We deliberately split **Read-Heavy** and **Write-Heavy** data.

*   **Static Entities (Destinations)**: Stored in **SQLite** (`travel.db`). Efficient, relational, indexable.
*   **Dynamic Entities (Reviews)**: Stored in **JSON** (`reviews.json`).
    *   **Reason**: No need for complex relations. Reviews are simple lists appended to a key.
    *   **Structure**:
        ```json
        {
          "Destination Name": [
            { "user": "Dave", "rating": 5, "text": "Great!", "date": "2024-01-01" }
          ]
        }
        ```
