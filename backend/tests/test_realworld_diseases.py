import unittest
import numpy as np
import cv2
from app.routes.predict import validate_leaf_image, resolve_target_crop, analyze_lesion_masking

class TestRealWorldCropDiseases(unittest.TestCase):

    def create_synthetic_leaf(self, base_bgr, lesion_bgr=None):
        """Creates synthetic plant leaf matrix with background outdoor foliage."""
        img = np.zeros((350, 350, 3), dtype=np.uint8)
        img[:, :] = base_bgr # Foliage background
        
        if lesion_bgr is not None:
            # Draw multiple disease lesion spots
            cv2.ellipse(img, (120, 100), (25, 12), 30, 0, 360, lesion_bgr, -1)
            cv2.ellipse(img, (200, 220), (30, 15), 45, 0, 360, lesion_bgr, -1)
            cv2.circle(img, (170, 150), 18, lesion_bgr, -1)
        return img

    def test_paddy_rice_blast(self):
        # Rice leaf: yellowish-green base with brown spindle-shaped blast spots
        leaf = self.create_synthetic_leaf(base_bgr=(40, 160, 60), lesion_bgr=(20, 50, 135))
        is_valid, reason, ratio = validate_leaf_image(leaf)
        self.assertTrue(is_valid, f"Paddy Rice Blast failed validation: {reason}")
        
        crop = resolve_target_crop("Rice", "rice_blast_field_google.jpg", leaf, None, None, b"")
        self.assertEqual(crop, "Rice")
        
        count, severity, _ = analyze_lesion_masking(leaf, is_healthy=False)
        self.assertGreater(count, 0)

    def test_wheat_rust(self):
        # Wheat leaf: green base with yellow stripe rust pustules
        leaf = self.create_synthetic_leaf(base_bgr=(30, 140, 40), lesion_bgr=(15, 200, 240))
        is_valid, reason, ratio = validate_leaf_image(leaf)
        self.assertTrue(is_valid, f"Wheat Rust failed validation: {reason}")
        
        crop = resolve_target_crop("Wheat", "wheat_stripe_rust_google.png", leaf, None, None, b"")
        self.assertEqual(crop, "Wheat")
        
        count, severity, _ = analyze_lesion_masking(leaf, is_healthy=False)
        self.assertGreater(count, 0)

    def test_tomato_early_blight(self):
        # Tomato leaf: dark green foliage with dark brown concentric blight spots
        leaf = self.create_synthetic_leaf(base_bgr=(25, 110, 35), lesion_bgr=(15, 45, 100))
        is_valid, reason, ratio = validate_leaf_image(leaf)
        self.assertTrue(is_valid, f"Tomato Early Blight failed validation: {reason}")
        
        crop = resolve_target_crop("Tomato", "tomato_blight_field.jpg", leaf, None, None, b"")
        self.assertEqual(crop, "Tomato")
        
        count, severity, _ = analyze_lesion_masking(leaf, is_healthy=False)
        self.assertGreater(count, 0)

    def test_cotton_leaf_curl(self):
        # Cotton leaf: green foliage with yellow chlorotic spots
        leaf = self.create_synthetic_leaf(base_bgr=(35, 130, 45), lesion_bgr=(20, 210, 220))
        is_valid, reason, ratio = validate_leaf_image(leaf)
        self.assertTrue(is_valid, f"Cotton Leaf Curl failed validation: {reason}")
        
        crop = resolve_target_crop("Cotton", "cotton_bacterial_blight.jpg", leaf, None, None, b"")
        self.assertEqual(crop, "Cotton")

    def test_corn_rust(self):
        # Corn leaf: golden green foliage with dark brown rust spots
        leaf = self.create_synthetic_leaf(base_bgr=(30, 150, 100), lesion_bgr=(18, 55, 120))
        is_valid, reason, ratio = validate_leaf_image(leaf)
        self.assertTrue(is_valid, f"Corn Rust failed validation: {reason}")
        
        crop = resolve_target_crop("Corn", "corn_common_rust.jpg", leaf, None, None, b"")
        self.assertEqual(crop, "Corn")

    def test_tomato_fruit_override(self):
        # Tomato fruit: yellow-green fruit (BGR with high Red/Yellow hue)
        fruit = np.zeros((350, 350, 3), dtype=np.uint8)
        fruit[:, :] = (30, 180, 210) # Yellow-orange fruit base
        # Add brown spot lesions
        cv2.circle(fruit, (150, 150), 25, (15, 45, 100), -1)
        
        # Even if crop_type was "Corn" or "Auto-Detect", visual red/yellow fruit mask resolves to Tomato
        crop_auto = resolve_target_crop("Auto-Detect", "images (4).jpeg", fruit, None, None, b"")
        self.assertEqual(crop_auto, "Tomato")

if __name__ == "__main__":
    unittest.main()
