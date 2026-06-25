
const body = document.body;
const cursorGlow = document.querySelector('.cursor-glow');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const revealEls = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('.counter');
const proofButtons = document.querySelectorAll('.open-proof');
const modal = document.getElementById('proofModal');
const modalImage = document.getElementById('proofImage');
const modalTitle = document.getElementById('proofTitle');
const modalDescription = document.getElementById('proofDescription');
const modalClose = document.querySelector('.proof-modal__close');
const modalOverlay = document.querySelector('.proof-modal__overlay');

document.addEventListener('mousemove', (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealEls.forEach(el => revealObserver.observe(el));

// counters
const animateCounter = (el) => {
  const target = parseFloat(el.dataset.target);
  const decimals = String(target).includes('.') ? String(target).split('.')[1].length : 0;
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = decimals ? current.toFixed(decimals) : Math.floor(current);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.7 });

counters.forEach(counter => counterObserver.observe(counter));

// active nav scrollspy
const sectionIds = ['about', 'journey', 'projects', 'proof', 'contact'];
const sectionEls = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.45 });

sectionEls.forEach(section => navObserver.observe(section));

// tilt cards
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// proof modal
const openProof = (key) => {
  const data = window.PROOF_DATA?.[key];
  if (!data) return;
  modalImage.src = data.image;
  modalImage.alt = data.alt || data.title;
  modalTitle.textContent = data.title;
  modalDescription.textContent = data.description;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  body.style.overflow = 'hidden';
};

const closeProof = () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  body.style.overflow = '';
};

proofButtons.forEach(btn => {
  btn.addEventListener('click', () => openProof(btn.dataset.target));
});

modalClose?.addEventListener('click', closeProof);
modalOverlay?.addEventListener('click', closeProof);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeProof();
});


// close mobile nav when clicking outside
document.addEventListener('click', (e) => {
  if (!siteNav || !navToggle) return;
  if (window.innerWidth > 820) return;
  const clickedInside = siteNav.contains(e.target) || navToggle.contains(e.target);
  if (!clickedInside && siteNav.classList.contains('open')) {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});


// loader
window.addEventListener('load', () => {
  const loader = document.getElementById('siteLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 450);
  }
});

// proof filters
const filterButtons = document.querySelectorAll('.filter-btn');
const proofCards = document.querySelectorAll('.proof-card[data-filter-group]');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    proofCards.forEach(card => {
      const group = card.dataset.filterGroup;
      const show = filter === 'all' || group === filter;
      card.classList.toggle('is-hidden', !show);
    });
  });
});
