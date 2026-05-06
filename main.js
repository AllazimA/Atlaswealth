/* ============================================================
   DXBVIP — Main JS
   ============================================================ */

// ── Preloader ──────────────────────────────────────────────
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) {
    setTimeout(() => pre.classList.add('hidden'), 1200);
  }
});

// ── Navbar scroll ──────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile menu ────────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu?.classList.toggle('open');
  document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
});
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Scroll reveal ──────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger').forEach(el => {
  observer.observe(el);
});

// ── Counter animation ──────────────────────────────────────
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('[data-count]');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const suffix = counter.dataset.suffix || '';
        animateCounter(counter, target, suffix);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ── AI Chat mock ───────────────────────────────────────────
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');

const responses = {
  default: "I'd be happy to arrange that for you. Could you share a bit more detail — preferred dates, location, and any specific requirements? Your dedicated concierge will follow up within minutes.",
  jet: "Excellent choice. For private jet charter, we partner with the finest operators across UAE, Europe, and beyond. Please share your departure city, destination, travel dates, and number of passengers — we'll prepare options immediately.",
  yacht: "Of course. We have exclusive access to superyachts from 40ft to 200ft across Dubai Marina and the Palm. Would you like a sunset cruise, full-day charter, or an extended itinerary? Our team will curate a bespoke experience.",
  restaurant: "We maintain relationships with every top-tier venue in Dubai. Simply share your preferred date, time, party size, and any dietary requirements — we'll secure your table, often at sold-out restaurants.",
  membership: "Our Black membership provides 24/7 personal concierge access with zero limitations. It's bespoke — pricing is tailored to your lifestyle. Would you like a private consultation to discuss what that looks like for you?",
};

function getResponse(text) {
  const t = text.toLowerCase();
  if (t.includes('jet') || t.includes('flight') || t.includes('aviation')) return responses.jet;
  if (t.includes('yacht') || t.includes('boat') || t.includes('marina')) return responses.yacht;
  if (t.includes('restaurant') || t.includes('dinner') || t.includes('dining')) return responses.restaurant;
  if (t.includes('member') || t.includes('black') || t.includes('join')) return responses.membership;
  return responses.default;
}

function addMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.className = `chat-msg${isUser ? ' user' : ''}`;
  msg.innerHTML = `
    <div class="msg-avatar ${isUser ? 'user-av' : 'agent'}">${isUser ? 'You' : 'DV'}</div>
    <div class="msg-bubble">${text}</div>
  `;
  chatMessages?.insertBefore(msg, typingIndicator);
  chatMessages?.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

function handleSend() {
  const text = chatInput?.value.trim();
  if (!text) return;
  addMessage(text, true);
  chatInput.value = '';
  typingIndicator?.classList.add('active');
  chatMessages?.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  setTimeout(() => {
    typingIndicator?.classList.remove('active');
    addMessage(getResponse(text));
  }, 1800 + Math.random() * 800);
}

chatSend?.addEventListener('click', handleSend);
chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

// ── Contact form ───────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Request Received';
  btn.style.background = '#4caf50';
  btn.style.color = '#fff';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
    contactForm.reset();
  }, 3500);
});

// ── Smooth anchor scroll ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── WhatsApp float ─────────────────────────────────────────
document.querySelector('.whatsapp-btn')?.addEventListener('click', () => {
  window.open('https://wa.me/971500000000?text=Hello%2C%20I%27d%20like%20to%20inquire%20about%20DXBVIP%20concierge%20services.', '_blank');
});
