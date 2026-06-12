// Contact Form Submission Handler
// Place this script at the bottom of contact.html before </body>
// OR include it as: <script src="js/contact-form.js"></script>

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const phone   = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // ── Basic Validation ──────────────────────────────────────────────────────
    if (!name || !email || !phone || !subject || !message) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      showToast("Please enter a valid phone number.", "error");
      return;
    }

    // ── Submit Button State ───────────────────────────────────────────────────
    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Sending...</span>";

    // ── Send to PHP ───────────────────────────────────────────────────────────
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
          showToast("Form successfully submitted! Check your inbox for a confirmation email.", "success");
          form.reset();
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
  });

  // ── Toast Helper ─────────────────────────────────────────────────────────────
  function showToast(msg, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.textContent = msg;
    container.appendChild(toast);

    // Trigger show
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 600);
    }, 5000);
  }
});