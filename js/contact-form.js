// Contact Form Submission Handler

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // Remove any existing listener to avoid duplicates on Swup transitions
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const phone   = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // ── Basic Validation ────────────────────────────────────────────────────
    if (!name || !email || !phone || !subject || !message) {
      showToast("Please fill in all fields.", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      showToast("Please enter a valid phone number.", "error");
      return false;
    }

    // ── Submit Button State ─────────────────────────────────────────────────
    const submitBtn = newForm.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Sending...</span>";

    // ── Send to PHP ─────────────────────────────────────────────────────────
    const formData = new FormData();
    formData.append("name",    name);
    formData.append("email",   email);
    formData.append("phone",   phone);
    formData.append("subject", subject);
    formData.append("message", message);

    fetch("send-mail.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Hey! We got your message. We'll get back to you soon! 🎉", "success");
          newForm.reset();
        } else {
          showToast(data.message || "Something went wrong. Please try again.", "error");
        }
      })
      .catch(() => {
        showToast("Network error. Please check your connection and try again.", "error");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });

    return false;
  });
}

// ── Toast Helper ──────────────────────────────────────────────────────────────
function showToast(msg, type) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = msg;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 600);
  }, 5000);
}

// ── Init on first load ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", initContactForm);

// ── Re-init after every Swup page transition ──────────────────────────────────
document.addEventListener("swup:contentReplaced", initContactForm);