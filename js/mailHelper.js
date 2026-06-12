/* ------------------------------------------
   showToast
------------------------------------------- */
function showToast(message, type) {
    type = type || 'success';
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 100);
    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 500);
    }, 3000);
}

/* ------------------------------------------
   CSRF token fetch
   Disables submit until token is loaded.
------------------------------------------- */
function fetchCsrfToken() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var submitBtn = form.querySelector("button[type='submit']");
    var csrfInput = document.getElementById('csrf_token');
    if (!csrfInput) return;

    if (submitBtn) submitBtn.disabled = true;

    fetch('./php/csrf.php')
        .then(function(res) { return res.text(); })
        .then(function(token) {
            csrfInput.value = token.trim();
            if (submitBtn) submitBtn.disabled = false;
            console.log('✅ CSRF token loaded');
        })
        .catch(function() {
            showToast("Couldn't initialize the form. Please refresh the page.", 'error');
            console.warn('❌ CSRF token fetch failed');
        });
}

/* ------------------------------------------
   Form submit prevention (capture phase)
------------------------------------------- */
function capturePrevent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
}

/* ------------------------------------------
   Main form handler
------------------------------------------- */
function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var name            = document.getElementById('name').value.trim();
    var email           = document.getElementById('email').value.trim();
    var phone           = document.getElementById('phone').value.trim();
    var subject         = document.getElementById('subject').value.trim();
    var message         = document.getElementById('message').value.trim();
    var csrfToken       = document.getElementById('csrf_token') ? document.getElementById('csrf_token').value : '';
    var captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
    var isValid         = true;

    // ── Clear old errors ───────────────────────────────────
    document.querySelectorAll('.text-danger').forEach(function(el) { el.remove(); });
    var captchaErr = document.getElementById('captcha-error');
    if (captchaErr) captchaErr.textContent = '';

    // ── Name validation ────────────────────────────────────
    if (name === '') {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Name field is required';
        document.getElementById('name').insertAdjacentElement('afterend', err);
        isValid = false;
    }

    // ── Email validation ───────────────────────────────────
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Email field is required';
        document.getElementById('email').insertAdjacentElement('afterend', err);
        isValid = false;
    } else if (!emailPattern.test(email)) {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Enter a valid email address';
        document.getElementById('email').insertAdjacentElement('afterend', err);
        isValid = false;
    }

    // ── Phone validation ───────────────────────────────────
    if (phone === '') {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Phone field is required';
        document.getElementById('phone').insertAdjacentElement('afterend', err);
        isValid = false;
    } else if (!/^[+]?[0-9\s\-]{7,15}$/.test(phone)) {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Enter a valid phone number';
        document.getElementById('phone').insertAdjacentElement('afterend', err);
        isValid = false;
    }

    // ── CSRF check ─────────────────────────────────────────
    if (!csrfToken) {
        showToast('Form not ready yet. Please wait a moment and try again.', 'error');
        return false;
    }

    // ── reCAPTCHA check ────────────────────────────────────
    if (typeof grecaptcha === 'undefined') {
        showToast('CAPTCHA could not load. Disable ad-blockers and refresh.', 'error');
        return false;
    }
    if (captchaResponse.length === 0) {
        if (captchaErr) captchaErr.textContent = 'Please verify the captcha before submitting.';
        isValid = false;
    }

    if (!isValid) {
        showToast('Please fill out all required fields and verify captcha.', 'error');
        return false;
    }

    // ── Build FormData ─────────────────────────────────────
    var formData = new FormData();
    formData.append('type',                  'contactForm');
    formData.append('name',                  name);
    formData.append('email',                 email);
    formData.append('phone',                 phone);
    formData.append('subject',               subject);
    formData.append('message',               message);
    formData.append('csrf_token',            csrfToken);
    formData.append('g-recaptcha-response',  captchaResponse);
    // honeypot — always empty, checked by PHP
    formData.append('website', '');

    // ── Disable submit while sending ───────────────────────
    var submitBtn = document.querySelector('#contactForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // ── Send ───────────────────────────────────────────────
    fetch('./php/mailController.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('✅ Message sent successfully! We will get back to you within 24 hours.', 'success');
            document.getElementById('contactForm').reset();
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
            // Clear CSRF field and re-fetch fresh token for next submission
            var csrfInput = document.getElementById('csrf_token');
            if (csrfInput) csrfInput.value = '';
            fetchCsrfToken();
        } else {
            showToast('❌ ' + (data.message || 'Something went wrong!'), 'error');
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
    })
    .catch(function() {
        showToast('❌ Server error! Please try again later.', 'error');
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
    })
    .finally(function() {
        if (submitBtn) submitBtn.disabled = false;
    });

    return false;
}

/* ------------------------------------------
   initContactForm
   Called on first load AND every Swup transition
------------------------------------------- */
function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    // Remove any previously attached listeners to avoid duplicates
    form.removeEventListener('submit', capturePrevent, true);
    form.removeEventListener('submit', handleFormSubmit, false);
    form.addEventListener('submit', capturePrevent, true);
    form.addEventListener('submit', handleFormSubmit, false);

    // Fetch a fresh CSRF token every time the form is initialised
    fetchCsrfToken();

    console.log('✅ initContactForm ready');
}

/* ------------------------------------------
   initRecaptcha
   Reloads reCAPTCHA widget after Swup transition
------------------------------------------- */
function initRecaptcha() {
    var widget = document.querySelector('.g-recaptcha');
    if (!widget) return;

    var oldScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (oldScript) oldScript.remove();
    widget.innerHTML = '';
    if (window.grecaptcha) window.grecaptcha = undefined;

    var script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = function () {
        console.log('✅ reCAPTCHA loaded and rendered');
    };
    document.head.appendChild(script);
}

/* ------------------------------------------
   FIRST PAGE LOAD
------------------------------------------- */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

/* ------------------------------------------
   SWUP TRANSITIONS
------------------------------------------- */
document.addEventListener('swup:contentReplaced', function () {
    initContactForm();
    setTimeout(function () {
        initRecaptcha();
    }, 1000);
});

// Replace the bottom of mailHelper.js with:
function tryInit() {
    if (document.getElementById('contactForm')) {
        initContactForm();
    }
}

/* ------------------------------------------
   FIRST PAGE LOAD
------------------------------------------- */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

/* ------------------------------------------
   SWUP TRANSITIONS
------------------------------------------- */
document.addEventListener('swup:contentReplaced', function () {
    setTimeout(initContactForm, 100);
    setTimeout(initRecaptcha, 1000);
});