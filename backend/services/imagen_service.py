import os
import json
import base64
import urllib.request
import urllib.error
import logging

logger = logging.getLogger("imagen_service")


def generate_imagen_image_bytes(prompt: str, api_key: str) -> bytes:
    """
    Generate an image using the Google Developer / Gemini AI Studio API (Imagen 4.0).
    Uses urllib to avoid external client library dependencies and be 100% robust.
    """
    # Rest API Predict endpoint for Imagen 4.0
    url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Standard prediction instances payload structure
    body = {
        "instances": [
            {
                "prompt": prompt
            }
        ],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "outputMimeType": "image/jpeg"
        }
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(body).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            resp_data = json.loads(response.read().decode("utf-8"))
            predictions = resp_data.get("predictions", [])
            if not predictions:
                raise Exception("No predictions returned from Imagen API")
            
            base64_str = predictions[0].get("bytesBase64Encoded")
            if not base64_str:
                raise Exception("No base64 image bytes found in predictions")
                
            return base64.b64decode(base64_str)
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode("utf-8")
        logger.error(f"Imagen HTTPError {he.code}: {err_msg}")
        raise Exception(f"Imagen API failed with status {he.code}: {err_msg}")
    except Exception as e:
        logger.error(f"Imagen API Error: {str(e)}")
        raise e


def get_or_generate_slide_image(session_id: str, slide_number: int, prompt: str, api_key: str | None) -> str | None:
    """
    Retrieves the slide image from the local cache folder, or generates it 
    using Gemini Imagen and caches it on disk.
    
    Returns the absolute path to the cached image, or None if image generation fails or api_key is missing.
    """
    # Cache directory inside backend/cache/{session_id}/
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache_dir = os.path.join(backend_dir, "cache", session_id)
    os.makedirs(cache_dir, exist_ok=True)
    
    image_path = os.path.join(cache_dir, f"slide_{slide_number}.jpg")
    
    # 1. Cache hit - reuse existing image
    if os.path.exists(image_path) and os.path.getsize(image_path) > 0:
        logger.info(f"Cache HIT for slide {slide_number} image in session {session_id}")
        return image_path
        
    # 2. Check if API key is provided
    if not api_key:
        logger.warning(f"GEMINI_IMAGEN_API_KEY is not defined. Skipping image generation for slide {slide_number}.")
        return None
        
    # 3. Cache miss - generate new image
    logger.info(f"Cache MISS for slide {slide_number} in session {session_id}. Generating with Imagen...")
    
    style_suffix = "Professional startup pitch deck illustration, modern corporate design, clean background, presentation quality, investor-focused, minimalist, visually impactful, high quality, suitable for a YC or Sequoia startup presentation, 16:9 composition."
    full_prompt = f"{prompt}, {style_suffix}"
    
    try:
        image_bytes = generate_imagen_image_bytes(full_prompt, api_key)
        
        # Save image bytes to cache path
        with open(image_path, "wb") as fh:
            fh.write(image_bytes)
            
        logger.info(f"Successfully cached generated image for slide {slide_number} to {image_path}")
        return image_path
    except Exception as exc:
        logger.error(f"Failed to generate slide {slide_number} image: {exc}. Using placeholder fallback.")
        return None
