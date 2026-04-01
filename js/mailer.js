/* -------------------------------------------

    Mailer JS
    Nichekala — Contact Form Handler

------------------------------------------- */

/* ------------------------------------------
   showToast — defined at top level so it's
   always available regardless of page state
------------------------------------------- */
function showToast(message, type) {
    type = type || 'success';
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return; // safety check if not on contact page
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerText = message;
    toastContainer.appendChild(toast);

    // Show
    setTimeout(function () {
        toast.classList.add('show');
    }, 100);

    // Hide and remove
    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () {
            toast.remove();
        }, 500);
    }, 3000);
}

/* ------------------------------------------
   initContactForm — binds the form submit
   handler. Called on first load AND again
   after every Swup page transition so the
   handler is always live on the contact page
------------------------------------------- */
function initContactForm() {

    // Only run if the contact form exists on this page
    if (!document.getElementById('contactForm')) return;

    $('#contactForm').off('submit').on('submit', function (e) {
        e.preventDefault();

        var name            = $('#name').val().trim();
        var email           = $('#email').val().trim();
        var phone           = $('#phone').val().trim();
        var subject         = $('#subject').val().trim();
        var message         = $('#message').val().trim();
        var captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';

        var isValid = true;

        // Clear old errors
        $('.text-danger').remove();
        $('#captcha-error').text('');

        // Name validation
        if (name === '') {
            $('#name').after('<p class="text-danger">Name field is required</p>');
            isValid = false;
        }

        // Email validation
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
        if (email === '') {
            $('#email').after('<p class="text-danger">Email field is required</p>');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            $('#email').after('<p class="text-danger">Enter a valid email address</p>');
            isValid = false;
        }

        // Phone validation
        if (phone === '') {
            $('#phone').after('<p class="text-danger">Phone field is required</p>');
            isValid = false;
        }

        // reCAPTCHA validation
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
                        if (typeof grecaptcha !== 'undefined') {
                            grecaptcha.reset();
                        }
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
   initRecaptcha — re-renders the reCAPTCHA
   widget after Swup replaces the page content
   because api.js only auto-renders once on
   the very first page load
------------------------------------------- */
function initRecaptcha() {
    var widget = document.querySelector('.g-recaptcha');
    if (!widget) return; // not on contact page

    // Only render if grecaptcha is loaded and widget is empty (not already rendered)
    if (typeof grecaptcha !== 'undefined' && widget.innerHTML.trim() === '') {
        grecaptcha.render(widget, {
            sitekey: '6Le_r_grAAAAANUnAPLrGPAxpuzX8FuzTaNWX6Zh'
        });
    }
}

/* ------------------------------------------
   On first page load
------------------------------------------- */
$(document).ready(function () {
    initContactForm();
    // reCAPTCHA auto-renders itself on first load via api.js, no need to call initRecaptcha here
});

/* ------------------------------------------
   On every Swup page transition
   Re-bind the form and re-render reCAPTCHA
   because Swup replaces DOM content via AJAX
------------------------------------------- */
document.addEventListener('swup:contentReplaced', function () {
    initContactForm();
    initRecaptcha();
});
