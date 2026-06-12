/* -------------------------------------------
Ruizarch - Cleaned Main JS
------------------------------------------- */

$(function () {
    "use strict";

    /***************************
    Swup Setup
    ***************************/
    const options = {
        containers: ['#swupMain', '#swupMenu'],
        animateHistoryBrowsing: true,
        linkSelector: 'a:not([data-no-swup])',
        animationSelector: '[class="mil-main-transition"]'
    };

    const swup = new Swup(options);
    window.swup = swup;

    /***************************
    GSAP Plugins
    ***************************/
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /***************************
    Colors
    ***************************/
    const accent = '#c8157b';
    const dark = '#000';
    const light = '#fff';

    /***************************
    Preloader
    ***************************/
    function runPreloader() {
        document.body.classList.add('mil-preloader-active');
        $('.mil-preloader').removeClass("mil-hidden");

        gsap.set(".mil-preloader", { opacity: 1, visibility: "visible" });
        gsap.set(".mil-preloader-animation", { opacity: 0 });
        gsap.set(".mil-animation-1 .mil-h3", { y: "30px", opacity: 0 });
        gsap.set(".mil-animation-2 .mil-h3", { opacity: 0 });

        const tl = gsap.timeline();
        tl.to(".mil-preloader-animation", { opacity: 1 });
        tl.fromTo(".mil-animation-1 .mil-h3",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.4 }
        );
        tl.to(".mil-animation-1 .mil-h3", { opacity: 0, y: -30 }, "+=0.3");
        tl.fromTo(".mil-animation-2 .mil-h3",
            { opacity: 0 },
            { opacity: 1 },
            "-=0.5"
        );
        tl.to(".mil-preloader", {
            opacity: 0,
            ease: "sine",
            onComplete: () => {
                $('.mil-preloader').addClass("mil-hidden");
                document.body.classList.remove('mil-preloader-active');
                document.body.classList.add('mil-preloader-done');
                updateLogo();
            }
        });
    }

    runPreloader();

    /***************************
    Smooth Scroll (anchor)
    ***************************/
    $(document).on('click', 'a[href^="#"]', function (e) {
        e.preventDefault();
        const target = $($.attr(this, 'href'));
        if (!target.length) return;
        let offset = $(window).width() < 1200 ? 90 : 0;
        $('html, body').animate({
            scrollTop: target.offset().top - offset
        }, 400);
    });

    /***************************
    Cursor
    ***************************/
    const cursor = document.querySelector('.mil-ball');
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    document.addEventListener('pointermove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });

    /***************************
    Menu Toggle
    ***************************/
    $(document).on("click", ".mil-menu-btn", function () {
        $('.mil-menu-btn').toggleClass('mil-active');
        $('.mil-menu-frame').toggleClass('mil-active');
    });

    /***************************
    Scroll Progress
    ***************************/
    gsap.to('.mil-progress', {
        height: '100%',
        ease: 'none',
        scrollTrigger: { scrub: 0.3 }
    });

    /***************************
    Scroll Animations
    ***************************/
    function initAnimations() {
        document.querySelectorAll(".mil-up").forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 40, scale: 0.98 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 0.4,
                    scrollTrigger: {
                        trigger: el,
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
    }

    initAnimations();

    /***************************
    Contact Form
    ***************************/
    function showToast(msg, type) {
        const container = document.getElementById("toast-container");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.textContent = msg;
        container.appendChild(toast);
        requestAnimationFrame(() =>
            requestAnimationFrame(() => toast.classList.add("show"))
        );
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 600);
        }, 5000);
    }

    function initContactForm() {
        const form = document.getElementById("contactForm");
        if (!form || form.dataset.bound === "1") return;
        form.dataset.bound = "1";

        form.addEventListener("submit", async function(e) {
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
            const originalHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = "<span>Sending…</span>";

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
            } catch(err) {
                console.error(err);
                showToast("Network error. Please try again.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        });
    }

    initContactForm(); // direct page load

    /***************************
    Swup Page Transition Handler
    ***************************/
    swup.on('contentReplaced', () => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
        initAnimations();
        runPreloader();
        initContactForm();
        $('.mil-menu-btn').removeClass('mil-active');
        $('.mil-menu-frame').removeClass('mil-active');
        updateLogo();
    });

}); // closes $(function(){

/***************************
GLOBAL LOGO UPDATE
***************************/
function updateLogo() {
    const logos = document.querySelectorAll('.mil-logo');
    const darkSections = document.querySelectorAll('.mil-dark-bg');
    let darkBackground = false;
    darkSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom >= 80) {
            darkBackground = true;
        }
    });
    logos.forEach(logo => {
        logo.classList.toggle('dark-logo', darkBackground);
    });
}

window.addEventListener('scroll', updateLogo);
window.addEventListener('load', updateLogo);
window.addEventListener('resize', updateLogo);