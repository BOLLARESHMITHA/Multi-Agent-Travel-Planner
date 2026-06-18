import requests
from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)


def _get_mock_destination_info(destination: str) -> dict:
    formatted_name = destination.title()
    is_cold_region = any(reg in formatted_name for reg in ["Europe", "America", "Canada", "UK", "London", "Paris"])
    avg_temp = 15 if is_cold_region else 28
    
    return {
        "display_name": formatted_name,
        "attractions": [
            f"{formatted_name} City Center",
            f"{formatted_name} Historical Palace",
            f"{formatted_name} National Museum",
            f"{formatted_name} Botanical Garden",
            f"{formatted_name} Local Market"
        ],
        "adventure_activities": ["Walking Tour", "Sightseeing Exploration", "Local Food Tasting", "Hiking Experience", "Biking Tour"],
        "culture_spots": [f"{formatted_name} Heritage Center", f"{formatted_name} Art Gallery"],
        "wildlife_spots": [f"{formatted_name} Nature Park", f"{formatted_name} Wildlife Sanctuary"],
        "food_spots": [f"{formatted_name} Traditional Restaurant", f"{formatted_name} Street Food Alley"],
        "best_time": "Year-round",
        "avg_temp_c": avg_temp,
        "theme": "Sightseeing",
    }


def get_destination_info(destination: str) -> dict:
    """Returns structured info for a destination, querying Geoapify Geocoding and
    Places API. Falls back to realistic mock data if API key is missing or requests fail."""
    
    if not settings.GEOAPIFY_API_KEY:
        logger.warning(f"Geoapify API key is not configured. Falling back to mock data for '{destination}'.")
        return _get_mock_destination_info(destination)

    try:
        # Step 1: Geocoding
        geocode_url = "https://api.geoapify.com/v1/geocode/search"
        geocode_params = {"text": destination, "apiKey": settings.GEOAPIFY_API_KEY}
        
        geo_resp = requests.get(geocode_url, params=geocode_params, timeout=5)
        geo_resp.raise_for_status()
        geo_data = geo_resp.json()
    except Exception as e:
        logger.warning(f"Geoapify Geocoding API request failed: {e}. Falling back to mock data.")
        return _get_mock_destination_info(destination)
        
    if not geo_data.get("features"):
        logger.warning(f"Destination '{destination}' could not be geocoded by Geoapify. Falling back to mock data.")
        return _get_mock_destination_info(destination)

    properties = geo_data["features"][0].get("properties", {})
    lat = properties.get("lat")
    lon = properties.get("lon")
    formatted_name = properties.get("formatted", destination.title())
    
    # Step 2: Places query (15km radius)
    places_url = "https://api.geoapify.com/v2/places"
    categories = (
        "tourism.attraction,tourism.sights,entertainment.culture,natural,catering.restaurant,"
        "catering.cafe,leisure.park,sport"
    )
    places_params = {
        "categories": categories,
        "filter": f"circle:{lon},{lat},15000",
        "limit": 30,
        "apiKey": settings.GEOAPIFY_API_KEY
    }
    
    try:
        places_resp = requests.get(places_url, params=places_params, timeout=5)
        places_resp.raise_for_status()
        places_data = places_resp.json()
    except Exception as e:
        logger.warning(f"Geoapify Places API request failed: {e}. Falling back to mock data.")
        return _get_mock_destination_info(destination)
        
    attractions = []
    culture_spots = []
    wildlife_spots = []
    food_spots = []
    adventure_activities = []
    
    for feature in places_data.get("features", []):
        props = feature.get("properties", {})
        name = props.get("name")
        if not name:
            continue
        
        cats = props.get("categories", [])
        if any(c in cats for c in ["tourism.attraction", "tourism.sights"]):
            if name not in attractions:
                attractions.append(name)
        elif any(c in cats for c in ["entertainment.culture"]):
            if name not in culture_spots:
                culture_spots.append(name)
        elif any(c in cats for c in ["natural", "leisure.park"]):
            if name not in wildlife_spots:
                wildlife_spots.append(name)
        elif any(c in cats for c in ["catering.restaurant", "catering.cafe"]):
            if name not in food_spots:
                food_spots.append(name)
        elif any(c == "sport" or c.startswith("sport.") for c in cats):
            if name not in adventure_activities:
                adventure_activities.append(name)
                
    # Fallback default arrays derived from location to guarantee completeness if specific categories are blank in API results
    if not attractions:
        attractions = [f"{destination.title()} City Center", f"{destination.title()} Main Square"]
    if not culture_spots:
        culture_spots = [f"{destination.title()} Museum"]
    if not wildlife_spots:
        wildlife_spots = [f"{destination.title()} Park"]
    if not food_spots:
        food_spots = [f"{destination.title()} Local Restaurant"]
    if not adventure_activities:
        adventure_activities = ["Walking Tour", "Sightseeing Exploration", "Local Food Tasting"]
    
    # Dynamic temp logic based on location (cold if in Europe/North America, warm otherwise)
    is_cold_region = any(reg in formatted_name for reg in ["Europe", "America", "Canada", "UK", "London", "Paris"])
    avg_temp = 15 if is_cold_region else 28
    
    return {
        "display_name": formatted_name,
        "attractions": attractions[:5],
        "adventure_activities": adventure_activities[:5],
        "culture_spots": culture_spots[:5],
        "wildlife_spots": wildlife_spots[:5],
        "food_spots": food_spots[:5],
        "best_time": "Year-round",
        "avg_temp_c": avg_temp,
        "theme": "Sightseeing",
    }

