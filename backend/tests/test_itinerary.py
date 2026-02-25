"""
test_itinerary.py — Automated test suite for the AltairGo itinerary generation system.

Runs 10 test cases covering: budget, standard, luxury, multi-city, short trips, and date variants.
Each test validates: JSON schema, budget accuracy (±5%), activity count limits, required fields.
Results saved to test_outputs/test_N.json for manual review.

Usage:
    1. Start the backend: python app.py
    2. Run: python test_itinerary.py
    OR with pytest: pytest test_itinerary.py -v
"""

import requests
import json
import os
import sys
import time
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:5000"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "test_outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─────────────────── Test Case Definitions ───────────────────

TEST_CASES = [
    {
        "name": "Budget Trip — Goa 3 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "India",
            "startCity": "Mumbai",
            "budget": 15000,
            "duration": 3,
            "style": "Budget",
            "dateType": "anytime",
            "interests": ["Beach", "Party"]
        }
    },
    {
        "name": "Standard Trip — Rajasthan 5 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "India",
            "startCity": "Delhi",
            "budget": 50000,
            "duration": 5,
            "style": "Standard",
            "dateType": "flexible",
            "travelMonth": "March 2026",
            "interests": ["Heritage", "Culture"]
        }
    },
    {
        "name": "Luxury Trip — Japan 7 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "Japan",
            "startCity": "Mumbai",
            "budget": 150000,
            "duration": 7,
            "style": "Luxury",
            "dateType": "fixed",
            "travelStartDate": "2026-04-01T00:00:00",
            "travelEndDate": "2026-04-08T00:00:00",
            "interests": ["Culture", "Food", "Temples"]
        }
    },
    {
        "name": "Multi-city — Thailand 7 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "Thailand",
            "startCity": "Mumbai",
            "budget": 80000,
            "duration": 7,
            "style": "Standard",
            "dateType": "anytime",
            "interests": ["Beach", "Temples", "Food"]
        }
    },
    {
        "name": "Short Weekend — Goa 2 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "India",
            "startCity": "Mumbai",
            "budget": 20000,
            "duration": 2,
            "style": "Standard",
            "dateType": "anytime",
            "interests": ["Beach"]
        }
    },
    {
        "name": "Budget Solo — India 7 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "India",
            "startCity": "Bangalore",
            "budget": 25000,
            "duration": 7,
            "style": "Budget",
            "dateType": "anytime",
            "interests": ["Nature", "Temples"]
        }
    },
    {
        "name": "Standard — Vietnam 5 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "Vietnam",
            "startCity": "Delhi",
            "budget": 60000,
            "duration": 5,
            "style": "Standard",
            "dateType": "anytime",
            "interests": ["History", "Food", "Nature"]
        }
    },
    {
        "name": "Luxury Family — France 7 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "France",
            "startCity": "Mumbai",
            "budget": 200000,
            "duration": 7,
            "style": "Luxury",
            "dateType": "flexible",
            "travelMonth": "June 2026",
            "interests": ["Art", "Food", "Shopping"]
        }
    },
    {
        "name": "Standard — Philippines 5 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "Philippines",
            "startCity": "Chennai",
            "budget": 55000,
            "duration": 5,
            "style": "Standard",
            "dateType": "anytime",
            "interests": ["Beach", "Diving", "Nature"]
        }
    },
    {
        "name": "Budget — India honeymooners 5 days",
        "selectedDestIds": [],
        "preferences": {
            "country": "India",
            "startCity": "Kolkata",
            "budget": 35000,
            "duration": 5,
            "style": "Budget",
            "dateType": "anytime",
            "interests": ["Romance", "Nature", "Hills"]
        }
    }
]

# ─────────────────── Validation Helpers ───────────────────

def check_schema(data: dict) -> list:
    """Check that required top-level fields are present."""
    errors = []
    required = ['trip_title', 'total_cost', 'itinerary']
    for field in required:
        if field not in data:
            errors.append(f"Missing field: '{field}'")
        elif not data[field]:
            errors.append(f"Empty field: '{field}'")
    return errors


def check_budget(data: dict, budget: int) -> list:
    """Verify total_cost is within ±5% of user budget."""
    errors = []
    total = data.get('total_cost', 0)
    if total == 0:
        errors.append("total_cost is 0 or missing")
        return errors
    diff_pct = abs(total - budget) / budget * 100
    if diff_pct > 5:
        errors.append(f"Budget violation: ₹{total:,} is {diff_pct:.1f}% away from target ₹{budget:,} (limit: ±5%)")
    return errors


def check_activity_counts(data: dict) -> list:
    """Flag days with > 5 activities."""
    warnings = []
    for day in data.get('itinerary', []):
        if isinstance(day, dict):
            acts = day.get('activities', [])
            if isinstance(acts, list) and len(acts) > 5:
                warnings.append(f"Day {day.get('day', '?')} has {len(acts)} activities (recommended ≤ 4)")
    return warnings


