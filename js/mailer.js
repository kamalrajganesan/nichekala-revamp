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
   capturePrevent — top level so same reference
   is used for remove + add every time
------------------------------------------- */
function capturePrevent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
}

/* ------------------------------------------
   handleFormSubmit — the actual submit logic
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
    var captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
    var isValid         = true;

    // Clear old errors
    document.querySelectorAll('.text-danger').forEach(function(el) { el.remove(); });
    document.getElementById('captcha-error').textContent = '';

    if (name === '') {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Name field is required';
        document.getElementById('name').insertAdjacentElement('afterend', err);
        isValid = false;
    }

    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
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

    if (phone === '') {
        var err = document.createElement('p');
        err.className = 'text-danger';
        err.textContent = 'Phone field is required';
        document.getElementById('phone').insertAdjacentElement('afterend', err);
        isValid = false;
    }

    if (captchaResponse.length === 0) {
        document.getElementById('captcha-error').textContent = 'Please verify the captcha before submitting.';
        isValid = false;
    }

    if (!isValid) {
        showToast('Please fill out all required fields and verify captcha.', 'error');
        return false;
    }

    // AJAX via native fetch — no jQuery dependency
    var formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('type', 'contactForm');
    formData.append('g-recaptcha-response', captchaResponse);

    fetch('./php/mailController.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('Form submitted successfully!', 'success');
            document.getElementById('contactForm').reset();
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        } else {
            showToast(data.message || 'Something went wrong!', 'error');
        }
    })
    .catch(function() {
        showToast('Server error! Please try again later.', 'error');
    });

    return false;
}

/* ------------------------------------------
   initContactForm — pure native DOM, no jQuery
------------------------------------------- */
function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    // Remove both listeners before re-adding (prevents stacking)
    form.removeEventListener('submit', capturePrevent, true);
    form.removeEventListener('submit', handleFormSubmit, false);

    // Capture phase — fires first, kills default
    form.addEventListener('submit', capturePrevent, true);

    // Bubble phase — runs the actual logic
    form.addEventListener('submit', handleFormSubmit, false);
}

/* ------------------------------------------
   initRecaptcha
------------------------------------------- */
function initRecaptcha() {
    var widget = document.querySelector('.g-recaptcha');
    if (!widget) return;
    var oldScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (oldScript) oldScript.remove();
    widget.innerHTML = '';
    var script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

/* ------------------------------------------
   On first page load — native, no jQuery needed
------------------------------------------- */
// document.addEventListener('DOMContentLoaded', function () {
//     initContactForm();
// });

// Safety net if DOMContentLoaded already fired
// if (document.readyState === 'complete' || document.readyState === 'interactive') {
//     initContactForm();
// }

/* ------------------------------------------
   On every Swup page transition
------------------------------------------- */
document.addEventListener('swup:contentReplaced', function () {
    initContactForm();
    setTimeout(function () {
        initRecaptcha();
    }, 1500);
});