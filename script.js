// Write Off Whiz — small interactivity layer.
// No frameworks; just enough JS to make the static site feel polished.

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // --- Year in footer ---
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Sticky nav shadow + active link ---
  const header = $('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
  const toggle = $('.nav__toggle');
  const menu = $('#primary-nav');
  if (toggle && menu) {
    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };
    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
    };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });
    // Close when a link is clicked
    $$('a', menu).forEach(a => a.addEventListener('click', close));
    // Close on resize past breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) close();
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // --- Reveal-on-scroll (subtle) ---
  const revealTargets = $$('.dont-card, .process-card, .result-card, .horizon-card, .contact-form, .hero__slogan');
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  }

  // --- Contact form: validate + submit via mailto fallback ---
  // When a real backend (Formspree, Netlify Forms, Web3Forms, etc.) is wired up,
  // replace the body of `submit` below with a fetch() to that endpoint.
  const form = $('#contact-form');
  if (form) {
    const status = $('.contact-form__status', form);

    const setStatus = (msg, kind) => {
      if (!status) return;
      status.textContent = msg || '';
      status.classList.remove('is-success', 'is-error');
      if (kind) status.classList.add(`is-${kind}`);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      setStatus('');

      // Clear previous field errors
      $$('.field', form).forEach(f => f.classList.remove('field--error'));

      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        claim_type: form.claim_type.value,
        vehicle: form.vehicle.value.trim(),
        message: form.message.value.trim(),
      };

      const errors = [];
      if (!data.name) { errors.push('name'); }
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) { errors.push('email'); }
      if (!data.claim_type) { errors.push('claim_type'); }

      if (errors.length) {
        errors.forEach(name => {
          const input = form.querySelector(`[name="${name}"]`);
          if (input) input.closest('.field')?.classList.add('field--error');
        });
        setStatus('Please fill out the required fields.', 'error');
        return;
      }

      // Mailto fallback — opens user's email client with prefilled message.
      const subject = `Free case review — ${data.name}${data.vehicle ? ' / ' + data.vehicle : ''}`;
      const body =
`Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || '—'}
Claim type: ${data.claim_type}
Vehicle: ${data.vehicle || '—'}

${data.message || ''}`;
      const href = `mailto:hello@writeoffwhiz.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      setStatus('Opening your email app… If nothing happens, email hello@writeoffwhiz.com directly.', 'success');
    });
  }
})();
