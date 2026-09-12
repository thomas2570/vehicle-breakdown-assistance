PROBLEM_TO_SERVICE = {
    "ENGINE": "MECHANIC",
    "ENGINE_FAILURE": "MECHANIC",

    "TYRE": "TYRE_REPAIR",
    "PUNCTURE": "TYRE_REPAIR",

    "BATTERY": "BATTERY",
    "DEAD_BATTERY": "BATTERY",

    "FUEL": "FUEL_DELIVERY",
    "OUT_OF_FUEL": "FUEL_DELIVERY",

    "TOWING": "TOWING",

    "EV_BATTERY": "EV_CHARGING",

    "ACCIDENT": "ROADSIDE_ASSISTANCE",
}


def get_required_service(problem_type: str) -> str | None:
    return PROBLEM_TO_SERVICE.get(problem_type.upper())