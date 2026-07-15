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

    // Only the <p> errors are ours to remove. #captcha-error is a permanent
    // <span class="text-danger"> in the markup — a bare '.text-danger' sweep
    // deletes it, and the next line then throws on a null element.
    document.querySelectorAll('p.text-danger').forEach(function(el) { el.remove(); });
    var captchaError = document.getElementById('captcha-error');
    if (captchaError) captchaError.textContent = '';

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
        if (captchaError) captchaError.textContent = 'Please verify the captcha before submitting.';
        isValid = false;
    }

    if (!isValid) {
        showToast('Please fill out all required fields and verify captcha.', 'error');
        return false;
    }

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

function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    // Exactly one submit listener. handleFormSubmit calls preventDefault itself;
    // a second capture-phase listener here would run first and, via
    // stopImmediatePropagation, stop handleFormSubmit from ever running.
    form.removeEventListener('submit', handleFormSubmit, false);
    form.addEventListener('submit', handleFormSubmit, false);
}

/* ------------------------------------------
   FIRST PAGE LOAD — single direct call
   (script is at bottom of body so DOM is ready)

   Swup navigations are NOT handled here: this file sits outside the swup
   container, so it never re-runs on a page transition. main.js owns that —
   it loads this file on demand and calls initContactForm(). main.js also
   owns reloading reCAPTCHA; doing it here too made the two race.
------------------------------------------- */
initContactForm();