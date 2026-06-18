"""
Transport service: Calls Aviation Stack API to get real-time flight schedules.
Only returns and recommends flights (excludes ground transport).
"""
import requests
from datetime import datetime
import random

from config.settings import settings

# Mapping of common city/destination names to primary airport IATA codes
CITY_TO_IATA = {
    "delhi": "DEL",
    "mumbai": "BOM",
    "goa": "GOI",
    "jaipur": "JAI",
    "kerala": "COK",
    "kochi": "COK",
    "cochin": "COK",
    "manali": "KUU",
    "rishikesh": "DED",
    "dehradun": "DED",
    "bangalore": "BLR",
    "bengaluru": "BLR",
    "hyderabad": "HYD",
    "chennai": "MAA",
    "kolkata": "CCU",
    "pune": "PNQ",
    "ahmedabad": "AMD",
    "srinagar": "SXR",
    "leh": "IXL",
    "amritsar": "ATQ",
}


def _distance_factor(source: str, destination: str) -> float:
    """Deterministic-ish multiplier so the same route always returns similar
    costs/durations, without needing a real distance API."""
    seed = sum(ord(c) for c in (source + destination).lower())
    return 0.8 + (seed % 50) / 100  # roughly 0.8 - 1.3


from utils.logger import get_logger

logger = get_logger(__name__)


def _get_mock_transport_options(source: str, destination: str) -> list[dict]:
    mock_airlines = ["IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"]
    flight_options = []
    factor = _distance_factor(source, destination)
    base_cost = 4500 * factor
    
    for idx, airline_name in enumerate(mock_airlines[:4]):
        dep_hours = [6, 12, 17, 21][idx]
        dep_time = f"{dep_hours:02d}:00"
        duration_hours = round(max(1.0, 1.2 * factor), 1)
        duration_str = f"{duration_hours} Hours"
        cost = round(base_cost + (idx * 300) - 200, -1)
        
        flight_options.append({
            "mode": "Flight",
            "provider": airline_name,
            "departure_time": dep_time,
            "duration": duration_str,
            "cost": cost,
        })
    return sorted(flight_options, key=lambda o: o["cost"])


def get_all_transport_options(source: str, destination: str, travel_date: str) -> list[dict]:
    """Returns flight options for the day from Aviation Stack API. Falls back to mock data if API key is missing or request fails."""
    
    if not settings.AVIATIONSTACK_API_KEY:
        logger.warning(f"Aviation Stack API key is not configured. Falling back to mock data for '{source}' -> '{destination}'.")
        return _get_mock_transport_options(source, destination)

    src_clean = source.strip().lower()
    dst_clean = destination.strip().lower()

    dep_code = src_clean.upper() if len(src_clean) == 3 else CITY_TO_IATA.get(src_clean)
    arr_code = dst_clean.upper() if len(dst_clean) == 3 else CITY_TO_IATA.get(dst_clean)

    if not dep_code or not arr_code:
        logger.warning(f"Could not resolve source/destination to IATA. Using mock fallback for '{source}' -> '{destination}'.")
        return _get_mock_transport_options(source, destination)

    url = "http://api.aviationstack.com/v1/flights"
    params = {
        "access_key": settings.AVIATIONSTACK_API_KEY,
        "dep_iata": dep_code,
        "arr_iata": arr_code,
        "limit": 10
    }

    try:
        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.warning(f"Aviation Stack API request failed: {e}. Falling back to mock data.")
        return _get_mock_transport_options(source, destination)

    if "error" in data:
        error_msg = data["error"].get("message") or "Unknown API error"
        logger.warning(f"Aviation Stack API returned error: {error_msg}. Falling back to mock data.")
        return _get_mock_transport_options(source, destination)

    flights = data.get("data", [])
    if not flights:
        logger.warning(f"No flights found between {dep_code} and {arr_code}. Falling back to mock data.")
        return _get_mock_transport_options(source, destination)

    flight_options = []
    factor = _distance_factor(source, destination)
    base_cost = 4500 * factor

    for idx, flight in enumerate(flights):
        airline_name = flight.get("airline", {}).get("name") or "Unknown Airline"
        dep_sched = flight.get("departure", {}).get("scheduled")
        arr_sched = flight.get("arrival", {}).get("scheduled")

        # Parse scheduled departure time
        dep_time = "12:00"
        if dep_sched:
            try:
                dt = datetime.fromisoformat(dep_sched.replace("Z", "+00:00"))
                dep_time = dt.strftime("%H:%M")
            except Exception:
                if "T" in dep_sched:
                    dep_time = dep_sched.split("T")[1][:5]

        # Calculate flight duration from departure/arrival times
        duration_str = f"{round(1.2 * factor, 1)} Hours"
        if dep_sched and arr_sched:
            try:
                dt_dep = datetime.fromisoformat(dep_sched.replace("Z", "+00:00"))
                dt_arr = datetime.fromisoformat(arr_sched.replace("Z", "+00:00"))
                diff = dt_arr - dt_dep
                hours = round(diff.total_seconds() / 3600, 1)
                if hours > 0:
                    duration_str = f"{hours} Hours"
            except Exception:
                pass

        # Free tier API doesn't provide pricing, so we generate a dynamic price based on distance
        cost = round(base_cost + random.uniform(-600, 900) + idx * 150, -1)

        flight_options.append({
            "mode": "Flight",
            "provider": airline_name,
            "departure_time": dep_time,
            "duration": duration_str,
            "cost": cost,
        })

    return sorted(flight_options, key=lambda o: o["cost"])


def recommend_cheapest(options: list[dict]) -> dict:
    if not options:
        raise ValueError("No options available to recommend.")
    cheapest = min(options, key=lambda o: o["cost"])
    most_expensive = max(options, key=lambda o: o["cost"])
    savings = round(most_expensive["cost"] - cheapest["cost"], 2)
    return {
        "recommended_mode": cheapest["mode"],
        "recommended_cost": cheapest["cost"],
        "reason": (
            f"Cheapest flight option overall. Saves ~INR {savings:.0f} compared to the priciest flight, "
            f"leaving more budget for hotel and activities."
        ),
    }
