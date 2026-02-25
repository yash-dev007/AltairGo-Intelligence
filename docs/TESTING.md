# TESTING.md — AltairGo Itinerary Test Suite

How to run automated tests, what to verify manually, and how to report issues.

---

## Running the Test Suite

### Prerequisites
- Backend server must be running (`python app.py`)
- Valid `GEMINI_API_KEY` in `backend/.env`

### Quick Run
```bash
cd d:\AltairLabs\backend
python app.py    # Terminal 1 — keep this running

# Terminal 2
python test_itinerary.py
```

### With pytest (for CI)
```bash
cd d:\AltairLabs\backend
pytest test_itinerary.py -v
```

### Expected Output
```
============================================================
  AltairGo Itinerary Test Suite — 10 Cases
============================================================

[1/10] Running: Budget Trip — Goa 3 days
  ✅ PASS — Trip: 'Goa Beach Budget Getaway' | Cost: ₹14,200 | 8.3s

[2/10] Running: Standard Trip — Rajasthan 5 days
  ✅ PASS — Trip: 'Royal Rajasthan Heritage Trail' | Cost: ₹48,500 | 11.2s
...

============================================================
  RESULTS: 9/10 PASSED | 1 FAILED
============================================================
```

---

## What Each Test Checks

| Check | Pass Condition |
|---|---|
| HTTP 200 response | Backend didn't return an error |
| JSON schema valid | `trip_title`, `total_cost`, `itinerary` all present and non-empty |
| Budget accuracy | `total_cost` within ±5% of user's budget |
| Activity count | No day has more than 5 activities (warning only, not fail) |
| Generic names | No "local market", "city center" type names (warning only) |

---

## Reviewing Test Outputs

Test results are saved to `backend/test_outputs/`:
```
test_outputs/
├── test_1.json    ← Budget Goa trip
├── test_2.json    ← Rajasthan Standard
├── test_3.json    ← Japan Luxury
...
├── test_10.json   ← India Budget Honeymoon
└── summary.json   ← All results aggregated
```

**What to look for in manual review:**
1. **Names** — are all activity names real, specific places?
2. **Costs** — do individual costs add up to `day_total`? Do day totals add up to `total_cost`?
3. **Timing** — is the schedule actually followable? Are travel times realistic?
4. **Routing** — does the AI group nearby places on the same day?
5. **Accommodations** — is a hotel named and costed per night for every day?

---

## What to Check Manually (End-to-End)

1. **Start both servers:**
   ```bash
   # Backend
   cd d:\AltairLabs\backend && python app.py
   
   # Frontend
   cd d:\AltairLabs && npm run dev
   ```

2. **Test the 3-phase loading:**
   - Go to `http://localhost:5173/plan-trip`
   - Select a country → region → destination
   - Click **Generate AI Plan**
   - ✅ Button text should cycle: "AI is analyzing..." → "Optimizing routes..." → "Calculating costs..."

3. **Test validation warning banner:**
   - Set budget very low (₹5,000 for 7 days)
   - ✅ Yellow banner should appear if costs were adjusted

4. **Test Report Issue:**
   - On the itinerary result page, click **🚩 Report Issue**
   - ✅ Modal opens with 4 issue type buttons
   - Select an issue, click **Send Feedback**
   - ✅ Thank you message appears
   - ✅ Check admin panel (`/admin` → Analytics Events)

5. **Test admin analytics:**
   - Log into `/admin/login` with the access key
   - Go to the Analytics section
   - ✅ Verify `itinerary_generated` events appear after generating a trip
   - ✅ Verify `user_feedback` events appear after submitting a report

---

## Issue Reporting Process

When a test fails or a bad itinerary is found:

1. **Classify the issue:**
   - `Wrong prices` — costs don't match reality
   - `Impossible schedule` — too many activities, unrealistic travel times
   - `Generic names` — "local market", "city park" etc.
   - `JSON error` — malformed response from API

2. **Capture the test output JSON** from `test_outputs/test_N.json`

3. **Check PROMPT_ENGINEERING.md** for known issues and fixes

4. **Refine the prompt** in `prompts/base_template.txt` or the relevant style template

5. **Re-run the affected test** to verify the fix
