/**
 * js/register.js
 * Updated to include:
 *  - Country code field validation (required)
 *  - Extended disposable email domain checks
 *  - Country->State cascade, gender, city (free text)
 *  - Password strength, confirm password, terms
 */

/* ---------- Fallback country data ---------- */
const FALLBACK_COUNTRY_DATA = {
  "India": { "states": { "Maharashtra": [], "Karnataka": [], "Delhi": [] } },
  "United States": { "states": { "California": [], "New York": [], "Texas": [] } }
};

/* ---------- Disposable domains (expanded sample) ----------
   Not exhaustive, but covers many common disposable providers.
   You can expand this list later or load from an external file.
*/
const DISPOSABLE_DOMAINS = [
  "mailinator.com","10minutemail.com","guerrillamail.com","trashmail.com","tempmail.com",
  "guerrillamail.net","getnada.com","dispostable.com","yopmail.com","spamgourmet.com",
  "maildrop.cc","mintemail.com","throwawaymail.com","moakt.com","tempr.email",
  "trashmail.net","spam4.me","mail-temp.net","anonymbox.com","fakeinbox.com"
];

/* ---------- Valid country codes (curated list) ----------
   A curated set of common E.164 country calling codes.
   If you need full global coverage, you can replace this with a complete dataset.
*/
const VALID_COUNTRY_CODES = new Set([
  "+1","+7","+20","+27","+30","+31","+32","+33","+34","+36","+39","+40","+44","+49",
  "+52","+55","+61","+62","+63","+64","+65","+66","+81","+82","+84","+86","+90",
  "+91","+94","+98","+351","+353","+358","+212","+218","+260","+254","+256",
  "+234","+234","+254","+353","+358","+370","+380","+971","+966","+962","+880",
  "+421","+420","+43","+48","+47","+46","+41","+353","+385","+371","+372"
]);

/* ---------- Helpers ---------- */
const el = id => document.getElementById(id);

function setError(id, message) {
  const err = el(id + "Error");
  const input = el(id);
  if (err) err.textContent = message || "";
  if (input) {
    if (message) input.classList.add('invalid'); else input.classList.remove('invalid');
  }
}

function isValidEmailFormat(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email);
}
function isDisposableEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@').pop().toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}
function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-()]/g, '');
  return /^\d{6,12}$/.test(cleaned); // 6-12 digits for local number (without country code)
}
function calcPasswordScore(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..4
}

/* ---------- Country / State helpers ---------- */
function getCountryData() {
  return (window.COUNTRY_DATA && Object.keys(window.COUNTRY_DATA).length) ? window.COUNTRY_DATA : FALLBACK_COUNTRY_DATA;
}

function populateCountries() {
  const countrySelect = el('country');
  if (!countrySelect) return;
  const data = getCountryData();
  countrySelect.innerHTML = '<option value="">Select country</option>';
  Object.keys(data).sort().forEach(country => {
    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });
}

function populateStates(country) {
  const stateSelect = el('state');
  if (!stateSelect) return;
  stateSelect.innerHTML = '<option value="">Select state</option>';
  if (!country) return;
  const data = getCountryData();
  if (!data[country]) return;
  const states = Object.keys(data[country].states || {}).sort();
  states.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    stateSelect.appendChild(opt);
  });
}

