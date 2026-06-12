document.addEventListener("submit", async function (e) {
  const form = e.target;

  if (!form || form.id !== "contactForm") return;

  e.preventDefault();
  e.stopImmediatePropagation();

  const name = form.elements["name"].value.trim();
  const email = form.elements["email"].value.trim();
  const phone = form.elements["phone"].value.trim();
  const subject = form.elements["subject"].value.trim();
  const message = form.elements["message"].value.trim();

  if (!name || !email || !phone || !subject || !message) {
    showToast("Please fill in all fields.", "error");
    return;
  }

  const submitBtn = form.querySelector("button[type='submit']");
  const originalText = submitBtn.innerHTML;

  submitBtn.disabled = true;
  submitBtn.innerHTML = "Sending...";

  try {
    const formData = new FormData(form);

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
    console.error(err);
    showToast("Network error. Try again.", "error");
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;
});