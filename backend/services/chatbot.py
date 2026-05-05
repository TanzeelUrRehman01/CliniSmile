"""
AI Dental Consultation Chatbot
================================
Rule-based NLP chatbot for dental consultations.
Classifies intent, assesses severity, returns structured response.
Every response includes a mandatory medical disclaimer.
"""

import re
from dataclasses import dataclass

DISCLAIMER = (
    "\n\n⚠️ *Disclaimer: This is not a medical diagnosis. "
    "Please consult a licensed dentist for professional advice.*"
)

# Intent → keywords mapping
INTENTS = {
    "toothache": ["tooth pain", "toothache", "aching tooth", "tooth hurts", "dental pain", "مسوڑوں میں درد"],
    "cavity": ["cavity", "hole in tooth", "decay", "caries", "rotten tooth"],
    "sensitivity": ["sensitivity", "sensitive", "pain when eating cold", "hot pain", "sweet pain"],
    "gum_disease": ["gum", "gums bleed", "bleeding gum", "swollen gum", "gum pain", "periodont"],
    "wisdom_tooth": ["wisdom tooth", "wisdom teeth", "third molar", "back tooth"],
    "broken_tooth": ["broken tooth", "cracked tooth", "chipped tooth", "fractured tooth"],
    "bad_breath": ["bad breath", "halitosis", "smell from mouth"],
    "teeth_whitening": ["whiten", "whitening", "yellow teeth", "staining"],
    "braces": ["braces", "orthodont", "crooked teeth", "alignment", "invisalign"],
    "emergency": ["emergency", "severe pain", "unbearable", "swelling face", "cannot eat", "fever"],
    "appointment": ["book", "appointment", "schedule", "see a doctor", "visit"],
    "greeting": ["hello", "hi", "hey", "salam", "assalam", "good morning", "good afternoon"],
    "general": [],
}

# Severity assessment keywords
HIGH_SEVERITY = ["severe", "unbearable", "extreme", "cannot sleep", "swelling", "fever", "emergency", "pus", "abscess"]
MEDIUM_SEVERITY = ["moderate", "aching", "persistent", "weeks", "months"]

