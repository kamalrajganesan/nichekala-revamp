$(document).ready(function () {

        // contact form start
        $("#contactForm").unbind("submit").bind("submit", function (e) {
        e.preventDefault();

        let name = $("#name").val().trim();
        let email = $("#email").val().trim();
        let phone = $("#phone").val().trim();
        let subject = $("#subject").val().trim();
        let message = $("#message").val().trim();
        let isvalid = true;

        $(".text-danger").remove(); 

        // Name validation
        if (name === "") {
            $("#name").after('<p class="text-danger">Name field is required</p>');
            $("#name").closest(".form-group").addClass("has-error");
            isvalid = false;
        } else {
            $("#name").closest(".form-group").removeClass("has-error").addClass("has-success");
        }

        // Email validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
        if (email === "") {
            $("#email").after('<p class="text-danger">Email field is required</p>');
            $("#email").closest(".form-group").addClass("has-error");
            isvalid = false;
        } else if (!emailPattern.test(email)) {
            $("#email").after('<p class="text-danger">Enter a valid email address</p>');
            $("#email").closest(".form-group").addClass("has-error");
            isvalid = false;
        } else {
            $("#email").closest(".form-group").removeClass("has-error").addClass("has-success");
        }

        // Phone validation
        if (phone === "") {
            $("#phone").after('<p class="text-danger">Phone field is required</p>');
            $("#phone").closest(".form-group").addClass("has-error");
            isvalid = false;
        } else {
            $("#phone").closest(".form-group").removeClass("has-error").addClass("has-success");
        }

      

        if (isvalid) {
            let formData = {
            name,
            email,
            phone,
            subject,
            message,
            type: "contactForm",
            };

            $.ajax({
            url: "./php/mailController.php",
            type: "POST",
            data: formData,
            dataType: "json",
            success: function (params) {
                if (params.success) {
                showToast("Form submitted successfully!", "success");
                $("#contactForm")[0].reset();
                grecaptcha.reset(); // ✅ reset captcha after success
                } else {
                showToast(params.message || "Something went wrong!", "error");
                console.log("Error in success:", params.message);
                }
            },
            error: function () {
                showToast("Server error! Please try again later.", "error");
            },
            });
        } else {
            showToast("Please fill out all the required fields and verify captcha.", "error");
            console.log("Form validation failed");
        }

        return false;
        });
    });