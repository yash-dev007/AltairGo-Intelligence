# Server Side Architecture (Technical Specification)

> [!NOTE]
> This document is the **Backend Specification** for the **AltairLabs Travel Intelligence Platform**. It includes the exact JSON schemas, algorithm weights, and service internals.

## 1. Core Runtime

*   **Language**: Python 3.12
*   **Web Server**: Flask (WSGI)
*   **Concurrency**: Threaded (`app.run(threaded=True)`)
*   **CORS**: Allow All (`*`) for easy development.

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

### B. Region Population (The Crawler)
**Endpoint**: `POST /regions/:id/populate`
**Trigger**: Called when a user selects a region with 0 destinations.

**Algorithm (`services/osm_service.py`):**
1.  **Input**: Region Name (e.g., "Kyoto").
2.  **OSM Query**:
    ```text
    (
      node["tourism"~"attraction"](area.kyoto);
      way["tourism"~"attraction"](area.kyoto);
    );
    out center;
    ```
3.  **Filtering Rules**:
    *   **Exclude**: `hospital`, `school`, `bank`, `pharmacy`.
    *   **Name Check**: Must be mostly ASCII (Latin characters) to ensure readability.
4.  **Mock Generation**:
    *   `price` = `random.choice([0, 500, 1500])`.
    *   `rating` = `random.uniform(4.0, 4.9)` (Optimistic Bias).
5.  **Limit**: Max **3 Items** per request (Sandbox safety).

### C. Smart City Search (The AI)
**Endpoint**: `POST /generate-destinations`
**Payload**: `{ "query": "Paris" }`

**Scoring Algorithm (`services/generation_service.py`):**
The system scores every POI found to determine the "Top 10".

| Criterion | Tag | Weight |
| :--- | :--- | :--- |
| **Category** | `tourism=museum` | **+10** |
| | `historic=*` | **+8** |
| | `tourism=viewpoint` | **+7** |
| | `leisure=park` | **+6** |
| **Metadata** | `wikipedia=*` | **+5** |
| | `website=*` | **+2** |
| **Data Quality**| Name length > 3 | **+2** |

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
