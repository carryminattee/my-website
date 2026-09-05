/* Shared site script - multipage safe */
(function () {
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  var toggle = document.getElementById('navToggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('mobile-open'); });
    });
  }

  // Active nav highlighting
  try {
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
    });
  } catch (e) {}

  // Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () { e.target.classList.add('visible'); }, i * 55);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.07 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // Accordion (experience page)
  document.querySelectorAll('.exp-card-header').forEach(function (header) {
    var card = header.closest('.exp-card');
    var toggleCard = function () {
      var isOpen = card.classList.contains('open');
      card.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    };
    header.addEventListener('click', toggleCard);
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(); }
    });
  });

  // Contact form (contact page only)
  var form = document.getElementById('contactForm');
  if (!form) return;
  var submitBtn = document.getElementById('submitBtn');
  var btnText = document.getElementById('btnText');
  var btnArrow = document.getElementById('btnArrow');
  var btnSpinner = document.getElementById('btnSpinner');

  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function setFieldError(inputId, errorId, show) {
    var inp = document.getElementById(inputId);
    var err = document.getElementById(errorId);
    if (!inp || !err) return !show;
    if (show) { inp.classList.add('error'); err.classList.add('show'); }
    else { inp.classList.remove('error'); err.classList.remove('show'); }
    return !show;
  }
  function validateForm() {
    var name = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();
    var nameOk = setFieldError('fullName', 'err-name', !name);
    var emailOk = setFieldError('email', 'err-email', !validateEmail(email));
    var messageOk = setFieldError('message', 'err-message', !message);
    return nameOk && emailOk && messageOk;
  }
  ['fullName', 'email', 'message'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      var errMap = { fullName: 'err-name', email: 'err-email', message: 'err-message' };
      el.classList.remove('error');
      var err = document.getElementById(errMap[id]);
      if (err) err.classList.remove('show');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    btnArrow.style.display = 'none';
    btnSpinner.style.display = 'block';

    var payload = {
      name: document.getElementById('fullName').value.trim(),
      company: document.getElementById('company').value.trim(),
      designation: document.getElementById('designation').value.trim(),
      city: document.getElementById('city').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    fetch('https://contact-form-handler.carryminattee.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) { return res.json().then(function (json) { return { res: res, json: json }; }); })
      .then(function (out) {
        if (out.res.ok && out.json.success) {
          form.style.display = 'none';
          document.getElementById('formSuccess').classList.add('show');
        } else { throw new Error(out.json.error || 'Submission failed'); }
      })
      .catch(function (err) {
        console.error(err);
        btnText.textContent = 'Send message';
        btnArrow.style.display = 'block';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
        alert(err.message || 'Network error. Please email directly at ishan.chopra.27@gmail.com');
      });
  });
})();
