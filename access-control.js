/* VUF — giriş erişim kontrolü ve tarayıcı tanımlayıcısı */
(function () {
  'use strict';
  const KEY = 'vuf_device_identifier';
  let deviceId = localStorage.getItem(KEY);
  if (!deviceId) {
    deviceId = window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, deviceId);
  }
  window.VUF_ACCESS_HEADERS = { 'X-VUF-Device': deviceId };
  window.VUF_ACCESS_CHECK = async () => {
    try {
      const response = await fetch('/api/access/check', { method: 'POST', headers: { 'Content-Type':'application/json', ...window.VUF_ACCESS_HEADERS }, body:'{}' });
      const result = await response.json();
      return { allowed: response.ok && result.allowed !== false, message: result.message || 'Bu cihazın erişimi engellenmiştir.' };
    } catch {
      return { allowed: true, message: '' };
    }
  };
})();
