function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // prevent duplicate binding
  if (form._submitHandler) {
    form.removeEventListener("submit", form._submitHandler);
  }

  form._submitHandler = async function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !phone || !subject || !message) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("subject", subject);
      formData.append("message", message);

      const res = await fetch("php/vendor/send-mail.php", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        showToast("Message sent successfully 🎉", "success");
        form.reset();
      } else {
        showToast(data.message || "Something went wrong", "error");
      }

    } catch (err) {
      showToast("Network error. Try again.", "error");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  };

  form.addEventListener("submit", form._submitHandler);
}

/* IMPORTANT: do NOT double-bind */
// document.addEventListener("DOMContentLoaded", initContactForm);
window.initContactForm = initContactForm;