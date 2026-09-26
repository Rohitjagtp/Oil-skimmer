/* ==========================================================================
   MAIN.JS — navigation, mobile menu, active-link highlighting
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('mobile-open');
    });

    // Close mobile menu after clicking a link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // Highlight nav link for the section currently in view (index page only)
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  // Navbar background intensifies after scrolling
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 12 ? '0 10px 30px rgba(0,0,0,0.35)' : 'none';
    }, { passive: true });
  }
});
