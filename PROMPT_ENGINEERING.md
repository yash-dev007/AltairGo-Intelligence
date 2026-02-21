# PROMPT_ENGINEERING.md — AltairGo Itinerary AI

Documentation of what works, what doesn't, and examples for the Gemini itinerary prompt.

---

## System Overview

The prompt system uses **three layers**:
1. **`prompts/base_template.txt`** — universal rules (budget, timing, routing, JSON schema)  
2. **Style addendum** — `budget_trip.txt`, `luxury_trip.txt` (no file for Standard)
3. **Multi-city addendum** — `multi_city.txt`, applied when 3+ cities detected

**Model:** Gemini 2.0 Flash Lite (with 2.0 Flash and 1.5 Flash as fallbacks)  
**Temperature:** 0.3 (low = more consistent, fewer hallucinations)  
**Max Tokens:** 8192

---

## ✅ What Works Well

### Prompt Patterns That Get Good Results

#### 1. Injecting Real Destination Data
When destination records from the DB (cost/day, crowd level, best time) are injected into the prompt, the AI:
- Uses realistic ₹ figures instead of guesses
- Mentions correct crowd/season warnings
- Names real places from our data

**Key instruction that triggers this:**
```
Destination 1: Amber Fort
  - Region: Jaipur
  - Avg cost/day: ₹5000
  - Crowd level: High
  - Best time to visit: October-March
  - Rating: 4.9/5
```

#### 2. Strict Budget Rule Phrasing
The phrase `"STRICT — do not exceed by more than 5%"` and providing the exact cost breakdown percentages causes the model to honor the budget far more often than a simple "stay within budget" instruction.

#### 3. Max Activity Count Enforcement
`"Maximum 4 major activities per day"` works when reinforced with the specific structure: Morning / Lunch / Afternoon / Evening. Without the structure, the model sometimes packs 6-8 activities.

#### 4. How-to-Reach Requirement
Asking for `"how_to_reach"` per activity (mode + time + cost) makes the model think about geographic proximity and keeps days more logically routed.

---

## ❌ What Doesn't Work / Known Issues

### 1. Generic Fallback Names (Fixed with Validation)
The model occasionally produces names like "City Central Market" or "Local Beach" especially for countries with less training data (Philippines, Vietnam). The `validation.py` detector flags these.

**Fix:** Add more real destination context to the prompt for those countries.

### 2. JSON Truncation on Long Trips (7+ days)
For 7+ day itineraries, the model sometimes truncates the JSON if output is close to 8192 tokens. The `gemini_service.py` uses a regex extraction fallback.

**Workaround:** For very long trips, consider splitting into segments or lowering detail level.

### 3. Multi-City Transport Calculation
The model often gets intercity transport costs wrong (e.g., international flights for ₹5,000). The validation layer detects severe budget overage and scales costs.

### 4. Luxury Style — Cost Calibration
At temperature 0.3, luxury trips sometimes come in 30-40% under budget. The under-budget warning in the validator flags this.

### 5. Off-Season Dates
When travel dates fall in clearly off-season months, the model doesn't always proactively warn. The `smart_insights` field should contain seasonal notes but may miss this.

---

## 📊 Good vs. Bad Output Examples

### ✅ Good Activity Entry
```json
{
  "time": "Morning",
  "time_range": "9:00 AM - 12:00 PM",
  "activity": "Amber Fort",
  "description": "16th-century Mughal fort with Sheesh Mahal mirror work and panoramic city views.",
  "cost": 500,
  "duration": "2.5 hours",
  "how_to_reach": "Uber from Jaipur hotel – ₹300, 25 min via Amber Road",
  "tips": "Arrive by 9 AM to beat tour buses. Audio guide available ₹200.",
  "booking_required": false,
  "crowd_level": "medium"
}
```

### ❌ Bad Activity Entry (flag these)
```json
{
  "time": "Morning",
  "activity": "Local Fort",
  "cost": 0,
  "description": "Visit the local fort."
}
```
Issues: Generic name, zero cost, no timing, no routing, no tips.

---

## 🔧 Tuning Guidelines

| Issue | Fix |
|---|---|
| Generic names | Add more real DB data in the context injection |
| Over-budget results | Lower temperature further (try 0.2) |
| Under-budget results | Raise temperature slightly (try 0.4) |
| Truncated JSON | Reduce `duration` or request fewer activities per day |
| Wrong city groupings | Explicitly list city order in the prompt |

---

## 📝 Template Placeholder Reference

| Placeholder | Description |
|---|---|
| `{DESTINATION_DATA}` | Real DB records injected via `_format_destination_data()` |
| `{origin}` | User's starting city |
| `{country}` | Target country |
| `{destinations}` | Comma-separated selected destination names |
| `{budget}` | Total budget in ₹ |
| `{days}` | Trip duration |
| `{style}` | Budget / Standard / Luxury |
| `{dates}` | e.g., "Fixed dates: 2026-04-01 to 2026-04-08" |
| `{interests}` | e.g., "Beach, Heritage, Food" |
