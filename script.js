function openModal(certId) {
  const modal = document.getElementById("certificateModal");
  const modalImg = document.getElementById("modalImage");
  const certCard = document.querySelector(`[data-cert-id="${certId}"]`);
  const certImg = certCard.querySelector(".certificate-image");

  modal.classList.add("show");
  modalImg.src = certImg.src;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("certificateModal");
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    if (document.getElementById("mobileOverlay")) closeMobileMenu();
  }
});

document
  .getElementById("certificateModal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });

const mobileOverlayElem = document.getElementById("mobileOverlay");
if (mobileOverlayElem) {
  mobileOverlayElem.addEventListener("click", function (e) {
    if (e.target === this) {
      closeMobileMenu();
    }
  });
}

// Navigation functionality
function showSection(sectionName) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(sectionName).classList.add("active");

  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  const activeLink = document.querySelector(
    `[onclick="showSection('${sectionName}')"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }

  window.scrollTo(0, 0);
}

// Navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile menu functionality
function toggleMobileMenu() {
  const overlay = document.getElementById("mobileOverlay");
  const isOpen = overlay.classList.contains("show");
  if (isOpen) {
    closeMobileMenu();
    return;
  }

  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  const overlay = document.getElementById("mobileOverlay");
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}

// Smooth animations on scroll
function animateOnScroll() {
  const elements = document.querySelectorAll(
    ".project-card, .skill-category, .contact-item"
  );
  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < window.innerHeight - elementVisible) {
      element.style.animation = "fadeInUp 0.6s ease forwards";
    }
  });
}

window.addEventListener("scroll", animateOnScroll);

document.addEventListener("DOMContentLoaded", function () {
  animateOnScroll();
});

// Project cards interactivity
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-10px) scale(1.02)";
    this.style.boxShadow = "0 25px 50px rgba(255, 140, 66, 0.2)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
    this.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.2)";
  });
});

// Typing effect
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

document.addEventListener("DOMContentLoaded", function () {
  const heroTitle = document.querySelector(".hero-text h1");
  if (heroTitle) {
    setTimeout(() => {
      typeWriter(heroTitle, "Palaash Dwivedi", 150);
    }, 500);
  }
});

// Particle effect background
function createParticles() {
  const particlesContainer = document.createElement("div");
  particlesContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `;

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(244, 91, 105, 0.2);
      border-radius: 50%;
      animation: float ${5 + Math.random() * 10}s ease-in-out infinite;
    `;

    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 5 + "s";

    particlesContainer.appendChild(particle);
  }

  document.body.appendChild(particlesContainer);
}

createParticles();

// Smooth section transitions
function smoothSectionTransition(sectionName) {
  const currentSection = document.querySelector(".page-section.active");
  const targetSection = document.getElementById(sectionName);

  if (currentSection) {
    currentSection.style.opacity = "0";
    currentSection.style.transform = "translateY(20px)";

    setTimeout(() => {
      showSection(sectionName);
      targetSection.style.opacity = "0";
      targetSection.style.transform = "translateY(20px)";

      setTimeout(() => {
        targetSection.style.opacity = "1";
        targetSection.style.transform = "translateY(0)";
      }, 50);
    }, 150);
  } else {
    showSection(sectionName);
  }
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const sectionName = this.getAttribute("onclick").match(/'([^']+)'/)[1];
    smoothSectionTransition(sectionName);
  });
});

// Intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.8s ease forwards";
    }
  });
}, observerOptions);

document.addEventListener("DOMContentLoaded", function () {
  const elementsToAnimate = document.querySelectorAll(
    ".project-card, .skill-category, .contact-item, .about-text, .hero-visual, .education-item, .experience-item"
  );
  elementsToAnimate.forEach((el) => {
    observer.observe(el);
  });
});

// Loading screen
function createLoadingScreen() {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--dark-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    flex-direction: column;
  `;

  loader.innerHTML = `
    <div style="width: 50px; height: 50px; border: 3px solid rgba(49, 61, 93, 0.3); border-top: 3px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <p style="margin-top: 1rem; color: var(--text-light);">Loading Portfolio...</p>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  document.body.appendChild(loader);

  window.addEventListener("load", function () {
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.remove();
      }, 300);
    }, 500);
  });
}

createLoadingScreen();

// Keyboard navigation
document.addEventListener("keydown", function (e) {
  const sections = [
    "home",
    "about",
    "education",
    "experience",
    "projects",
    "skills",
    "certificates",
    "contact",
  ];
  const currentSection = document.querySelector(".page-section.active").id;
  const currentIndex = sections.indexOf(currentSection);

  if (e.key === "ArrowRight" && currentIndex < sections.length - 1) {
    smoothSectionTransition(sections[currentIndex + 1]);
  } else if (e.key === "ArrowLeft" && currentIndex > 0) {
    smoothSectionTransition(sections[currentIndex - 1]);
  }
});

// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle");
let isDark = true;

themeToggle.addEventListener("click", function () {
  if (isDark) {
    document.documentElement.style.setProperty("--dark-bg", "#f8fafc");
    document.documentElement.style.setProperty("--darker-bg", "#e2e8f0");
    document.documentElement.style.setProperty("--text-light", "#1e293b");
    document.documentElement.style.setProperty("--text-gray", "#475569");
    document.documentElement.style.setProperty("--card-bg", "#ffffff");
    this.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.documentElement.style.setProperty("--dark-bg", "#0f1419");
    document.documentElement.style.setProperty("--darker-bg", "#020304");
    document.documentElement.style.setProperty("--text-light", "#f8fafc");
    document.documentElement.style.setProperty("--text-gray", "#94a3b8");
    document.documentElement.style.setProperty("--card-bg", "#1a2332");
    this.innerHTML = '<i class="fas fa-moon"></i>';
  }
  isDark = !isDark;
});

// Skill toggle functionality
function toggleSkill(element) {
  element.classList.toggle("open");
  const isOpen = element.classList.contains("open");
  element.setAttribute("aria-expanded", isOpen);
}

document.addEventListener("DOMContentLoaded", () => {
  const skillItems = document.querySelectorAll(".skill-item");
  skillItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("open");
      const isOpen = item.classList.contains("open");
      item.setAttribute("aria-expanded", isOpen);
    });
  });
});
