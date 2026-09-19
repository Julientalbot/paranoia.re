/** Form events contain route, language and offer only. No field values. */
export function bindContactForms() {
  document.querySelectorAll('form.xo-form-contact').forEach(form => {
    if (form.dataset.bound) return;
    form.dataset.bound = '1';
    const fr = form.dataset.lang === 'fr';
    const button = form.querySelector('button[type=submit]');
    const status = form.querySelector('[role=status]');
    const originalLabel = button.textContent;
    button.disabled = false;
    const fields = ['email', 'champ1', 'champ2', 'champ3'].map(name => form.elements.namedItem(name));
    const [email, message, detail, constraint] = fields;
    const track = name => window.dispatchEvent(new CustomEvent('site:event', { detail: { name, props: { page: form.dataset.page, lang: form.dataset.lang, offer: form.dataset.variant } } }));
    form.addEventListener('input', () => track('contact_start'), { once: true });
    const fieldError = (field, text) => {
      const error = form.querySelector(`[data-error-for="${field.name}"]`);
      field.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (error) { error.hidden = !text; error.textContent = text; }
    };
    [email, message].forEach(field => field.addEventListener('input', () => fieldError(field, '')));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled || form.classList.contains('is-success')) return;
      status.hidden = true;
      const emailInvalid = !email.value.trim() || !email.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      const messageInvalid = !message.value.trim();
      fieldError(email, emailInvalid ? (fr ? 'Indiquez une adresse email valide.' : 'Enter a valid email address.') : '');
      fieldError(message, messageInvalid ? (fr ? 'Décrivez votre besoin en quelques mots.' : 'Describe what you need.') : '');
      if (emailInvalid || messageInvalid) { (messageInvalid ? message : email).focus(); track('contact_invalid'); return; }
      track('contact_attempt');
      button.disabled = true; button.textContent = fr ? 'Envoi…' : 'Sending…';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch('/api/contact', {
          method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
          body:JSON.stringify({variant:form.dataset.variant,email:email.value.trim(),fields:{champ1:message.value.trim(),champ2:detail.value.trim(),champ3:constraint.value.trim()},page:form.dataset.page,website:form.elements.namedItem('website').value}),
        });
        const data = await response.json();
        if (!response.ok || data.ok !== true) throw new Error('send_failed');
        form.classList.add('is-success'); status.dataset.state = 'success';
        status.textContent = fr ? 'Votre message a été transmis. Merci, nous vous répondrons par email.' : 'Your message has been sent. Thank you; we will reply by email.';
        track('contact_success');
      } catch {
        status.dataset.state = 'error';
        status.textContent = fr ? 'L’envoi n’a pas pu être confirmé. Votre saisie est conservée. Réessayez ou utilisez l’adresse email ci-dessous.' : 'Sending could not be confirmed. Your text is preserved. Try again or use the email address below.';
        track('contact_error');
      } finally {
        clearTimeout(timer); status.hidden = false; status.focus();
        if (!form.classList.contains('is-success')) { button.disabled=false;button.textContent=originalLabel; }
      }
    });
  });
}
