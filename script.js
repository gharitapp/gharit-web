// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Mobile navigation toggle
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");

  if (burger) {
    burger.addEventListener("click", function () {
      // Toggle navigation
      nav.classList.toggle("active");

      // Animate burger
      burger.classList.toggle("toggle");
    });
  }

  // Animate service cards on scroll
  const serviceCards = document.querySelectorAll(".service-card");

  // Intersection Observer for animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  // Apply initial styles and observe service cards
  serviceCards.forEach((card) => {
    card.style.opacity = 0;
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(card);
  });

  // Login page functionality
  const phoneForm = document.getElementById("phone-form");
  const otpForm = document.getElementById("otp-form");
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const backBtn = document.getElementById("back-btn");
  const timerElement = document.getElementById("timer");

  // Handle OTP form submission
  if (phoneForm) {
    phoneForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Hide phone form and show OTP form
      phoneForm.classList.remove("active");
      otpForm.classList.add("active");

      // Update steps
      step1.classList.remove("active");
      step2.classList.add("active");

      // Start timer
      startTimer();
    });
  }

  // Handle back button
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      // Hide OTP form and show phone form
      otpForm.classList.remove("active");
      phoneForm.classList.add("active");

      // Update steps
      step2.classList.remove("active");
      step1.classList.add("active");
    });
  }

  // OTP input handling - move to next input after typing
  const otpInputs = document.querySelectorAll(".otp-input");

  if (otpInputs.length > 0) {
    otpInputs.forEach((input, index) => {
      input.addEventListener("keyup", function (e) {
        // If a number is entered
        if (e.key >= 0 && e.key <= 9) {
          // Move to next input if available
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        } else if (e.key === "Backspace") {
          // Move to previous input if available
          if (index > 0) {
            otpInputs[index - 1].focus();
          }
        }
      });
    });
  }

  // Timer function for OTP resend
  function startTimer() {
    if (!timerElement) return;

    let timeLeft = 30;
    timerElement.textContent = timeLeft;

    const timer = setInterval(function () {
      timeLeft--;
      timerElement.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timer);
        timerElement.parentElement.innerHTML =
          '<a href="#" class="resend-link">Resend OTP</a>';

        // Add event listener to resend link
        const resendLink = document.querySelector(".resend-link");
        if (resendLink) {
          resendLink.addEventListener("click", function (e) {
            e.preventDefault();
            startTimer();
          });
        }
      }
    }, 1000);
  }

  // Form validation for OTP form
  if (otpForm) {
    otpForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Simulate successful login
      alert("Login successful!");
      window.location.href = "index.html";
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Get the modal
  const modal = document.getElementById("login-modal");

  // Get all elements that should open the modal
  const loginBtns = document.querySelectorAll(".login-btn, .secondary-btn");

  // Get the close button
  const closeBtn = document.querySelector(".close-modal");

  // Open modal when login buttons are clicked
  loginBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (
        this.getAttribute("href") === "login.html" ||
        this.textContent.trim() === "Get Started"
      ) {
        e.preventDefault();
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent scrolling
      }
    });
  });

  // Close modal when close button is clicked
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
      document.body.style.overflow = "auto"; // Enable scrolling
    });
  }

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto"; // Enable scrolling
    }
  });
});
