(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  const button = document.getElementById('contact-submit');
  if (!form || !status || !button) return;

  const endpoint = 'https://formsubmit.co/ajax/bhavish777bn@gmail.com';

  function clearVisibleFields() {
    form.querySelectorAll('input:not([type="hidden"]), textarea').forEach((field) => {
      field.value = '';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
    form.reset();
    form.querySelectorAll('input:not([type="hidden"]), textarea').forEach((field) => {
      field.value = '';
    });
  }

  form.addEventListener('submit', async (event) => {
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }

    // Direct file:// submissions use the native POST form action.
    if (window.location.protocol === 'file:') {
      status.textContent = 'Sending through FormSubmit…';
      button.disabled = true;
      return;
    }

    event.preventDefault();
    if (!['http:', 'https:'].includes(window.location.protocol)) {
      status.textContent = 'Open this page from a website or local web server to send messages.';
      return;
    }

    const fields = new FormData(form);
    const payload = {
      name: String(fields.get('name') || '').trim(),
      email: String(fields.get('email') || '').trim(),
      _replyto: String(fields.get('email') || '').trim(),
      _subject: `Portfolio message: ${String(fields.get('subject') || '').trim()}`,
      message: String(fields.get('message') || '').trim(),
      _template: 'table',
      _captcha: 'false',
      _url: window.location.href
    };

    button.disabled = true;
    status.textContent = 'Sending your message…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      const providerConfirmed = result.success === true || result.success === 'true';
      const providerRejected = result.success === false || result.success === 'false';
      const acceptedMessage = /success|sent|accept|activat/i.test(String(result.message || ''));
      if (!response.ok || providerRejected || (!providerConfirmed && !acceptedMessage)) {
        throw new Error(result.message || 'FormSubmit did not confirm the submission. Please try again or contact me through GitHub.');
      }

      const providerMessage = String(result.message || '').toLowerCase();
      clearVisibleFields();
      if (/confirm|activat/.test(providerMessage)) {
        status.textContent = 'FormSubmit is holding this message until the form is activated. Check your inbox and Spam folder for the activation email.';
      } else {
        status.textContent = 'Message submitted. Thanks for reaching out about a project—I’ll review it soon.';
      }
    } catch (error) {
      status.textContent = `${error.message || 'Your message could not be sent.'} You can also contact me through GitHub.`;
    } finally {
      button.disabled = false;
    }
  });
})();
