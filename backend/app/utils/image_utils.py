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
    
    # Always allow valid readable images to proceed to disease detection
    warning_msg = None
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 5:
        warning_msg = "Note: Image appears slightly soft/blurry, but processing continued."
        
    return {"is_valid": True, "warning": warning_msg}
