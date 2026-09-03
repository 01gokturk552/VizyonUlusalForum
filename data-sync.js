/* VUF — cihazlar arası içerik eşitleme
   Sunucu aynı alan adında çalışıyorsa içerik, başvuru ve panel verileri
   otomatik olarak sunucudan okunur ve yapılan değişiklikler kaydedilir. */
(function () {
  'use strict';

  const KEYS = new Set([
    'vuf_komisyonlar', 'vuf_ekip', 'vuf_sponsorlar', 'vuf_program',
    'vuf_istatistikler', 'vuf_ayarlar', 'vuf_basvuru_ayarlar',
    'vuf_form_builder', 'vuf_delegeler', 'vuf_delegasyonlar',
    'vuf_content_version', 'vuf_team_roles_version'
  ]);
  const nativeSetItem = Storage.prototype.setItem;
  let hydrating = false;

  function request(method, url, body) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(body ? JSON.stringify(body) : null);
      return xhr.status >= 200 && xhr.status < 300 ? xhr.responseText : null;
    } catch { return null; }
  }

  // Önce sunucudaki son veriyi alır; böylece telefon ve bilgisayar aynı veriyi görür.
  const response = request('GET', '/api/site-data');
  if (response) {
    try {
      const payload = JSON.parse(response);
      if (payload && payload.data) {
        hydrating = true;
        Object.entries(payload.data).forEach(([key, value]) => {
          if (KEYS.has(key)) nativeSetItem.call(localStorage, key, JSON.stringify(value));
        });
        hydrating = false;
        window.VUF_REMOTE_SYNC = true;
      }
    } catch { hydrating = false; }
  }

  Storage.prototype.setItem = function (key, value) {
    nativeSetItem.call(this, key, value);
    if (hydrating || !KEYS.has(key) || location.protocol === 'file:') return;
    try {
      fetch('/api/site-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: JSON.parse(value) }),
        keepalive: true
      }).catch(() => {});
    } catch {}
  };
})();