/* ---------- Validation functions ---------- */
function validateFirstName() {
  const v = el('firstName').value.trim();
  if (!v) { setError('firstName', 'First name is required'); return false; }
  setError('firstName', ''); return true;
}
function validateLastName() {
  const v = el('lastName').value.trim();
  if (!v) { setError('lastName', 'Last name is required'); return false; }
  setError('lastName', ''); return true;
}
function validateEmail() {
  const v = el('email').value.trim();
  if (!v) { setError('email', 'Email is required'); return false; }
  if (!isValidEmailFormat(v)) { setError('email', 'Invalid email format'); return false; }
  if (isDisposableEmail(v)) { setError('email', 'Disposable email addresses are not allowed'); return false; }
  setError('email', ''); return true;
}
function validateCountryCode() {
  const v = el('countryCode').value.trim();
  if (!v) { setError('countryCode', 'Country code is required'); return false; }
  // must start with + and digits
  if (!/^\+\d{1,4}$/.test(v)) { setError('countryCode', 'Use format +<country code>, e.g. +1, +91'); return false; }
  if (!VALID_COUNTRY_CODES.has(v)) {
    setError('countryCode', `Unrecognized country code: ${v}. Use a correct calling code like +1, +91.`); 
    return false;
  }
  setError('countryCode', ''); return true;
}
function validatePhone() {
  const v = el('phone').value.trim();
  if (!v) { setError('phone', 'Phone is required'); return false; }
  if (!isValidPhone(v)) { setError('phone', 'Enter a valid phone number (6–12 digits) without country code'); return false; }
  setError('phone', ''); return true;
}
function validateCountry() {
  const v = el('country').value;
  if (!v) { setError('country', 'Country is required'); return false; }
  setError('country', ''); return true;
}
function validateState() {
  const v = el('state').value;
  if (!v) { setError('state', 'State is required'); return false; }
  setError('state', ''); return true;
}
function validateCity() {
  const cityInput = el('city');
  if (!cityInput) return true;
  const v = cityInput.value.trim();
  if (!v) { setError('city', 'City is required'); return false; }
  setError('city', ''); return true;
}
function validateGender() {
  const radios = document.getElementsByName('gender');
  if (!radios || radios.length === 0) return true;
  for (let r of radios) if (r.checked) { setError('gender', ''); return true; }
  setError('gender', 'Please select your gender'); return false;
}
function validatePassword() {
  const pw = el('password').value;
  if (!pw) { setError('password', 'Password is required'); updatePasswordMeter(0); return false; }
  const score = calcPasswordScore(pw);
  updatePasswordMeter(score);
  if (score < 3) { setError('password', 'Password is weak — make it longer and include uppercase, number, and symbol'); return false; }
  setError('password', ''); return true;
}
function validateConfirmPassword() {
  const pw = el('password').value;
  const cpw = el('confirmPassword').value;
  if (!cpw) { setError('confirmPassword', 'Please confirm password'); return false; }
  if (pw !== cpw) { setError('confirmPassword', 'Passwords do not match'); return false; }
  setError('confirmPassword', ''); return true;
}
function validateTerms() {
  const checked = el('terms').checked;
  if (!checked) { setError('terms', 'You must accept terms & conditions'); return false; }
  setError('terms', ''); return true;
}

/* Run all validators to show errors */
function isFormValid() {
  const validators = [
    validateFirstName, validateLastName, validateEmail, validateCountryCode, validatePhone,
    validateCountry, validateState, validateCity, validateGender,
    validatePassword, validateConfirmPassword, validateTerms
  ];
  let ok = true;
  validators.forEach(fn => { if (!fn()) ok = false; });
  return ok;
}

/* ---------- Password meter UI ---------- */
function updatePasswordMeter(score) {
  const meter = el('passwordMeter');
  const label = el('pwStrengthLabel');
  if (!meter) return;
  meter.setAttribute('data-strength', String(score));
  if (label) {
    const labels = ['—','Very weak','Weak','Good','Strong'];
    label.textContent = `Strength: ${labels[Math.min(score, labels.length-1)]}`;
  }
  let bar = meter.querySelector('.bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'bar';
    meter.appendChild(bar);
  }
}

