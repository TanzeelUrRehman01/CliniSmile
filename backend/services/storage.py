import cloudinary
import cloudinary.uploader
from core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_DOC_TYPES = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}

MAX_IMAGE_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_BYTES = 50 * 1024 * 1024   # 50 MB
MAX_DOC_BYTES = 10 * 1024 * 1024     # 10 MB
MAX_PROOF_BYTES = 5 * 1024 * 1024    # 5 MB


def upload_file(file_bytes: bytes, folder: str, resource_type: str = "image") -> str:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"cliniSmile/{folder}",
        resource_type=resource_type,
    )
    return result["secure_url"]


def upload_certificate(file_bytes: bytes) -> str:
    return upload_file(file_bytes, "certificates", "image")


def upload_payment_proof(file_bytes: bytes) -> str:
    return upload_file(file_bytes, "payment_proofs", "image")


def upload_media_image(file_bytes: bytes) -> str:
    return upload_file(file_bytes, "clinic_media", "image")


def upload_media_video(file_bytes: bytes) -> str:
    return upload_file(file_bytes, "clinic_media", "video")


def delete_file(public_id: str, resource_type: str = "image"):
    cloudinary.uploader.destroy(public_id, resource_type=resource_type)
