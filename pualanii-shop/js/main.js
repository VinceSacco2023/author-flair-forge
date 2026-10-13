(function () {
  'use strict';

  // Keep the footer year current without editing HTML each January.
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var form = document.getElementById('waitlist-form');
  if (!form) return;

  var fields = {
    name: form.elements.namedItem('name'),
    email: form.elements.namedItem('email'),
    consent: form.elements.namedItem('consent')
  };
  var honeypot = form.elements.namedItem('website');
  var status = document.getElementById('wl-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  var messages = {
    name: 'Please enter your name.',
    emailMissing: 'Please enter your email address.',
    emailInvalid: 'That email doesn’t look right. Check for a typo, like name@example.com.',
    consent: 'Please tick the box so we can email you.',
    success: 'You’re on the list. Thank you! Watch your inbox for news about stays and new products.',
    failure: 'Something went wrong and you weren’t added. Please try again in a minute.',
    notConnected: 'Sign-ups aren’t switched on yet. Please check back soon.'
  };

  function setError(input, text) {
    var err = document.getElementById(input.id + '-error');
    if (text) {
      input.setAttribute('aria-invalid', 'true');
      err.textContent = text;
      err.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      err.textContent = '';
      err.hidden = true;
    }
  }

  function validateField(key) {
    var input = fields[key];
    var text = '';
    if (key === 'name' && !input.value.trim()) text = messages.name;
    if (key === 'email') {
      if (!input.value.trim()) text = messages.emailMissing;
      else if (input.validity.typeMismatch) text = messages.emailInvalid;
    }
    if (key === 'consent' && !input.checked) text = messages.consent;
    setError(input, text);
    return !text;
  }

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  // Once a field shows an error, re-check it as the person types so the message clears
  // as soon as it's fixed. Not on blur: removing a message on blur shifts the layout
  // mid-click and makes the next click (checkbox, submit) miss its target.
  Object.keys(fields).forEach(function (key) {
    var evt = key === 'consent' ? 'change' : 'input';
    fields[key].addEventListener(evt, function () {
      if (fields[key].hasAttribute('aria-invalid')) validateField(key);
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    setStatus('', '');

    var firstInvalid = null;
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key) && !firstInvalid) firstInvalid = fields[key];
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Bots fill the hidden field. Show the normal success message and send nothing.
    if (honeypot && honeypot.value) {
      form.reset();
      setStatus(messages.success, 'success');
      return;
    }

    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      setStatus(messages.notConnected, 'error');
      return;
    }

    submitBtn.disabled = true;
    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        setStatus(messages.success, 'success');
      })
      .catch(function () {
        setStatus(messages.failure, 'error');
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
})();
