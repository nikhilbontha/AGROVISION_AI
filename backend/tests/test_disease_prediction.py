import unittest
import numpy as np
import cv2
from app.routes.predict import validate_leaf_image, analyze_lesion_masking

class TestDiseaseDiagnosticEngine(unittest.TestCase):

    def test_valid_green_leaf_validation(self):
        # Synthetic green leaf matrix
        img = np.zeros((300, 300, 3), dtype=np.uint8)
        img[:, :] = (34, 139, 34) # Green foliage
        is_valid, reason, ratio = validate_leaf_image(img)
        self.assertTrue(is_valid)
        self.assertGreater(ratio, 0.5)

    def test_lesion_analysis(self):
        # Green leaf with brown lesion spots
        img = np.zeros((300, 300, 3), dtype=np.uint8)
        img[:, :] = (34, 139, 34) # Green base
        cv2.rectangle(img, (50, 50), (100, 100), (19, 69, 139), -1) # Brown spot
        
        count, severity, b64_img = analyze_lesion_masking(img, is_healthy=False)
        self.assertGreater(count, 0)
        self.assertTrue(len(b64_img) > 0)

if __name__ == "__main__":
    unittest.main()
