// function showToast(message, type) {
//     type = type || 'success';
//     var toastContainer = document.getElementById('toast-container');
//     if (!toastContainer) return;
//     var toast = document.createElement('div');
//     toast.className = 'toast ' + type;
//     toast.innerText = message;
//     toastContainer.appendChild(toast);
//     setTimeout(function () { toast.classList.add('show'); }, 100);
//     setTimeout(function () {
//         toast.classList.remove('show');
//         setTimeout(function () { toast.remove(); }, 500);
//     }, 3000);
// }

// function handleFormSubmit(e) {
//     e.preventDefault();

//     var name    = document.getElementById('name').value.trim();
//     var email   = document.getElementById('email').value.trim();
//     var phone   = document.getElementById('phone').value.trim();
//     var subject = document.getElementById('subject').value.trim();
//     var message = document.getElementById('message').value.trim();
//     var isValid = true;

//     document.querySelectorAll('.text-danger').forEach(function(el) { el.remove(); });

//     if (name === '') {
//         var err = document.createElement('p');
//         err.className = 'text-danger';
//         err.textContent = 'Name field is required';
//         document.getElementById('name').insertAdjacentElement('afterend', err);
//         isValid = false;
//     }

//     var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
//     if (email === '') {
//         var err = document.createElement('p');
//         err.className = 'text-danger';
//         err.textContent = 'Email field is required';
//         document.getElementById('email').insertAdjacentElement('afterend', err);
//         isValid = false;
//     } else if (!emailPattern.test(email)) {
//         var err = document.createElement('p');
//         err.className = 'text-danger';
//         err.textContent = 'Enter a valid email address';
//         document.getElementById('email').insertAdjacentElement('afterend', err);
//         isValid = false;
//     }

//     if (phone === '') {
//         var err = document.createElement('p');
//         err.className = 'text-danger';
//         err.textContent = 'Phone field is required';
//         document.getElementById('phone').insertAdjacentElement('afterend', err);
//         isValid = false;
//     }

//     if (!isValid) {
//         showToast('Please fill out all required fields.', 'error');
//         return false;
//     }

//     var formData = new FormData();
//     formData.append('name', name);
//     formData.append('email', email);
//     formData.append('phone', phone);
//     formData.append('subject', subject);
//     formData.append('message', message);
//     formData.append('type', 'contactForm');

//     fetch('./php/mailController.php', {
//         method: 'POST',
//         body: formData
//     })
//     .then(function(response) { return response.json(); })
//     .then(function(data) {
//         if (data.success) {
//             showToast('Form submitted successfully!', 'success');
//             document.getElementById('contactForm').reset();
//         } else {
//             showToast(data.message || 'Something went wrong!', 'error');
//         }
//     })
//     .catch(function() {
//         showToast('Server error! Please try again later.', 'error');
//     });

// return false;
// }

// function initContactForm() {
//     var form = document.getElementById('contactForm');
//     if (!form) return;
//     form.removeEventListener('submit', handleFormSubmit, false);
//     form.addEventListener('submit', handleFormSubmit, false);
// }

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', function() {
//         setTimeout(initContactForm, 500);
//     });
// } else {
//     setTimeout(initContactForm, 3000);
// }

// document.addEventListener('swup:contentReplaced', function () {
//     initContactForm();
// });
// document.addEventListener('swup:animationInDone', function () {
//     initContactForm();
// });
function showToast(message, type) {
    type = type || 'success';
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(function () {
        toast.classList.add('show');
    }, 100);
    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () {
            toast.remove();
        }, 500);
    }, 3000);
}

function initContactForm() {
    if (!document.getElementById('contactForm')) return;

    $('#contactForm').off('submit').on('submit', function (e) {
        e.preventDefault();

        var name    = $('#name').val().trim();
        var email   = $('#email').val().trim();
        var phone   = $('#phone').val().trim();
        var subject = $('#subject').val().trim();
        var message = $('#message').val().trim();
        var isValid = true;

        $('.text-danger').remove();

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
                    type: 'contactForm'
                },
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        showToast('Form submitted successfully!', 'success');
                        $('#contactForm')[0].reset();
                    } else {
                        showToast(response.message || 'Something went wrong!', 'error');
                    }
                },
                error: function () {
                    showToast('Server error! Please try again later.', 'error');
                }
            });
        } else {
            showToast('Please fill out all required fields.', 'error');
        }

        return false;
    });
}

$(document).ready(function () {
    initContactForm();
});

document.addEventListener('swup:contentReplaced', function () {
    initContactForm();
});