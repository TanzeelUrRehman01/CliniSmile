"""
Smart Doctor Recommendation Engine
====================================
Ranks doctors using a weighted multi-factor score:
  40% Proximity   (Haversine distance from patient)
  30% Availability (has slots in next 7 days)
  20% Rating      (average patient review score)
  10% Response    (appointment acceptance rate)
"""

import math
from datetime import date, timedelta
from typing import Optional


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in km."""
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def proximity_score(distance_km: float) -> float:
    """0-100 score, higher = closer. Decay beyond 20 km."""
    if distance_km <= 1:
        return 100.0
    if distance_km >= 50:
        return 0.0
    return max(0.0, 100 - (distance_km / 50) * 100)


def availability_score(slots_next_7_days: int) -> float:
    """0-100 score based on number of free slots in next 7 days."""
    return min(slots_next_7_days * 10, 100.0)


def rating_score(average_rating: float) -> float:
    """Convert 0-5 rating to 0-100 score."""
    return (average_rating / 5.0) * 100


def response_rate_score(confirmed: int, total: int) -> float:
    """Acceptance rate as 0-100 score."""
    if total == 0:
        return 50.0  # Neutral for new doctors
    return (confirmed / total) * 100


def compute_recommendation_score(
    distance_km: Optional[float],
    slots_next_7: int,
    avg_rating: float,
    confirmed_appointments: int,
    total_appointments: int,
) -> float:
    """Weighted composite score (0-100)."""
    prox = proximity_score(distance_km if distance_km is not None else 50)
    avail = availability_score(slots_next_7)
    rate = rating_score(avg_rating)
    resp = response_rate_score(confirmed_appointments, total_appointments)

    return round(
        prox * 0.40 + avail * 0.30 + rate * 0.20 + resp * 0.10,
        2,
    )


def rank_doctors(doctors_data: list[dict]) -> list[dict]:
    """
    Input: list of dicts with keys:
        doctor, distance_km, slots_next_7, avg_rating,
        confirmed_appointments, total_appointments
    Output: sorted list with recommendation_score added
    """
    scored = []
    for d in doctors_data:
        score = compute_recommendation_score(
            distance_km=d.get("distance_km"),
            slots_next_7=d.get("slots_next_7", 0),
            avg_rating=float(d.get("avg_rating", 0)),
            confirmed_appointments=d.get("confirmed_appointments", 0),
            total_appointments=d.get("total_appointments", 0),
        )
        scored.append({**d, "recommendation_score": score})

    return sorted(scored, key=lambda x: x["recommendation_score"], reverse=True)