# Response templates
RESPONSES = {
    "toothache": (
        "Toothaches can be caused by cavities, cracked teeth, gum disease, or an abscess. "
        "Here's what you can do right now:\n"
        "• Rinse with warm salt water\n"
        "• Take an over-the-counter pain reliever (ibuprofen)\n"
        "• Avoid hot, cold, or sweet foods\n"
        "• Apply a cold compress externally for 20 minutes\n\n"
        "I strongly recommend booking an appointment with a dentist for proper diagnosis."
    ),
    "cavity": (
        "Cavities are caused by tooth decay from bacteria and sugar. Signs include:\n"
        "• Visible holes or dark spots on teeth\n"
        "• Tooth sensitivity or pain\n"
        "• Pain when biting\n\n"
        "Treatment options include fillings, inlays, or crowns depending on severity. "
        "Early-stage cavities can sometimes be reversed with fluoride treatment. "
        "Please see a dentist soon to prevent further damage."
    ),
    "sensitivity": (
        "Tooth sensitivity is often caused by:\n"
        "• Worn enamel\n"
        "• Exposed root surfaces\n"
        "• Cracked teeth or fillings\n"
        "• Gum recession\n\n"
        "Try a sensitivity toothpaste (containing potassium nitrate or stannous fluoride). "
        "Avoid acidic foods and hard brushing. If sensitivity persists, consult a dentist."
    ),
    "gum_disease": (
        "Gum disease (periodontitis) is a serious infection of the gums that can lead to tooth loss. "
        "Warning signs:\n"
        "• Bleeding when brushing\n"
        "• Swollen or red gums\n"
        "• Bad breath\n"
        "• Receding gums\n\n"
        "Action: Improve brushing and flossing technique, use antiseptic mouthwash. "
        "Professional cleaning (scaling) by a dentist is essential."
    ),
    "wisdom_tooth": (
        "Wisdom tooth pain usually occurs when the tooth is impacted or erupting. "
        "You may experience:\n"
        "• Pain at the back of the mouth\n"
        "• Swelling around the jaw\n"
        "• Difficulty opening your mouth\n\n"
        "Salt water rinse and pain relievers can provide temporary relief. "
        "A dentist may recommend extraction depending on the X-ray."
    ),
    "broken_tooth": (
        "A broken or cracked tooth requires prompt attention. "
        "Steps to take now:\n"
        "• Rinse your mouth with warm water\n"
        "• Apply a cold compress to reduce swelling\n"
        "• Cover the broken area with dental wax if sharp edges are present\n"
        "• Save any broken pieces if possible\n\n"
        "Please book an emergency appointment as soon as possible."
    ),
    "bad_breath": (
        "Bad breath (halitosis) is usually caused by:\n"
        "• Poor oral hygiene\n"
        "• Gum disease\n"
        "• Dry mouth\n"
        "• Certain foods or medications\n\n"
        "Tips: Brush twice daily (including your tongue), floss daily, stay hydrated, "
        "and use antibacterial mouthwash. See a dentist to rule out gum disease."
    ),
    "teeth_whitening": (
        "Teeth whitening options include:\n"
        "• Professional whitening (fastest, most effective)\n"
        "• Take-home whitening trays from your dentist\n"
        "• Over-the-counter whitening strips\n\n"
        "Professional whitening gives the best results. "
        "Avoid staining foods (coffee, tea, red wine) after treatment."
    ),
    "braces": (
        "Orthodontic treatment can correct:\n"
        "• Crowded or crooked teeth\n"
        "• Overbite/underbite\n"
        "• Gaps between teeth\n\n"
        "Options include metal braces, ceramic braces, and clear aligners (Invisalign). "
        "Treatment duration is typically 12-24 months. "
        "Book a consultation with an orthodontist for a personalised assessment."
    ),
    "emergency": (
        "🚨 This sounds like a dental emergency. Please seek immediate dental care.\n\n"
        "While you arrange urgent care:\n"
        "• Take pain medication (ibuprofen or paracetamol)\n"
        "• Apply a cold compress externally\n"
        "• Do NOT apply aspirin directly to the tooth\n"
        "• If swelling is spreading to your neck or you have difficulty breathing/swallowing, go to an emergency room immediately."
    ),
    "appointment": (
        "I can help you find a verified dentist near you! "
        "Use the 'Find a Doctor' feature to search by location and specialty. "
        "You can also filter by availability and view ratings from other patients."
    ),
    "greeting": (
        "Hello! 👋 Welcome to CliniSmile AI's dental consultation assistant.\n\n"
        "I can help you with:\n"
        "• Dental pain and symptoms\n"
        "• Oral hygiene advice\n"
        "• Understanding treatment options\n"
        "• Finding a verified dentist near you\n\n"
        "What dental concern can I help you with today?"
    ),
    "general": (
        "Thank you for your question. For personalised dental advice, "
        "I recommend describing your specific symptoms so I can give you better guidance. "
        "You can also use our 'Find a Doctor' feature to book an appointment with a verified dentist."
    ),
}


@dataclass
class ChatResponse:
    intent: str
    severity: str
    response: str
    suggest_booking: bool


def classify_intent(text: str) -> str:
    text_lower = text.lower()
    for intent, keywords in INTENTS.items():
        if any(kw in text_lower for kw in keywords):
            return intent
    return "general"


def assess_severity(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in HIGH_SEVERITY):
        return "high"
    if any(kw in text_lower for kw in MEDIUM_SEVERITY):
        return "medium"
    return "low"


def process_message(user_message: str) -> ChatResponse:
    intent = classify_intent(user_message)
    severity = assess_severity(user_message)
    base_response = RESPONSES.get(intent, RESPONSES["general"])

    suggest_booking = intent in ("emergency", "toothache", "broken_tooth", "wisdom_tooth") or severity == "high"

    if suggest_booking and intent != "appointment":
        base_response += "\n\n👉 **Book an appointment now** to get professional help."

    full_response = base_response + DISCLAIMER

    return ChatResponse(
        intent=intent,
        severity=severity,
        response=full_response,
        suggest_booking=suggest_booking,
    )
