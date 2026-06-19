from services.transport_service import get_all_transport_options, recommend_cheapest


class TransportAgent:
    """Fetches all transport options (flights/train/bus) and recommends the best one."""

    def run(self, source: str, destination: str, travel_date: str) -> dict:
        options = get_all_transport_options(source, destination, travel_date)
        recommendation = recommend_cheapest(options)
        return {"options": options, **recommendation}

