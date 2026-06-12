// $(document).ready(function () {

//     var $contactForm = $("#contactForm");
//     var $submitBtn   = $contactForm.find("button[type='submit']");

//     // ── Disable submit until CSRF token is loaded ──────────
//     $submitBtn.prop("disabled", true);

//     $.get("./php/csrf.php")
//         .done(function (token) {
//             $("#csrf_token").val(String(token).trim());
//             $submitBtn.prop("disabled", false);
//         })
//         .fail(function () {
//             showToast("Couldn't initialize the form. Please refresh the page.", "error");
//         });

//     // ── Contact Form Submit ────────────────────────────────
//     $contactForm.unbind("submit").bind("submit", function (e) {
//         e.preventDefault();

//         $(".text-danger").remove(); // clear old inline errors

//         var name    = $("#name").val().trim();
//         var email   = $("#email").val().trim();
//         var phone   = $("#phone").val().trim();
//         var subject = $("#subject").val().trim();
//         var message = $("#message").val().trim();
//         var isValid = true;

//         // ── Name validation ────────────────────────────────
//         if (!name) {
//             $("#name").after('<p class="text-danger">Name field is required</p>');
//             $("#name").closest(".form-group").addClass("has-error");
//             isValid = false;
//         } else {
//             $("#name").closest(".form-group").removeClass("has-error").addClass("has-success");
//         }

//         // ── Email validation ───────────────────────────────
//         var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!email) {
//             $("#email").after('<p class="text-danger">Email field is required</p>');
//             $("#email").closest(".form-group").addClass("has-error");
//             isValid = false;
//         } else if (!emailPattern.test(email)) {
//             $("#email").after('<p class="text-danger">Enter a valid email address</p>');
//             $("#email").closest(".form-group").addClass("has-error");
//             isValid = false;
//         } else {
//             $("#email").closest(".form-group").removeClass("has-error").addClass("has-success");
//         }

//         // ── Phone validation ───────────────────────────────
//         if (!phone) {
//             $("#phone").after('<p class="text-danger">Phone field is required</p>');
//             $("#phone").closest(".form-group").addClass("has-error");
//             isValid = false;
//         } else if (!/^[+]?[0-9\s\-]{7,15}$/.test(phone)) {
//             $("#phone").after('<p class="text-danger">Enter a valid phone number</p>');
//             $("#phone").closest(".form-group").addClass("has-error");
//             isValid = false;
//         } else {
//             $("#phone").closest(".form-group").removeClass("has-error").addClass("has-success");
//         }

//         // ── CSRF token must be loaded ──────────────────────
//         if (!$("#csrf_token").val()) {
//             showToast("Form not ready yet. Please wait a moment and try again.", "error");
//             return false;
//         }

//         // ── reCAPTCHA validation ───────────────────────────
//         if (typeof grecaptcha === "undefined") {
//             showToast("CAPTCHA could not load. Disable ad-blockers and refresh.", "error");
//             return false;
//         }
//         var captchaResponse = grecaptcha.getResponse();
//         if (!captchaResponse) {
//             $("#captcha-error").text("Please verify the captcha before submitting.");
//             isValid = false;
//         } else {
//             $("#captcha-error").text("");
//         }

//         if (!isValid) {
//             showToast("Please fill out all required fields and verify the captcha.", "error");
//             return false;
//         }

//         // ── Build form data ────────────────────────────────
//         var formData = {
//             type                   : "contactForm",
//             name                   : name,
//             email                  : email,
//             phone                  : phone,
//             subject                : subject,
//             message                : message,
//             csrf_token             : $("#csrf_token").val(),
//             "g-recaptcha-response" : captchaResponse
//         };

//         // ── Submit via AJAX ────────────────────────────────
//         $submitBtn.prop("disabled", true);
//         showToast("Sending...", "info");

//         $.ajax({
//             url     : "./php/mailController.php",
//             type    : "POST",
//             data    : formData,
//             dataType: "json",
//             success : function (res) {
//                 if (res.success) {
//                     showToast("✅ Message sent successfully! We will get back to you within 24 hours.", "success");
//                     $contactForm[0].reset();
//                     $(".form-group").removeClass("has-error has-success");
//                     resetCaptcha();
//                 } else {
//                     showToast("❌ " + (res.message || "Something went wrong!"), "error");
//                     resetCaptcha();
//                 }
//             },
//             error: function () {
//                 showToast("❌ Server error! Please try again later.", "error");
//                 resetCaptcha();
//             },
//             complete: function () {
//                 $submitBtn.prop("disabled", false);
//             }
//         });

//         return false;
//     });

//     // ── Safe reCAPTCHA reset ───────────────────────────────
//     function resetCaptcha() {
//         if (typeof grecaptcha !== "undefined" && typeof grecaptcha.reset === "function") {
//             try { grecaptcha.reset(); } catch (err) { /* widget not ready */ }
//         }
//     }

// });