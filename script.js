// ========= NAVBAR MOBILE TOGGLE =========
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "×" : "☰";
  });

  // Close menu when clicking a link
  navMenu.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      if (navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰";
      }
    });
  });
}

// ========= INTRO SPLASH =========
const introSplash = document.getElementById("introSplash");

window.addEventListener("load", () => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!introSplash) return;

  if (prefersReduced) {
    introSplash.style.display = "none";
    return;
  }

  // Small delay so logo animates, then fade out
  setTimeout(() => {
    introSplash.classList.add("hidden");
    setTimeout(() => {
      introSplash.style.display = "none";
    }, 800);
  }, 1400);
});

// ========= REDUCE MOTION & SCROLL ANIMATIONS =========
let reduceMotion = false;
const motionToggle = document.getElementById("motionToggle");

// system preference
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  reduceMotion = true;
}

// saved preference
const saved = localStorage.getItem("tp_reduceMotion");
if (saved !== null) {
  reduceMotion = saved === "true";
}
if (motionToggle) motionToggle.checked = reduceMotion;

function initAnimations() {
  const animated = document.querySelectorAll("[data-animate]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    animated.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "40px" }
  );

  animated.forEach((el) => observer.observe(el));
}

if (motionToggle) {
  motionToggle.addEventListener("change", (e) => {
    reduceMotion = e.target.checked;
    localStorage.setItem("tp_reduceMotion", reduceMotion);
    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => el.classList.remove("visible"));
    initAnimations();
  });
}

initAnimations();

// ========= SMOOTH SCROLL =========
function smoothScrollTo(target) {
  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  const headerHeight = document.querySelector(".navbar")?.offsetHeight || 0;
  const extra = window.innerWidth < 768 ? 20 : 40;
  const top = el.offsetTop - headerHeight - extra;

  window.scrollTo({ top, behavior: "smooth" });
}

// Anchor links (#...)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    smoothScrollTo(target);
  });
});

// Any element with data-scroll-to (buttons)
document.querySelectorAll("[data-scroll-to]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const selector = el.getAttribute("data-scroll-to");
    if (!selector) return;
    smoothScrollTo(selector);
  });
});

// ========= FORM HELPERS =========
function validatePhone(phone) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 10;
}

function showStatus(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.className = "status-text " + (isError ? "error" : "success");
  setTimeout(() => {
    el.textContent = "";
    el.className = "status-text";
  }, 5000);
}

async function sendToFormspree(endpoint, data) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Formspree error");
}

// Put your real Formspree endpoints
const FORM_ENDPOINTS = {
  admission: "https://formspree.io/f/mdkqlorl",
  contact: "https://formspree.io/f/meoylqyw",
};

// ========= ADMISSION FORM =========
const admissionForm = document.getElementById("admissionForm");
const admissionStatus = document.getElementById("admissionStatus");

if (admissionForm && admissionStatus) {
  admissionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const childName = document.getElementById("childName").value.trim();
    const childAge = document.getElementById("childAge").value.trim();
    const parentName = document.getElementById("parentName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const classApplied = document.getElementById("classApplied").value.trim();

    if (!childName || !childAge || !parentName || !phone || !classApplied) {
      showStatus(admissionStatus, "Please fill all required fields.", true);
      return;
    }
    if (!validatePhone(phone)) {
      showStatus(
        admissionStatus,
        "Please enter a valid phone number.",
        true
      );
      return;
    }

    const btn = admissionForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Submitting...";
    btn.disabled = true;

    try {
      const formData = new FormData(admissionForm);
      const body = Object.fromEntries(formData.entries());
      body.submittedAt = new Date().toISOString();

      await sendToFormspree(FORM_ENDPOINTS.admission, body);

      showStatus(
        admissionStatus,
        "✅ Thank you! We will call you soon.",
        false
      );
      admissionForm.reset();
    } catch (err) {
      console.error(err);
      showStatus(
        admissionStatus,
        "Something went wrong. Please try again.",
        true
      );
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ========= CONTACT FORM =========
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

if (contactForm && contactStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMsg").value.trim();

    if (!name || !phone || !message) {
      showStatus(contactStatus, "Please fill all required fields.", true);
      return;
    }
    if (!validatePhone(phone)) {
      showStatus(
        contactStatus,
        "Please enter a valid phone number.",
        true
      );
      return;
    }

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
      const formData = new FormData(contactForm);
      const body = Object.fromEntries(formData.entries());
      body.submittedAt = new Date().toISOString();

      await sendToFormspree(FORM_ENDPOINTS.contact, body);

      showStatus(
        contactStatus,
        "✅ Message sent! We will get back to you.",
        false
      );
      contactForm.reset();
    } catch (err) {
      console.error(err);
      showStatus(
        contactStatus,
        "Something went wrong. Please try again.",
        true
      );
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ========= FOOTER YEAR =========
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
