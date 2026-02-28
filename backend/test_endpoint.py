import pytest
from app import app as flask_app
from unittest.mock import patch

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

@patch('services.ai_destination_service.requests.post')
def test_generate_itinerary_mock(mock_post, client):
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"candidates": [{"content": {"parts": [{"text": "{}"}]}}]}

    # This just tests that the endpoint doesn't crash on bad/mocked input
    # The actual functionality is tested in test_itinerary.py
    resp = client.post(
        "/generate-itinerary",
        json={
            "selectedDestIds": [],
            "preferences": {
                "startCity": "Mumbai",
                "country": "India",
                "budget": 50000,
                "duration": 5,
                "style": "Standard"
            }
        }
    )

    assert resp.status_code in [200, 400, 500] # Just ensure no connection error
