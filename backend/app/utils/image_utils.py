import cv2
import numpy as np

def check_image_quality(image_bytes):
    """
    Analyzes image quality and returns a status dict.
    Returns: {"is_valid": bool, "warning": str}
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"is_valid": False, "warning": "Invalid image format"}
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 1. Blur Detection (Laplacian Variance)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 30: # Threshold for severe blur
        return {"is_valid": False, "warning": "Image is too blurry. Please upload a clear, focused photo."}
        
    # 2. Brightness Check
    mean_brightness = np.mean(gray)
    if mean_brightness < 20:
        return {"is_valid": False, "warning": "Image is too dark. Please ensure good lighting."}
    if mean_brightness > 240:
        return {"is_valid": False, "warning": "Image is too bright/overexposed. Please ensure clear lighting."}
        
    return {"is_valid": True, "warning": None}
