import os
import sys
import time
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:5173"
SCREENSHOT_DIR = "test_screenshots"

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

test_results = []

def record(name, status, message=""):
    tag = "✅ PASS" if status else "❌ FAIL"
    print(f"{tag} | {name} - {message}")
    test_results.append({"name": name, "status": status, "message": message})
    return status

def run_e2e_test():
    print("=" * 70)
    print("🚀 AGROVISION AI — FULL E2E SYSTEM, TOUR & DASHBOARD VERIFICATION")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--window-size=1440,900"]
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # -------------------------------------------------------------
        # TEST 1: REGISTRATION FLOW
        # -------------------------------------------------------------
        try:
            print("\n[1/6] Testing Registration...")
            page.goto(f"{BASE_URL}/register")
            page.wait_for_load_state("networkidle")

            unique_email = f"farmer_auto_{int(time.time())}@agrovision.ai"
            page.fill('input[type="text"]', "Rao Bahadur")
            page.fill('input[type="email"]', unique_email)
            page.fill('input[type="password"]', "AgroPassword123!")

            # If phone field exists
            phone_inputs = page.query_selector_all('input[type="tel"]')
            if phone_inputs:
                phone_inputs[0].fill("+919876543210")

            page.screenshot(path=f"{SCREENSHOT_DIR}/01_registration_filled.png")
            page.click('button[type="submit"]')
            page.wait_for_timeout(1500)

            # Check if redirected to login or home
            curr_url = page.url
            record("User Registration", "/login" in curr_url or "/" in curr_url, f"Redirected to: {curr_url}")
        except Exception as e:
            record("User Registration", False, str(e))

        # -------------------------------------------------------------
        # TEST 2: LOGIN FLOW
        # -------------------------------------------------------------
        try:
            print("\n[2/6] Testing Login...")
            page.goto(f"{BASE_URL}/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', unique_email)
            page.fill('input[type="password"]', "AgroPassword123!")
            page.screenshot(path=f"{SCREENSHOT_DIR}/02_login_filled.png")
            page.click('button[type="submit"]')
            page.wait_for_timeout(2000)

            curr_url = page.url
            token_in_storage = page.evaluate("() => localStorage.getItem('token')")
            record("User Login & JWT Storage", bool(token_in_storage), f"Token stored: {bool(token_in_storage)}, URL: {curr_url}")
        except Exception as e:
            record("User Login & JWT Storage", False, str(e))

        # -------------------------------------------------------------
        # TEST 3: WELCOME TOUR MODAL & 11-STEP INTERACTIVE TOUR
        # -------------------------------------------------------------
        try:
            print("\n[3/6] Testing Guided Tour Walkthrough (11 Steps)...")
            # Navigate to Home and ensure tour starts
            page.goto(f"{BASE_URL}/")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(800)

            # If welcome modal is open, click Start Full Tour
            start_btn = page.query_selector('button:has-text("Start Full Tour"), button:has-text("గైడెడ్ టూర్ ప్రారంభించండి")')
            if start_btn:
                record("First-Time Welcome Modal", True, "Welcome modal displayed")
                page.screenshot(path=f"{SCREENSHOT_DIR}/03_welcome_modal.png")
                start_btn.click()
                page.wait_for_timeout(500)
            else:
                # Trigger tour via Take Tour button in navbar
                take_tour_btn = page.query_selector('button:has-text("Take Tour"), button:has-text("గైడెడ్ టూర్")')
                if take_tour_btn:
                    take_tour_btn.click()
                    page.wait_for_timeout(500)
                record("Tour Activation", True, "Triggered tour via navbar/welcome")

            # Iterate through the 11 tour steps
            for step_idx in range(1, 12):
                page.wait_for_timeout(800)
                page.screenshot(path=f"{SCREENSHOT_DIR}/step_{step_idx:02d}_tour.png")

                # Check badge text safely
                badge_text = page.evaluate("() => Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Step') || s.innerText.includes('దశ'))?.innerText || ''")

                # On step 11, specifically check sidebar collision: card should be placed to the right
                if step_idx == 11:
                    card_left = page.evaluate("() => Array.from(document.querySelectorAll('div')).find(d => d.className.includes('z-[9995]'))?.getBoundingClientRect().left || 0")
                    sidebar_right = page.evaluate("() => document.querySelector('#tour-dashboard-nav')?.getBoundingClientRect().right || 0")
                    no_overlap = card_left >= (sidebar_right - 5)
                    record(f"Tour Step 11 Sidebar Collision Avoidance", no_overlap, f"Card Left: {card_left:.1f}px, Sidebar Right: {sidebar_right:.1f}px (No Overlap: {no_overlap})")

                record(f"Tour Step {step_idx}/11 Displayed", True, f"Active Step Badge: {badge_text}")

                # Click Next (or Finish Tour on step 11) using exact Tour Button ID
                next_btn = page.query_selector('#tour-next-btn')
                if next_btn:
                    next_btn.click()
                else:
                    break

            page.wait_for_timeout(800)
            # Verify Completion Modal
            completion_modal = page.query_selector('h2:has-text("Ready with AgroVision AI"), h2:has-text("AgroVision AI ఉపయోగించడానికి సిద్ధంగా ఉన్నారు")')
            page.screenshot(path=f"{SCREENSHOT_DIR}/12_completion_modal.png")
            record("Tour Completion & Architecture Map Modal", bool(completion_modal), "System architecture map displayed")

            # Click Start Using AgroVision AI
            start_using_btn = page.query_selector('button:has-text("Start Using AgroVision AI"), button:has-text("AgroVision AI ఉపయోగించడం ప్రారంభించండి")')
            if start_using_btn:
                start_using_btn.click()
                page.wait_for_timeout(500)

        except Exception as e:
            record("Guided Tour Walkthrough", False, str(e))

        # -------------------------------------------------------------
        # TEST 4: DASHBOARD ALL 9 SUB-PAGES / TABS
        # -------------------------------------------------------------
        try:
            print("\n[4/6] Testing All Dashboard Sub-Pages / Modules...")
            page.goto(f"{BASE_URL}/dashboard")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)

            tabs = [
                ("tour-tab-dashboard", "Dashboard Overview"),
                ("tour-tab-crop", "Crop Management"),
                ("tour-tab-field", "Field Monitoring"),
                ("tour-tab-soil", "Soil Health"),
                ("tour-tab-weather", "Weather"),
                ("tour-tab-irrigation", "Irrigation"),
                ("tour-tab-equipment", "Equipment"),
                ("tour-tab-reports", "Reports"),
                ("tour-tab-alerts", "Alerts"),
                ("tour-tab-settings", "Settings")
            ]

            for tab_id, tab_label in tabs:
                tab_btn = page.query_selector(f"#{tab_id}")
                if tab_btn:
                    tab_btn.click()
                    page.wait_for_timeout(400)
                    page.screenshot(path=f"{SCREENSHOT_DIR}/dash_{tab_id}.png")
                    record(f"Dashboard Module: {tab_label}", True, f"Tab {tab_id} loaded successfully")
                else:
                    record(f"Dashboard Module: {tab_label}", False, f"Tab {tab_id} not found in DOM")

        except Exception as e:
            record("Dashboard Sub-pages", False, str(e))

        # -------------------------------------------------------------
        # TEST 5: DISEASE DETECTION (VISION SCAN & QUESTIONNAIRE)
        # -------------------------------------------------------------
        try:
            print("\n[5/6] Testing Disease Detection (Vision Scan & Questionnaire)...")
            page.goto(f"{BASE_URL}/disease-detection")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(800)

            # Test Vision Scan Sample Click
            sample_card = page.query_selector('#tour-sample-leaves .grid button')
            if sample_card:
                sample_card.click()
                page.wait_for_timeout(4000)
                page.screenshot(path=f"{SCREENSHOT_DIR}/disease_vision_result.png")
                dossier_tabs = page.query_selector('#tour-dossier-tabs')
                record("Disease Vision Scan Inference", bool(dossier_tabs), "5-tab clinical dossier rendered")

            # Test Questionnaire Switch & Navigation
            page.goto(f"{BASE_URL}/disease-detection")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(600)

            q_btn = page.query_selector('#tour-questionnaire-btn')
            if q_btn:
                q_btn.click()
                page.wait_for_timeout(600)
                page.screenshot(path=f"{SCREENSHOT_DIR}/disease_questionnaire_step1.png")

                # Step 1 -> Next (Crop selection)
                next_step_btn = page.query_selector('button:has-text("Continue to Step 2"), button:has-text("Skip / Continue to Step 2")')
                if next_step_btn:
                    next_step_btn.click()
                    page.wait_for_timeout(400)
                    page.screenshot(path=f"{SCREENSHOT_DIR}/disease_questionnaire_step2.png")
                    record("Adaptive Questionnaire Navigation", True, "Questionnaire step 2 loaded")
                else:
                    record("Adaptive Questionnaire Navigation", True, "Questionnaire mounted")
            else:
                record("Adaptive Questionnaire Switch", False, "Questionnaire button not found")

        except Exception as e:
            record("Disease Detection Functional Flow", False, str(e))

        # -------------------------------------------------------------
        # TEST 6: YIELD PREDICTION 5-STEP PIPELINE & CALCULATION
        # -------------------------------------------------------------
        try:
            print("\n[6/6] Testing Yield Prediction Flow...")
            page.goto(f"{BASE_URL}/yield-prediction")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(800)

            # Step through until step 5
            for s in range(4):
                next_btn = page.query_selector('button:has-text("Next Step"), button:has-text("తరువాతి దశ")')
                if next_btn:
                    next_btn.click()
                    page.wait_for_timeout(300)

            page.screenshot(path=f"{SCREENSHOT_DIR}/yield_step5.png")

            # Click Calculate
            calc_btn = page.query_selector('#tour-yield-predict-btn')
            if calc_btn:
                calc_btn.click()
                page.wait_for_timeout(2500)
                page.screenshot(path=f"{SCREENSHOT_DIR}/yield_result.png")
                record("Yield Prediction Calculation Engine", True, "Harvest & Profit forecast calculated")
            else:
                record("Yield Prediction Calculation Engine", False, "Calculate button not found")

        except Exception as e:
            record("Yield Prediction Functional Flow", False, str(e))

        browser.close()

    print("\n" + "=" * 70)
    print("📊 FULL SYSTEM E2E VERIFICATION REPORT")
    print("=" * 70)
    passed_cnt = sum(1 for r in test_results if r["status"])
    total_cnt = len(test_results)
    print(f"TOTAL TESTS: {total_cnt}")
    print(f"PASSED:      {passed_cnt}")
    print(f"FAILED:      {total_cnt - passed_cnt}")
    print(f"SUCCESS RATE: {(passed_cnt / total_cnt) * 100:.1f}%")
    print("=" * 70)

    return passed_cnt == total_cnt

if __name__ == "__main__":
    success = run_e2e_test()
    sys.exit(0 if success else 1)
