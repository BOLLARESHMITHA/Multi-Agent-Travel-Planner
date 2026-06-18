"""
Weather service: calls the real OpenWeather API.
"""
from datetime import datetime, timedelta
import random

import requests

from config.settings import settings

CONDITIONS = ["Sunny", "Partly Cloudy", "Clear Sky", "Light Rain", "Overcast"]


def _parse_date(travel_date: str) -> datetime:
    for fmt in ("%d-%m-%Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(travel_date, fmt)
        except ValueError:
            continue
    return datetime.utcnow()


def _real_forecast(destination: str, travel_date: str, days: int) -> list[dict] | None:
    """Calls OpenWeather's current weather endpoint if a key is configured,
    and constructs a multi-day forecast sequence starting from travel_date using
    the current weather as the baseline.
    """
    try:
        resp = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": destination, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"},
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        
        current_temp = data["main"]["temp"]
        current_condition = data["weather"][0]["main"]
        
        start = _parse_date(travel_date)
        forecast = []
        for i in range(days):
            date = start + timedelta(days=i)
            # Add small random variation to temperature for subsequent days
            temp = current_temp if i == 0 else round(current_temp + random.uniform(-1.5, 1.5), 1)
            # Use real condition on first day, and potentially vary it on other days
            condition = current_condition if i == 0 or random.random() > 0.4 else random.choice(CONDITIONS)
            
            forecast.append({
                "date": date.strftime("%d-%m-%Y"),
                "day_label": f"Day {i + 1}",
                "condition": condition,
                "temperature": f"{round(temp, 1)}°C",
            })
        return forecast or None
    except Exception:
        return None


from utils.logger import get_logger

logger = get_logger(__name__)


def _mock_forecast(destination: str, travel_date: str, days: int, avg_temp_c: float) -> list[dict]:
    start = _parse_date(travel_date)
    forecast = []
    for i in range(days):
        date = start + timedelta(days=i)
        temp = round(avg_temp_c + random.uniform(-2.0, 2.0), 1)
        condition = random.choice(CONDITIONS)
        
        forecast.append({
            "date": date.strftime("%d-%m-%Y"),
            "day_label": f"Day {i + 1}",
            "condition": condition,
            "temperature": f"{temp}°C",
        })
    return forecast


def get_weather_forecast(destination: str, travel_date: str, days: int, avg_temp_c: float = 28) -> dict:
    """Returns weather forecast for destination. Falls back to mock data if API key is missing or request fails."""
    
    forecast = None
    if not settings.OPENWEATHER_API_KEY:
        logger.warning(f"OpenWeather API key is not configured. Falling back to mock weather for '{destination}'.")
        forecast = _mock_forecast(destination, travel_date, days, avg_temp_c)
    else:
        forecast = _real_forecast(destination, travel_date, days)
        if not forecast:
            logger.warning(f"Failed to fetch weather forecast for '{destination}' from OpenWeather API. Falling back to mock data.")
            forecast = _mock_forecast(destination, travel_date, days, avg_temp_c)

    suggestions = ["Carry sunscreen", "Carry light cotton clothes"]
    if any("Rain" in d["condition"] for d in forecast):
        suggestions.append("Pack a light raincoat or umbrella")
    if any(float(d["temperature"].replace("°C", "")) >= 30 for d in forecast):
        suggestions.append("Carry sunglasses and stay hydrated")

    return {"forecast": forecast, "suggestions": suggestions}
