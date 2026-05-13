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

  // --- Header logo: smooth scroll to top (JS reinforces native #top + CSS scroll-behavior) ---
  const brandHome = $('.brand[href="#top"]');
  if (brandHome) {
    brandHome.addEventListener('click', (e) => {
      const reduce =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const base = `${window.location.pathname}${window.location.search}`;
      if (window.location.hash) {
        history.replaceState(null, '', base);
      }
    });
  }

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
  const revealTargets = $$('.dont-card, .process-card, .results-carousel, .horizon-card, .contact-form, .hero__slogan');
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

  // --- Contact form: Formspree (same form action URL) ---
  const form = $('#contact-form');
  if (form) {
    const status = $('.contact-form__status', form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const maxBytes = 25 * 1024 * 1024;
    const endpoint = form.getAttribute('action') || '';

    const setStatus = (msg, kind) => {
      if (!status) return;
      status.textContent = msg || '';
      status.classList.remove('is-success', 'is-error');
      if (kind) status.classList.add(`is-${kind}`);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('');

      $$('.field', form).forEach((f) => f.classList.remove('field--error'));

      const name = (form.elements.namedItem('name')?.value ?? '').trim();
      const email = (form.elements.namedItem('email')?.value ?? '').trim();
      const fileInput = form.querySelector('[name="valuation_report"]');
      const file = fileInput?.files?.[0] ?? null;

      const errors = [];
      if (!name) errors.push('name');
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('email');

      if (endpoint.includes('REPLACE_ME')) {
        setStatus(
          'Form is not configured yet — replace REPLACE_ME in index.html with your Formspree form ID.',
          'error',
        );
        return;
      }

      if (file && file.size > maxBytes) {
        fileInput.closest('.field')?.classList.add('field--error');
        setStatus('That file is too large. Formspree allows up to 25 MB per file on supported plans.', 'error');
        return;
      }

      if (errors.length) {
        errors.forEach((fieldName) => {
          const input = form.querySelector(`[name="${fieldName}"]`);
          if (input) input.closest('.field')?.classList.add('field--error');
        });
        setStatus('Please fill out the required fields.', 'error');
        return;
      }

      const fd = new FormData(form);
      fd.append('_subject', `Free case review — ${name}`);
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' },
        });

        let payload = {};
        try {
          payload = await res.json();
        } catch (_) {
          /* non-JSON */
        }

        if (res.ok) {
          setStatus('Thanks — your message was sent. We will be in touch soon.', 'success');
          form.reset();
          return;
        }

        const formErrors = payload.errors
          ? Object.values(payload.errors).flat().filter(Boolean).join(' ')
          : '';
        const msg =
          payload.error ||
          formErrors ||
          'Something went wrong. Please try again or email help@writeoffwhiz.ca.';
        setStatus(msg, 'error');
      } catch (err) {
        setStatus(
          'Could not reach Formspree. Check your connection or try again later.',
          'error',
        );
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // --- Results: reviews carousel (manual advance only; no autoplay) ---
  const resultsCarousel = $('#results-carousel');
  const resultsTrack = $('#results-carousel-track');
  if (resultsCarousel && resultsTrack) {
    const slides = $$('.results-carousel__slide', resultsTrack);
    const slideCount = slides.length;
    if (slideCount) {
      resultsTrack.style.width = `${slideCount * 100}%`;
      slides.forEach((slide) => {
        slide.style.flex = `0 0 ${100 / slideCount}%`;
      });

      let index = 0;

      const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        resultsCarousel.classList.add('is-reduced-motion');
      }

      const goTo = (nextIndex) => {
        index = ((nextIndex % slideCount) + slideCount) % slideCount;
        const pct = (100 / slideCount) * index;
        resultsTrack.style.transform = `translate3d(-${pct}%, 0, 0)`;
      };

      const step = (dir) => {
        goTo(index + dir);
      };

      $('.results-carousel__arrow--prev', resultsCarousel)?.addEventListener(
        'click',
        () => step(-1),
      );
      $('.results-carousel__arrow--next', resultsCarousel)?.addEventListener(
        'click',
        () => step(1),
      );

      goTo(0);
    }
  }
})();