/* ---------- Form interactions ---------- */
document.addEventListener('DOMContentLoaded', function () {
  // footer year
  const y = new Date().getFullYear();
  const yearEl = el('year'); if (yearEl) yearEl.textContent = y;

  // populate countries
  populateCountries();

  // events for country/state
  const countryEl = el('country');
  if (countryEl) {
    countryEl.addEventListener('change', function () {
      populateStates(this.value);
      validateCountry();
      validateState();
      toggleFilledClassForSelect('country');
      checkFormState();
    });
  }
  const stateEl = el('state');
  if (stateEl) {
    stateEl.addEventListener('change', function () {
      validateState();
      toggleFilledClassForSelect('state');
      checkFormState();
    });
  }

  // listeners for inputs
  const inputsToWatch = ['firstName','lastName','email','countryCode','phone','password','confirmPassword','dob','city'];
  inputsToWatch.forEach(id => {
    const node = el(id);
    if (!node) return;
    node.addEventListener('input', function () {
      const map = {
        firstName: validateFirstName, lastName: validateLastName, email: validateEmail,
        countryCode: validateCountryCode, phone: validatePhone, password: validatePassword,
        confirmPassword: validateConfirmPassword, city: validateCity
      };
      if (map[id]) map[id]();
      toggleFilledClassForInput(id);
      checkFormState();
    });
    node.addEventListener('change', function () { toggleFilledClassForInput(id); checkFormState(); });
  });

  // gender radios
  const genderRadios = document.getElementsByName('gender');
  if (genderRadios) {
    genderRadios.forEach(r => {
      r.addEventListener('change', function () {
        validateGender();
        checkFormState();
      });
    });
  }

  // terms
  const termsEl = el('terms');
  if (termsEl) termsEl.addEventListener('change', function () { validateTerms(); checkFormState(); });

  // reset
  const resetBtn = el('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      document.querySelectorAll('.error').forEach(e => e.textContent = '');
      document.querySelectorAll('input, select').forEach(i => i.classList.remove('invalid'));
      const meter = el('passwordMeter'); if (meter) { meter.setAttribute('data-strength','0'); meter.innerHTML = '<div class="bar"></div>'; }
      const pwLabel = el('pwStrengthLabel'); if (pwLabel) pwLabel.textContent = 'Strength: —';
      document.querySelectorAll('.form-group').forEach(group => {
        const input = group.querySelector('input, select, textarea');
        if (!input) return;
        const val = (input.tagName.toLowerCase() === 'select') ? input.value : input.value.trim();
        if (val && val.length > 0) group.classList.add('filled'); else group.classList.remove('filled');
      });
      checkFormState();
      const fr = el('formResult'); if (fr) { fr.textContent = ''; fr.className = ''; }
    });
  }

  // submit
  const form = el('registrationForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!isFormValid()) {
        const fr = el('formResult'); if (fr) { fr.textContent = 'Please fix the errors above before submitting.'; fr.className = 'error'; }
        return;
      }
      // build data
      const data = {
        firstName: el('firstName').value.trim(),
        lastName: el('lastName').value.trim(),
        email: el('email').value.trim(),
        countryCode: el('countryCode').value.trim(),
        phone: el('phone').value.trim(),
        dob: el('dob').value || null,
        gender: (function(){
          const r = document.getElementsByName('gender');
          for (let i=0;i<r.length;i++){ if (r[i].checked) return r[i].value; }
          return null;
        })(),
        country: el('country').value,
        state: el('state').value,
        city: el('city') ? el('city').value.trim() : null,
        createdAt: new Date().toISOString()
      };
      const fr = el('formResult');
      if (fr) { fr.textContent = 'Registration successful! You may download the submitted data below.'; fr.className = 'success'; }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const old = el('downloadJson'); if (old) old.remove();
      const a = document.createElement('a');
      a.id = 'downloadJson';
      a.href = url;
      a.download = `registration_${data.firstName || 'user'}_${(new Date()).toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      a.textContent = 'Download submission (JSON)';
      a.className = 'btn btn-secondary';
      a.style.marginLeft = '10px';
      if (fr) fr.appendChild(a);
      const submitBtn = el('submitBtn'); if (submitBtn) submitBtn.disabled = true;
    });
  }

  // initial filled class handling
  document.querySelectorAll('.form-group').forEach(group => {
    const input = group.querySelector('input, select, textarea');
    if (!input) return;
    toggleFilledClassEl(group, input);
    input.addEventListener('input', () => toggleFilledClassEl(group, input));
    input.addEventListener('change', () => toggleFilledClassEl(group, input));
    input.addEventListener('blur', () => toggleFilledClassEl(group, input));
  });

  checkFormState();
});

/* helpers for filled classes */
function toggleFilledClassEl(group, input) {
  const val = (input.tagName.toLowerCase() === 'select') ? input.value : input.value.trim();
  if (val && val.length > 0) group.classList.add('filled'); else group.classList.remove('filled');
}
function toggleFilledClassForInput(id) {
  const input = el(id);
  if (!input) return;
  const group = input.closest('.form-group');
  if (group) toggleFilledClassEl(group, input);
}
function toggleFilledClassForSelect(id) { toggleFilledClassForInput(id); }

/* quick enable/disable logic */
function checkFormState() {
  const submit = el('submitBtn');
  if (!submit) return;
  // gender checked?
  const genderChecked = (function(){
    const r = document.getElementsByName('gender');
    if (!r || r.length === 0) return true;
    for (let i=0;i<r.length;i++) if (r[i].checked) return true;
    return false;
  })();

  const requiredPresent = el('firstName').value.trim() &&
                          el('lastName').value.trim() &&
                          el('email').value.trim() &&
                          el('countryCode').value.trim() &&
                          el('phone').value.trim() &&
                          el('country').value &&
                          el('state').value &&
                          (el('city') ? el('city').value.trim() : true) &&
                          el('password').value &&
                          el('confirmPassword').value &&
                          el('terms').checked &&
                          genderChecked;

  const quickChecks = isValidEmailFormat(el('email').value.trim()) &&
                      (/^\+\d{1,4}$/.test(el('countryCode').value.trim())) &&
                      isValidPhone(el('phone').value.trim());

  submit.disabled = !(requiredPresent && quickChecks);
}
