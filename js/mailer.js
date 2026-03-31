  function showToast(message, type = 'success') {
            const toastContainer = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerText = message;

            toastContainer.appendChild(toast);

            // Show the toast
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            // Remove the toast after it fades out
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 500); 
            }, 3000); 
        }

    $(document).ready(function () {
        // contact form start
        $("#contactForm").unbind("submit").bind("submit", function (e) {
        e.preventDefault();

        let name = $("#name").val().trim();
        let email = $("#email").val().trim();
        let phone = $("#phone").val().trim();
        let subject = $("#subject").val().trim();
        let message = $("#message").val().trim();
        let captchaResponse = grecaptcha.getResponse();

        let isvalid = true;
        $(".text-danger").remove(); // clear old errors

        // Name validation
        if (name === "") {
            $("#name").after('<p class="text-danger">Name field is required</p>');
            isvalid = false;
        }

        // Email validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
        if (email === "") {
            $("#email").after('<p class="text-danger">Email field is required</p>');
            isvalid = false;
        } else if (!emailPattern.test(email)) {
            $("#email").after('<p class="text-danger">Enter a valid email address</p>');
            isvalid = false;
        }

        // Phone validation
        if (phone === "") {
            $("#phone").after('<p class="text-danger">Phone field is required</p>');
            isvalid = false;
        }

        // reCAPTCHA validation
        if (captchaResponse.length === 0) {
            $("#captcha-error").text("Please verify the captcha.");
            isvalid = false;
        } else {
            $("#captcha-error").text("");
        }

        if (isvalid) {
            $.ajax({
            url: "./php/mailController.php",
            type: "POST",
            data: {
                name,
                email,
                phone,
                subject,
                message,
                type: "contactForm",
                "g-recaptcha-response": captchaResponse
            },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                showToast("Form submitted successfully!", "success");
                $("#contactForm")[0].reset();
                grecaptcha.reset(); // reset captcha
                } else {
                showToast(response.message || "Something went wrong!", "error");
                }
            },
            error: function () {
                showToast("Server error! Please try again later.", "error");
            }
            });
        } else {
            console.log("Form validation failed");
        }

        return false;
        });
        // contact form end
    });