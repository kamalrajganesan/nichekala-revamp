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
   capturePrevent — MUST be outside initContactForm
   so removeEventListener can match the same reference
------------------------------------------- */
function capturePrevent(e) {
    e.preventDefault();
}

/* ------------------------------------------
   initContactForm
------------------------------------------- */
function initContactForm() {
    if (!document.getElementById('contactForm')) return;

    var form = document.getElementById('contactForm');

    // Now remove actually works because capturePrevent is the same reference every time
    form.removeEventListener('submit', capturePrevent, true);
    form.addEventListener('submit', capturePrevent, true);

    $('#contactForm').off('submit').on('submit', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var name            = $('#name').val().trim();
        var email           = $('#email').val().trim();
        var phone           = $('#phone').val().trim();
        var subject         = $('#subject').val().trim();
        var message         = $('#message').val().trim();
        var captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
        var isValid         = true;

        $('.text-danger').remove();
        $('#captcha-error').text('');

        if (name === '') {
            $('#name').after('<p class="text-danger">Name field is required</p>');
            isValid = false;
        }

        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
        if (email === '') {
            $('#email').after('<p class="text-danger">Email field is required</p>');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            $('#email').after('<p class="text-danger">Enter a valid email address</p>');
            isValid = false;
        }

        if (phone === '') {
            $('#phone').after('<p class="text-danger">Phone field is required</p>');
            isValid = false;
        }

        if (captchaResponse.length === 0) {
            $('#captcha-error').text('Please verify the captcha before submitting.');
            isValid = false;
        }

        if (isValid) {
            $.ajax({
                url: './php/mailController.php',
                type: 'POST',
                data: {
                    name: name,
                    email: email,
                    phone: phone,
                    subject: subject,
                    message: message,
                    type: 'contactForm',
                    'g-recaptcha-response': captchaResponse
                },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        showToast('Form submitted successfully!', 'success');
                        $('#contactForm')[0].reset();
                        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                    } else {
                        showToast(response.message || 'Something went wrong!', 'error');
                    }
                },
                error: function () {
                    showToast('Server error! Please try again later.', 'error');
                }
            });
        } else {
            showToast('Please fill out all required fields and verify captcha.', 'error');
        }

        return false;
    });
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
   On first page load
------------------------------------------- */
$(document).ready(function () {
    initContactForm();
});

/* ------------------------------------------
   On every Swup page transition
------------------------------------------- */
document.addEventListener('swup:contentReplaced', function () {
    initContactForm();
    setTimeout(function () {
        initRecaptcha();
    }, 1500);
});