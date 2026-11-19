(() => {
  const recipient = document.querySelector('#recipient');
  const sender = document.querySelector('#sender');
  const lines = [...document.querySelectorAll('.greeting-line')];
  const templates = lines.map(line => line.textContent.trim());
  let values = {to: '', from: ''};
  function cardURL(edit = false) {
    const url = new URL(location.href); url.search = ''; url.hash = '';
    if (edit) url.searchParams.set('edit', '1');
    ['to', 'from'].forEach(key => { if (values[key]) url.searchParams.set(key, values[key]); });
    return url.href;
  }
  // Names are plain text. Strip controls/bidi overrides and cap their length.
  const clean = value => Array.from(String(value || '').normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g, '')
    .replace(/\s+/g, ' ').trim()).slice(0, 64).join('');
  function messages() {
    return templates.map(text => text.replaceAll('Thầy Cô', values.to || 'Thầy Cô'));
  }
  function update(syncURL = false) {
    values = {to: clean(recipient.value), from: clean(sender.value)};
    const to = values.to || 'Thầy Cô';
    document.querySelector('.insert>span').textContent = `Gửi ${to},`;
    document.querySelector('.envelope-caption').textContent = values.to ? `Kính gửi ${values.to}` : 'Gửi người gieo những ước mơ';
    document.querySelector('.subtitle').textContent = `Một lá thư nhỏ gửi đến ${to} kính yêu...`;
    document.querySelector('#envelope').setAttribute('aria-label', `Mở phong thư gửi ${to}`);
    messages().forEach((text, i) => { lines[i].textContent = text; });
    const signature = document.querySelector('#sender-signature');
    signature.textContent = values.from ? `Người gửi: ${values.from}` : '';
    signature.hidden = !values.from;
    document.querySelector('#create-card').href = cardURL(true);
    document.querySelector('#preview-card').href = cardURL();
    document.querySelector('#back-card').href = cardURL();
    if (syncURL && /^https?:$/.test(location.protocol)) {
      const url = new URL(location.href);
      ['to', 'from'].forEach(key => values[key] ? url.searchParams.set(key, values[key]) : url.searchParams.delete(key));
      try { history.replaceState(null, '', url); } catch { /* Preview hosts may restrict history. */ }
    }
  }
  const params = new URLSearchParams(location.search);
  if (params.get('edit') === '1') {
    document.querySelector('#intro').hidden = true;
    document.querySelector('#card-editor').hidden = false;
    document.querySelector('#editor-fields').append(document.querySelector('#personalize-form'));
    document.querySelector('#create-card').setAttribute('aria-current', 'page');
    document.title = 'Tạo thiệp của bạn · Mùa tri ân 20/11';
  }
  recipient.value = clean(params.get('to')); sender.value = clean(params.get('from'));
  [recipient, sender].forEach(input => {
    input.addEventListener('input', () => update(true));
    input.addEventListener('change', () => { input.value = clean(input.value); update(true); });
  });
  document.querySelector('#personalize-form').addEventListener('submit', event => event.preventDefault());
  window.Personalization = {
    messages, get values() { return {...values}; },
    shareURL() {
      const local = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
      const url = new URL(local ? 'https://nghi2k10.github.io/teachers-day-3d/' : location.href);
      url.hash = ''; url.search = '';
      ['to', 'from'].forEach(key => { if (values[key]) url.searchParams.set(key, values[key]); });
      return url.href;
    }
  };
  update();
})();
