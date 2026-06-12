// document.addEventListener("submit", async function (e) {
//   const form = e.target;

//   if (!form || form.id !== "contactForm") return;

//   e.preventDefault();
//   e.stopImmediatePropagation();

//   const name = form.elements["name"].value.trim();
//   const email = form.elements["email"].value.trim();
//   const phone = form.elements["phone"].value.trim();
//   const subject = form.elements["subject"].value.trim();
//   const message = form.elements["message"].value.trim();

//   if (!name || !email || !phone || !subject || !message) {
//     showToast("Please fill in all fields.", "error");
//     return;
//   }

//   const submitBtn = form.querySelector("button[type='submit']");
//   const originalText = submitBtn.innerHTML;

//   submitBtn.disabled = true;
//   submitBtn.innerHTML = "Sending...";

//   try {
//     const formData = new FormData(form);

//     const res = await fetch("php/vendor/send-mail.php", {
//       method: "POST",
//       body: formData
//     });

//     const data = await res.json();

//     if (data.success) {
//       showToast("Message sent successfully 🎉", "success");
//       form.reset();
//     } else {
//       showToast(data.message || "Something went wrong", "error");
//     }

//   } catch (err) {
//     console.error(err);
//     showToast("Network error. Try again.", "error");
//   }

//   submitBtn.disabled = false;
//   submitBtn.innerHTML = originalText;
// });
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.removeEventListener("submit", form._submitHandler);

  form._submitHandler = async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const name    = form.elements["name"].value.trim();
    const email   = form.elements["email"].value.trim();
    const phone   = form.elements["phone"].value.trim();
    const subject = form.elements["subject"].value.trim();
    const message = form.elements["message"].value.trim();

    if (!name || !email || !phone || !subject || !message) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Sending...</span>";

    try {
      const res = await fetch("php/vendor/send-mail.php", {
        method: "POST",
        body: new FormData(form)
      });

      const data = await res.json();

      if (data.success) {
        showToast("Hey! We got your message. We'll get back to you soon! 🎉", "success");
        form.reset();
      } else {
        showToast(data.message || "Something went wrong.", "error");
      }

    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
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

// Initial load — wait for Swup to be ready before binding
document.addEventListener("DOMContentLoaded", function () {
  var interval = setInterval(function () {
    if (window.swup) {
      clearInterval(interval);
      initContactForm();
    }
  }, 20);
  setTimeout(function () {
    clearInterval(interval);
    initContactForm();
  }, 5000);
});