document.addEventListener("submit", async function (e) {
  const form = e.target;

  if (form && form.id === "contactForm") {
    e.preventDefault();
    e.stopImmediatePropagation();

    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const phone = form.querySelector("#phone").value.trim();
    const subject = form.querySelector("#subject").value.trim();
    const message = form.querySelector("#message").value.trim();

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
  }
});