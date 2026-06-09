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

    var name    = document.getElementById('name').value.trim();
    var email   = document.getElementById('email').value.trim();
    var phone   = document.getElementById('phone').value.trim();
    var subject = document.getElementById('subject').value.trim();
    var message = document.getElementById('message').value.trim();
    var isValid = true;

    document.querySelectorAll('.text-danger').forEach(function(el) { el.remove(); });

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

    if (!isValid) {
        showToast('Please fill out all required fields.', 'error');
        return false;
    }

    var formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('type', 'contactForm');

    fetch('./php/mailController.php', {
        method: 'POST',
        body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            showToast('Form submitted successfully!', 'success');
            document.getElementById('contactForm').reset();
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
    form.removeEventListener('submit', handleFormSubmit, false);
    form.addEventListener('submit', handleFormSubmit, false);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initContactForm, 500);
    });
} else {
    setTimeout(initContactForm, 500);
}

document.addEventListener('swup:contentReplaced', function () {
    initContactForm();
});