def check_generic_names(data: dict) -> list:
    """Check for suspiciously generic activity names."""
    import re
    generic_patterns = [r'\blocal market\b', r'\bcity center\b', r'\bcity centre\b']
    found = []
    for day in data.get('itinerary', []):
        if isinstance(day, dict):
            for act in day.get('activities', []):
                if isinstance(act, dict):
                    name = act.get('activity', '')
                    for p in generic_patterns:
                        if re.search(p, name, re.IGNORECASE):
                            found.append(name)
    return found


# ─────────────────── Runner ───────────────────

def run_test(idx: int, case: dict) -> dict:
    """Run a single test case. Returns a result dict."""
    print(f"\n[{idx+1}/10] Running: {case['name']}")
    print(f"         Budget: ₹{case['preferences']['budget']:,}, Duration: {case['preferences']['duration']} days, Style: {case['preferences']['style']}")

    payload = {
        "selectedDestIds": case.get("selectedDestIds", []),
        "preferences": case["preferences"]
    }

    start = time.time()
    try:
        resp = requests.post(f"{BASE_URL}/generate-itinerary", json=payload, timeout=120)
        elapsed = round(time.time() - start, 1)

        if resp.status_code != 200:
            print(f"  ❌ HTTP {resp.status_code}: {resp.text[:200]}")
            return {"name": case["name"], "status": "http_error", "code": resp.status_code, "elapsed": elapsed}

        data = resp.json()

        # Save raw output
        output_path = os.path.join(OUTPUT_DIR, f"test_{idx+1}.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Validate
        schema_errors = check_schema(data)
        budget_errors = check_budget(data, case['preferences']['budget'])
        activity_warnings = check_activity_counts(data)
        generic_warnings = check_generic_names(data)

        all_errors = schema_errors + budget_errors
        all_warnings = activity_warnings + [f"Generic name: '{g}'" for g in generic_warnings]

        if all_errors:
            status = "FAIL"
            for e in all_errors:
                print(f"  ❌ {e}")
        else:
            status = "PASS"
            print(f"  ✅ PASS — Trip: '{data.get('trip_title', 'Untitled')}' | Cost: ₹{data.get('total_cost', 0):,} | {elapsed}s")

        for w in all_warnings:
            print(f"  ⚠️  {w}")

        return {
            "name": case["name"],
            "status": status,
            "trip_title": data.get("trip_title"),
            "total_cost": data.get("total_cost"),
            "target_budget": case["preferences"]["budget"],
            "days_count": len(data.get("itinerary", [])),
            "elapsed_seconds": elapsed,
            "errors": all_errors,
            "warnings": all_warnings,
            "output_file": output_path,
            "validation_warnings_from_backend": data.get("validation_warnings", []),
            "budget_adjusted": data.get("budget_adjusted", False)
        }

    except requests.exceptions.Timeout:
        elapsed = round(time.time() - start, 1)
        print(f"  ❌ Timeout after {elapsed}s")
        return {"name": case["name"], "status": "timeout", "elapsed": elapsed}
    except Exception as e:
        elapsed = round(time.time() - start, 1)
        print(f"  ❌ Exception: {e}")
        return {"name": case["name"], "status": "exception", "error": str(e), "elapsed": elapsed}


def main():
    print("=" * 60)
    print("  AltairGo Itinerary Test Suite — 10 Cases")
    print("=" * 60)

    # Check backend is running
    try:
        requests.get(f"{BASE_URL}/countries", timeout=5)
    except Exception:
        print("\n❌ Backend not reachable at http://127.0.0.1:5000")
        print("   Start with: cd backend && python app.py")
        sys.exit(1)

    results = []
    for i, case in enumerate(TEST_CASES):
        result = run_test(i, case)
        results.append(result)
        time.sleep(2)  # Respect API rate limits

    # Summary
    passed = sum(1 for r in results if r.get("status") == "PASS")
    failed = len(results) - passed
    print("\n" + "=" * 60)
    print(f"  RESULTS: {passed}/10 PASSED | {failed} FAILED")
    print("=" * 60)
    for r in results:
        icon = "✅" if r.get("status") == "PASS" else "❌"
        name = r.get("name", "?")
        elapsed = r.get("elapsed_seconds", "?")
        print(f"  {icon} [{elapsed}s] {name}")

    # Save summary
    summary_path = os.path.join(OUTPUT_DIR, "summary.json")
    with open(summary_path, 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n📄 Full summary saved to: {summary_path}")
    print(f"📁 Individual outputs in: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()


# ─────────────────── pytest Interface ───────────────────
# If running with pytest, expose individual test functions

import pytest

@pytest.mark.parametrize("idx,case", enumerate(TEST_CASES), ids=[c["name"] for c in TEST_CASES])
def test_itinerary_case(idx, case):
    """Pytest-compatible test for each case."""
    result = run_test(idx, case)
    assert result.get("status") == "PASS", f"Test failed: {result.get('errors', result.get('error'))}"
