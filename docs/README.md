BuildNexTech Frugal Testing — Registration System (README)

Author: Shreya Gupta
Project: BuildNexTech Frugal Testing — Online Assessment (Registration System)
Purpose: A modern, accessible registration form plus a complete Selenium automation test-suite that demonstrates negative/positive and logic validation flows required by the assessment.

-- Project overview

This project contains a modern, sleek Registration System (single-page, client-side) and an automated Selenium test-suite that validates the form according to the Online Assessment (OA) requirements:

Clean UI with glassmorphism, responsive layout, accessible controls.

Form fields: First Name, Last Name, Email (disposable email blocking), Country Code, Phone, Date of Birth, Gender (radio), Country → State cascade, City (free text), Password, Confirm Password, Terms checkbox.

Client-side validation with helpful inline error messages and password-strength meter.

On successful submit, the form returns a success message and offers a downloadable JSON of the submission.

The automation suite exercises negative and positive flows, plus logic checks (country/state cascade, password strength, confirm password mismatch, required country code validation, disposable email check).

-- Key features

Sleek UI with modern CSS (glass effect, rounded inputs, smooth focus).

Accessibility: keyboard-focus, ARIA live regions for error messages.

Country code validation (simple curated set of E.164-like codes).

Disposable-email detection (client-side block list).

Password strength meter and confirm-password checks.

Selenium automation with screenshot capture, browser-console logs, timestamped run logs.

-- Tech stack

UI: HTML5, CSS3 (modern), vanilla JavaScript

Automation: Python 3 + Selenium (latest stable)

Browser: Google Chrome + matching ChromeDriver

Local server: Python's simple http.server for static hosting during tests

-- File structure (important files)

registration-app/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ register.js
├─ tests/
   └─ selenium/
      ├─ utils.py
      ├─ test_negative_missing_lastname.py
      ├─ test_negative_disposable_email.py
      ├─ test_negative_invalid_country_code.py
      ├─ test_form_logic.py
      ├─ test_positive_complete_registration.py
      ├─ run_all_tests.py
      └─ docs/
         ├─ screenshots/
         └─ logs/

-- How to run the web app (Windows)

Open Command Prompt or PowerShell.

Navigate to project folder:

cd C:\Users\Shreya\Desktop\BuildNexTech\registration-app

Start Python’s simple HTTP server (serves static files at port 8000):

python -m http.server 8000

Open the page in Chrome:

http://localhost:8000/index.html

Keep this server running while executing Selenium tests.

-- How to run Selenium tests (Windows)
1 — Prepare Python environment (once)

From project root:

# create venv (if not already)
python -m venv venv

# activate venv
venv\Scripts\activate

# install selenium
pip install --upgrade pip
pip install selenium

2 — Install ChromeDriver (must match Chrome major version)

Check Chrome version: Open Chrome → ⋮ → Help → About Google Chrome.

Download matching ChromeDriver (use Chrome for Testing pages).

Place chromedriver.exe somewhere:

Either add to PATH or set environment variable CHROMEDRIVER_PATH before running tests, e.g. in PowerShell:

$env:CHROMEDRIVER_PATH = "C:\path\to\chromedriver.exe"

3 — Start server (if not already)
python -m http.server 8000

4 — Activate venv again (in new terminal)
cd C:\Users\Shreya\Desktop\BuildNexTech\registration-app
venv\Scripts\activate

5 — Run the runner

From tests/selenium or project root:

# from project root
python tests/selenium/run_all_tests.py

Or run a single test:

python tests/selenium/test_positive_complete_registration.py

-- What the automation scripts do — step-by-step explanation
Overview

The tests are pure Python + Selenium and are intentionally explicit (no external test frameworks required). They mimic user actions (open page, fill inputs, click) and assert the existence of expected errors or success messages. Each test:

Creates a WebDriver (utils.new_driver(...)) — this opens Chrome (optionally captures browser console logs).

Navigates to the local page http://localhost:8000/index.html.

Waits for the registration form (wait_for(driver, By.ID, "registrationForm")) to stabilize.

