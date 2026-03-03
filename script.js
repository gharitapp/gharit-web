// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Social Media Links Configuration
  const SOCIAL_MEDIA = {
    instagram: "https://www.instagram.com/gharitapp?igsh=MWpkZWJvNTdkcXN3cw==",
    twitter: "#",
    linkedin: "https://www.linkedin.com/company/ghar-t/",
    facebook: "https://www.facebook.com/people/Gharit-App/61583880161338/",
  };

  // Removed hamburger nav toggle (not used)

  // Dynamic base href: keep production domain, use local relative base during dev
  (function () {
    var baseEl = document.querySelector("base");
    if (!baseEl) return;
    var host = (location.hostname || "").toLowerCase();
    var isProd = host.endsWith("gharitapp.com");
    if (!isProd) {
      // Use relative base so local files resolve without hitting blocked domain
      try {
        baseEl.setAttribute("href", "./");
      } catch (e) {}
    }
  })();

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
    { threshold: 0.1 },
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

  // Internal page navigation: ensure Aboutus/FAQ/Careers/Main open reliably
  // even with <base> tags or other click blockers present.
  const INTERNAL_PAGES = [
    "index.html",
    "about-us.html",
    "faq.html",
    "privacy-policy.html",
    "careers.html",
    "apply-job.html",
    "hello.html",
  ]; // case-sensitive names in this folder

  // Map known external slugs (from the live domain/menu) to local files
  const EXTERNAL_TO_LOCAL = {
    "www.gharitapp.com": {
      "/careers": "careers.html",
      "/faq": "faq.html",
      "/company": "about-us.html",
      "/privacy-policy": "privacy-policy.html",
      "/applyjob": "apply-job.html",
      "/hello": "hello.html",
    },
    "gharitapp.com": {
      "/careers": "careers.html",
      "/faq": "faq.html",
      "/company": "about-us.html",
      "/privacy-policy": "privacy-policy.html",
      "/applyjob": "apply-job.html",
      "/hello": "hello.html",
    },
  };

  function getCurrentDirHref() {
    const href = window.location.href;
    const idx = href.lastIndexOf("/");
    return idx >= 0 ? href.slice(0, idx + 1) : href + "/";
  }

  function navigateToLocal(fileName) {
    // If navigating to index.html, set a session flag to skip intro on arrival
    try {
      if (fileName === "index.html") sessionStorage.setItem("skipIntro", "1");
    } catch (_) {}
    const target = getCurrentDirHref() + fileName;
    window.location.href = target;
  }

  // Mark internal and mapped external links as allowed (to bypass any global link blockers)
  function markInternalLinksAllowed() {
    // Direct local filenames
    const selector = INTERNAL_PAGES.map(
      (p) => `a[href$="/${p}"], a[href$="${p}"]`,
    ).join(", ");
    if (selector) {
      document.querySelectorAll(selector).forEach((a) => {
        a.setAttribute("data-allow", "1");
      });
    }

    // External slugs mapping to local files (e.g., https://www.gharitapp.com/careers)
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      try {
        const url = new URL(href, window.location.href);
        const host = url.host;
        // normalize trailing slash
        let path = url.pathname || "/";
        if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
        if (
          EXTERNAL_TO_LOCAL[host] &&
          (EXTERNAL_TO_LOCAL[host][path] ||
            (path === "" && EXTERNAL_TO_LOCAL[host]["/"]))
        ) {
          a.setAttribute("data-allow", "1");
        }
      } catch (_) {
        // ignore
      }
    });
  }

  markInternalLinksAllowed();

  // Helper: navigate to a local file, preserving query params and handling production root
  function navigateToLocalWithQuery(fileName, query) {
    var host = (location.hostname || "").toLowerCase();
    var isProd = host.endsWith("gharitapp.com");
    var q = query || "";
    // If navigating to index.html, set a session flag to skip intro on arrival
    try {
      if (fileName === "index.html") sessionStorage.setItem("skipIntro", "1");
    } catch (_) {}
    if (isProd) {
      // Ensure we go to domain root in production (e.g., /apply-job.html)
      window.location.href = location.origin + "/" + fileName + q;
    } else {
      window.location.href = getCurrentDirHref() + fileName + q;
    }
  }

  // Apply button wiring: route to ApplyJob with params consistently (local + prod)
  function collectApplyParams(sourceEl) {
    // Prefer explicit dataset on the clicked element
    var d = sourceEl && sourceEl.dataset ? sourceEl.dataset : {};
    var params = {
      title: d.jobTitle || d.title || "",
      id: d.jobId || d.id || "",
      location: d.jobLocation || d.location || "",
      dept: d.jobDept || d.department || "",
      tsi: d.tsi || "",
    };

    // If missing, try nearest ancestor with job metadata
    var carrier =
      sourceEl && sourceEl.closest
        ? sourceEl.closest(
            "[data-job-title],[data-title],[data-job-id],[data-id]",
          )
        : null;
    if (carrier && carrier.dataset) {
      params.title =
        params.title || carrier.dataset.jobTitle || carrier.dataset.title || "";
      params.id =
        params.id || carrier.dataset.jobId || carrier.dataset.id || "";
      params.location =
        params.location ||
        carrier.dataset.jobLocation ||
        carrier.dataset.location ||
        "";
      params.dept =
        params.dept ||
        carrier.dataset.jobDept ||
        carrier.dataset.department ||
        "";
      params.tsi = params.tsi || carrier.dataset.tsi || "";
    }

    // Fallback: carry forward existing page query param `tsi` if present
    try {
      var existingQs = new URLSearchParams(window.location.search || "");
      params.tsi = params.tsi || existingQs.get("tsi") || "";
    } catch (_) {}
    return params;
  }

  function goToApplyJob(params) {
    var host = (location.hostname || "").toLowerCase();
    var isProd = host.endsWith("gharitapp.com");
    var qs = new URLSearchParams();
    if (params.title) qs.set("title", params.title);
    if (params.id) qs.set("id", params.id);
    if (params.location) qs.set("location", params.location);
    if (params.dept) qs.set("dept", params.dept);
    if (params.tsi) qs.set("tsi", params.tsi);
    var query = qs.toString();
    var suffix = query ? "?" + query : "";
    // In production, ensure root path; locally, use current dir
    if (isProd) {
      window.location.href = location.origin + "/apply-job.html" + suffix;
    } else {
      window.location.href = getCurrentDirHref() + "apply-job.html" + suffix;
    }
  }

  // Capture Apply clicks before general link routing
  document.addEventListener(
    "click",
    function (e) {
      var el =
        e.target && e.target.closest
          ? e.target.closest(
              '.apply-btn, [data-apply], a[href*="apply-job.html"]',
            )
          : null;
      if (!el) return;
      // If it's a plain anchor to ApplyJob, let our router enhance by adding dataset params
      e.preventDefault();
      var params = collectApplyParams(el);
      goToApplyJob(params);
    },
    true,
  );

  // Capture clicks on anchors to route to local pages robustly
  document.addEventListener(
    "click",
    function (e) {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;

      const href = (a.getAttribute("href") || "").trim();
      if (!href) return;

      // Ignore hash links (handled by smooth scroll above)
      if (href.startsWith("#")) return;

      // Extract just the file name portion for comparison
      try {
        const url = new URL(href, window.location.href);
        const name = url.pathname.split("/").pop();
        // First: route known external slugs to local files
        let path = url.pathname || "/";
        if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
        const host = url.host;
        const mappedLocal =
          EXTERNAL_TO_LOCAL[host] &&
          (EXTERNAL_TO_LOCAL[host][path] ||
            (path === "" && EXTERNAL_TO_LOCAL[host]["/"]))
            ? EXTERNAL_TO_LOCAL[host][path || "/"]
            : null;

        if (mappedLocal) {
          e.preventDefault();
          a.setAttribute("data-allow", "1");
          // Preserve incoming query params when mapping external → local
          navigateToLocalWithQuery(mappedLocal, url.search);
          return;
        }

        // Otherwise: handle direct local filenames
        if (INTERNAL_PAGES.includes(name)) {
          e.preventDefault();
          // ensure future blockers skip this anchor
          a.setAttribute("data-allow", "1");
          navigateToLocal(name);
        }
      } catch (_) {
        // Fallback: simple endsWith check if URL construction fails (e.g., older file:// edge cases)
        const name = href.split("/").pop();
        if (INTERNAL_PAGES.includes(name)) {
          e.preventDefault();
          a.setAttribute("data-allow", "1");
          navigateToLocal(name);
        }
      }
    },
    true, // capture early to beat other global handlers
  );

  // On ApplyJob page: populate header and hidden fields from query params
  (function initApplyPage() {
    var path = (location.pathname || "").toLowerCase();
    var isApplyPage =
      path.endsWith("/apply-job.html") || path.endsWith("apply-job.html");
    if (!isApplyPage) return;

    var params = new URLSearchParams(location.search || "");
    var title = params.get("title") || "";
    var id = params.get("id") || "";
    var locationStr = params.get("location") || "";
    var dept = params.get("dept") || "";
    var tsi = params.get("tsi") || "";

    // Header text
    var headerEl = document.querySelector(
      "#apply-header, [data-apply-header], .apply-header",
    );
    if (headerEl) {
      headerEl.textContent = title
        ? "Apply for " + title
        : headerEl.textContent || "Apply";
    }

    // Hidden fields or inputs — fill if present, ignore otherwise
    function setInput(nameSel, value) {
      if (!value) return;
      var nodes = document.querySelectorAll(
        'input[name="' +
          nameSel +
          '"], input[type="hidden"][name="' +
          nameSel +
          '"]',
      );
      nodes.forEach(function (n) {
        try {
          n.value = value;
        } catch (_) {}
      });
    }

    // Common naming variants
    setInput("jobTitle", title);
    setInput("job_title", title);
    setInput("jobId", id);
    setInput("job_id", id);
    setInput("jobLocation", locationStr);
    setInput("job_location", locationStr);
    setInput("jobDept", dept);
    setInput("job_department", dept);
    setInput("tsi", tsi);
    setInput("TSI", tsi);
  })();

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
