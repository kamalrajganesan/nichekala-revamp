function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.removeEventListener("submit", form._submitHandler);

  form._submitHandler = function(e) {
    e.preventDefault();
    e.stopPropagation();

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const phone   = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !phone || !subject || !message) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Sending...</span>";

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("subject", subject);
    formData.append("message", message);

    fetch("php/vendor/send-mail.php", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("Hey! We got your message. We'll get back to you soon! 🎉", "success");
        form.reset();
      } else {
        showToast(data.message || "Something went wrong.", "error");
      }
    })
    .catch(() => {
      showToast("Network error. Please try again.", "error");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  };

  form.addEventListener("submit", form._submitHandler);
}

function showToast(msg, type) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 600);
  }, 5000);
}

// Initial load
document.addEventListener("DOMContentLoaded", initContactForm);

// Re-init after every Swup page transition
document.addEventListener("swup:contentReplaced", initContactForm);