Interacts with DOM elements by ID (fill text, click radios/checkbox, select option).

Submits the form where appropriate.

Verifies inline error messages or success results.

Captures screenshots and browser logs on success/failure.

Closes the browser.

Key helper: tests/selenium/utils.py

new_driver(headless=False, enable_console_logs=False): creates webdriver.Chrome with requested options. If enable_console_logs=True the driver is configured to collect browser console logs (modern Selenium compatible).

wait_for(driver, by, locator, timeout): explicit wait for element presence (prevents race conditions).

save_ss(driver, name): saves a screenshot to tests/selenium/docs/screenshots/ and logs it in the run log.

save_browser_logs(driver, prefix): writes browser console messages raised during the run to tests/selenium/docs/logs/.

append_log(msg) writes timestamped messages to a run log file in docs/logs/.

-- Tests (what each covers)

test_negative_missing_lastname.py
Fill everything except Last Name, submit → expect inline lastNameError and field highlight.

test_negative_disposable_email.py
Use a disposable/test email (like mailinator.com) → expect emailError that indicates disposable emails are blocked.

test_negative_invalid_country_code.py
Enter an incorrectly curated country code (e.g., +999) → expect countryCodeError.

test_form_logic.py
Tests logic behaviors: Country → State cascade, password weakness and confirm mismatch, submit button enable/disable when gender/terms not set, then enabling after valid entries.

test_positive_complete_registration.py
Fill every field correctly (valid country code, non-disposable email, matching password, gender chosen, terms accepted), submit → expect success message and downloadable JSON link.

=- How a typical test performs validation (example flow)

Open page and wait for form.

Fill initial inputs using driver.find_element(By.ID, "...").send_keys(...).

Select country option (click <select> then option).

Wait for state options to populate (JS triggers after selecting country).

Click a radio button for gender by ID (e.g., gender_male).

Click the terms checkbox.

Click submitBtn.

Read the inline error node (e.g., element id lastNameError) or formResult success message and assert expected text is present.

Save screenshots before/after submission and save browser console logs.

Logs, screenshots & outputs produced by tests

Logs: tests/selenium/docs/logs/test_run_<TIMESTAMP>.log — shows timestamped actions & results.

Browser console logs (if collected): tests/selenium/docs/logs/<prefix>_console_<TIMESTAMP>.log

Screenshots: tests/selenium/docs/screenshots/ — captured before/after submit and on exceptions (PNG files).

Downloaded JSON: on successful manual submission the page creates a downloadable JSON link (not stored by tests).

-- Common troubleshooting & tips
TypeError: WebDriver.__init__() got an unexpected keyword argument 'desired_capabilities'

Fixed in provided utils.py. Make sure you replaced the old utils.py with the updated one using options.set_capability.

ChromeDriver version mismatches

If you see SessionNotCreatedException — download the ChromeDriver that matches your Chrome major version from the official Chrome-for-Testing downloads.

chromedriver not found

Either put chromedriver.exe on PATH or set PowerShell env var:

$env:CHROMEDRIVER_PATH = "C:\path\to\chromedriver.exe"

I see no logs in docs/logs/

The runner creates a timestamped test_run_<TIMESTAMP>.log. If tests are failing before logger creation, ensure you are running run_all_tests.py and have write permission in tests/selenium/docs/logs/.

Tests failing due to timing / dynamic updates

If state options are slow to populate after selecting a country, increase wait time in wait_for() invocations or add time.sleep(0.5) to give client-side JS time to update.

Headless mode (CI)

To run headless, change new_driver(headless=True) in tests or adjust run_all_tests.py to pass headless=True. Note: when headless, visual debugging is harder — use screenshots & logs.

Extending or modifying tests

Add a new test file in tests/selenium/ following the existing pattern:

from utils import new_driver, wait_for, save_ss, append_log, save_browser_logs, BASE_URL

driver = new_driver(...)

Interact with DOM using stable IDs, assert expected behavior.

Use utils.append_log(...) to add structured messages to run log.

If you add new fields, ensure they have stable id attributes so tests can find them.