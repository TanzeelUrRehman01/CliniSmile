"""
OCR-Based Certificate Verification Pipeline
============================================
1. Download image/PDF from Cloudinary URL
2. Preprocess with Pillow (grayscale, contrast, threshold)
3. Extract text with pytesseract
4. Score text against dental keyword corpus
5. Return confidence score + AI verdict
"""

import re
import tempfile
import httpx
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import pytesseract
from pdf2image import convert_from_path

# Dental credential keyword corpus with weights
KEYWORD_WEIGHTS: dict[str, int] = {
    "pmdc":                  30,   # Pakistan Medical & Dental Council
    "pakistan medical":      28,
    "bds":                   25,   # Bachelor of Dental Surgery
    "dds":                   25,   # Doctor of Dental Surgery
    "dmd":                   25,   # Doctor of Medicine in Dentistry
    "bachelor of dental":    22,
    "doctor of dental":      22,
    "dental surgery":        20,
    "dental medicine":       20,
    "orthodontics":          15,
    "periodontology":        15,
    "endodontics":           15,
    "prosthodontics":        15,
    "oral surgery":          15,
    "dental college":        12,
    "dentist":               10,
    "dental":                 8,
    "university":             5,
    "degree":                 4,
    "certificate":            3,
    "diploma":                3,
}


def preprocess_image(img: Image.Image) -> Image.Image:
    """Enhance image quality for better OCR accuracy."""
    img = img.convert("L")                             # Grayscale
    img = ImageOps.autocontrast(img)                   # Auto contrast
    img = ImageEnhance.Contrast(img).enhance(2.0)      # Boost contrast
    img = img.filter(ImageFilter.SHARPEN)              # Sharpen
    img = img.point(lambda x: 0 if x < 140 else 255)  # Binarise
    return img


def extract_text_from_image(img: Image.Image) -> str:
    """Run Tesseract OCR on a preprocessed image."""
    processed = preprocess_image(img)
    config = "--psm 6 --oem 3"
    text = pytesseract.image_to_string(processed, config=config)
    return text.strip()


def extract_text_from_pdf(file_path: str) -> str:
    """Convert PDF pages to images then OCR each page."""
    pages = convert_from_path(file_path, dpi=300)
    all_text = []
    for page in pages:
        all_text.append(extract_text_from_image(page))
    return "\n".join(all_text)


def calculate_confidence(text: str) -> tuple[float, str]:
    """
    Score OCR text against keyword corpus.
    Returns (confidence_score 0-100, verdict string).
    """
    text_lower = text.lower()
    # Remove special chars for cleaner matching
    clean_text = re.sub(r"[^a-z0-9\s]", " ", text_lower)

    raw_score = 0
    matched_keywords = []

    for keyword, weight in KEYWORD_WEIGHTS.items():
        if keyword in clean_text:
            raw_score += weight
            matched_keywords.append(keyword)

    # Normalise to 0-100 (max possible raw is ~250)
    confidence = min(round((raw_score / 120) * 100, 2), 100.0)

    if confidence >= 50:
        verdict = "likely_valid"
    elif confidence >= 20:
        verdict = "requires_review"
    else:
        verdict = "invalid"

    return confidence, verdict, matched_keywords


async def verify_certificate(file_url: str, file_type: str = "image") -> dict:
    """
    Full pipeline: download → OCR → score → return result dict.
    file_type: 'image' or 'pdf'
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(file_url)
            response.raise_for_status()
            content = response.content

        with tempfile.NamedTemporaryFile(
            suffix=".pdf" if file_type == "pdf" else ".png",
            delete=False
        ) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        if file_type == "pdf":
            ocr_text = extract_text_from_pdf(tmp_path)
        else:
            from PIL import Image as PILImage
            import io
            img = PILImage.open(io.BytesIO(content))
            ocr_text = extract_text_from_image(img)

        confidence, verdict, matched = calculate_confidence(ocr_text)

        return {
            "success": True,
            "ocr_text": ocr_text[:5000],  # Store up to 5k chars
            "ai_confidence_score": confidence,
            "ai_verdict": verdict,
            "matched_keywords": matched,
        }

    except Exception as e:
        return {
            "success": False,
            "ocr_text": "",
            "ai_confidence_score": 0.0,
            "ai_verdict": "requires_review",
            "matched_keywords": [],
            "error": str(e),
        }
