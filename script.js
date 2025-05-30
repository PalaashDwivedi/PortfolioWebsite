// Certificate modal functionality
function openModal(certId) {
  const modal = document.getElementById("certificateModal");
  const modalImg = document.getElementById("modalImage");
  const certCard = document.querySelector(`[onclick="openModal('${certId}')"]`);
  const certImg = certCard.querySelector(".certificate-image");

  modal.classList.add("show");
  modalImg.src = certImg.src;
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeModal() {
  const modal = document.getElementById("certificateModal");
  modal.classList.remove("show");
  document.body.style.overflow = "auto"; // Re-enable scrolling
}

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Navigation functionality
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll(".page-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // Show selected section
  document.getElementById(sectionName).classList.add("active");

  // Update navigation links
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // Find and activate the correct nav link
  const activeLink = document.querySelector(
    `[onclick="showSection('${sectionName}')"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Scroll to top
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
  const navLinks = document.querySelector(".nav-links");
  navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
}

// Smooth animations on scroll (for single page sections)
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

// Initialize animations on page load
document.addEventListener("DOMContentLoaded", function () {
  animateOnScroll();
});

// Add some interactivity to project cards
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-10px) scale(1.02)";
    this.style.boxShadow = "0 25px 50px rgba(99, 102, 241, 0.2)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
    this.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.2)";
  });
});

// Add typing effect to hero title
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

// Initialize typing effect when home section is active
document.addEventListener("DOMContentLoaded", function () {
  const heroTitle = document.querySelector(".hero-text h1");
  if (heroTitle) {
    setTimeout(() => {
      typeWriter(heroTitle, "Palaash Dwivedi", 150);
    }, 500);
  }
});

// Add particle effect background
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
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 50%;
                    animation: float ${
                      5 + Math.random() * 10
                    }s ease-in-out infinite;
                `;

    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 5 + "s";

    particlesContainer.appendChild(particle);
  }

  document.body.appendChild(particlesContainer);
}

// Initialize particles
createParticles();

// Add smooth transitions between sections
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

// Update navigation to use smooth transitions
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const sectionName = this.getAttribute("onclick").match(/'([^']+)'/)[1];
    smoothSectionTransition(sectionName);
  });
});

// Add intersection observer for animations
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

// Observe elements for animation
document.addEventListener("DOMContentLoaded", function () {
  const elementsToAnimate = document.querySelectorAll(
    ".project-card, .skill-category, .contact-item, .about-text, .hero-visual"
  );
  elementsToAnimate.forEach((el) => {
    observer.observe(el);
  });
});

// Add loading screen
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
                <div style="width: 50px; height: 50px; border: 3px solid rgba(99, 102, 241, 0.3); border-top: 3px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: var(--text-light);">Loading Portfolio...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;

  document.body.appendChild(loader);

  // Remove loader after page loads
  window.addEventListener("load", function () {
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.remove();
      }, 300);
    }, 500);
  });
}

// Initialize loading screen
createLoadingScreen();

// Add keyboard navigation
document.addEventListener("keydown", function (e) {
  const sections = ["home", "about", "projects", "skills", "contact"];
  const currentSection = document.querySelector(".page-section.active").id;
  const currentIndex = sections.indexOf(currentSection);

  if (e.key === "ArrowRight" && currentIndex < sections.length - 1) {
    smoothSectionTransition(sections[currentIndex + 1]);
  } else if (e.key === "ArrowLeft" && currentIndex > 0) {
    smoothSectionTransition(sections[currentIndex - 1]);
  }
});

// Add theme toggle functionality (bonus feature)
function addThemeToggle() {
  const themeToggle = document.createElement("button");
  themeToggle.innerHTML = "🌙";
  themeToggle.style.cssText = `
                position: fixed;
                top: 50%;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: var(--card-bg);
                color: var(--text-light);
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 1000;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            `;

  let isDark = true;

  themeToggle.addEventListener("click", function () {
    if (isDark) {
      // Light theme
      document.documentElement.style.setProperty("--dark-bg", "#f8fafc");
      document.documentElement.style.setProperty("--darker-bg", "#e2e8f0");
      document.documentElement.style.setProperty("--text-light", "#1e293b");
      document.documentElement.style.setProperty("--text-gray", "#475569");
      document.documentElement.style.setProperty("--card-bg", "#ffffff");
      this.innerHTML = "☀️";
    } else {
      // Dark theme
      document.documentElement.style.setProperty("--dark-bg", "#0f172a");
      document.documentElement.style.setProperty("--darker-bg", "#020617");
      document.documentElement.style.setProperty("--text-light", "#f8fafc");
      document.documentElement.style.setProperty("--text-gray", "#94a3b8");
      document.documentElement.style.setProperty("--card-bg", "#1e293b");
      this.innerHTML = "🌙";
    }
    isDark = !isDark;
  });

  document.body.appendChild(themeToggle);
}

// Initialize theme toggle
addThemeToggle();

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
