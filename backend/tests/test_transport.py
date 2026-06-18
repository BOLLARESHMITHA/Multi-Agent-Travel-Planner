import pytest
from unittest.mock import patch

from config.settings import settings


class MockResponse:
    def __init__(self, json_data, status_code=200):
        self.json_data = json_data
        self.status_code = status_code
    def json(self):
        return self.json_data
    def raise_for_status(self):
        if self.status_code != 200:
            raise Exception("HTTP Error")


MOCK_FLIGHT_DATA = {
    "data": [
        {
            "airline": {"name": "IndiGo"},
            "departure": {"scheduled": "2026-07-20T06:00:00+00:00"},
            "arrival": {"scheduled": "2026-07-20T08:30:00+00:00"}
        },
        {
            "airline": {"name": "Air India"},
            "departure": {"scheduled": "2026-07-20T14:30:00+00:00"},
            "arrival": {"scheduled": "2026-07-20T17:00:00+00:00"}
        },
        {
            "airline": {"name": "SpiceJet"},
            "departure": {"scheduled": "2026-07-20T19:00:00+00:00"},
            "arrival": {"scheduled": "2026-07-20T21:30:00+00:00"}
        }
    ]
}


@pytest.fixture()
def auth_token(client):
    client.post("/auth/register", json={
        "username": "transportuser", "email": "transportuser@example.com", "password": "password123"
    })
    resp = client.post("/auth/login", json={"username": "transportuser", "password": "password123"})
    return resp.json()["token"]


def test_get_transport_options_requires_auth(client):
    resp = client.get("/transport/options", params={
        "source": "Hyderabad", "destination": "Goa", "travel_date": "20-07-2026"
    })
    assert resp.status_code == 401


@patch.object(settings, "AVIATIONSTACK_API_KEY", "dummy_aviation_key")
@patch("services.transport_service.requests.get")
def test_get_transport_options_success(mock_get, client, auth_token):
    mock_get.return_value = MockResponse(MOCK_FLIGHT_DATA)
    resp = client.get(
        "/transport/options",
        headers={"Authorization": f"Bearer {auth_token}"},
        params={
            "source": "Hyderabad", "destination": "Goa", "travel_date": "20-07-2026"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "available_options" in data
    assert "recommended_mode" in data
    assert "recommended_cost" in data
    assert len(data["available_options"]) >= 3
