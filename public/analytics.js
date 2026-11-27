(() => {
  'use strict';
  const config = document.currentScript?.dataset;
  if (!config || !/^G-[A-Z0-9]+$/.test(config.ga || '')) return;
  const id = config.ga;
  if (id !== 'G-C22VWBD0F5') return;
  const container = 'GTM-5LCTJ28R';
  let origin;
  let pages;
  let patterns;
  try {
    origin = new URL(config.origin).origin;
    pages = JSON.parse(config.pages);
    patterns = JSON.parse(config.patterns || '[]').map(rule => ({ pattern: new RegExp(rule.pattern), title: rule.title }));
  } catch { return; }
  const pageTitle = () => pages[location.pathname] || patterns.find(rule => rule.pattern.test(location.pathname))?.title;
  if (location.origin !== origin || !pageTitle()) return;
  const key = config.consent || 'website-analytics-consent-v1';
  const lifetime = 90 * 86400000;
  let loaded = false;
  let lastPage = '';
  let timer;
  let banner;
  const disabled = () => navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  function choice() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value.allowed === 'boolean' && Number.isFinite(value.until)
        && value.until > Date.now() ? value : null;
    } catch { return null; }
  }
  function safeLocation() {
    return origin + (Object.hasOwn(pages, location.pathname) ? location.pathname : '/');
  }
  function metric(name) {
    if (!loaded || !choice()?.allowed || disabled() || !pageTitle() || location.origin !== origin) return;
    window.gtag('event', name, { ...context(), send_to: id });
  }
  function context() {
    let referrer = '';
    try {
      const url = new URL(document.referrer);
      if (!['www.google.com','www.google.co.jp','www.bing.com','search.yahoo.co.jp','duckduckgo.com','chatgpt.com','perplexity.ai','www.perplexity.ai'].includes(url.hostname)) return { page_location: safeLocation(), page_title: pageTitle(), page_referrer: '' };
      if (url.protocol === 'https:' && !url.username && !url.password) referrer = url.origin + '/';
    } catch { /* No referrer. */ }
    return { page_location: safeLocation(), page_title: pageTitle(), page_referrer: referrer };
  }
  function suspend() { window['ga-disable-' + id] = true; }
  function clearCookies() {
    const host = new URL(origin).hostname;
    document.cookie.split(';').forEach(part => {
      const name = part.trim().split('=')[0];
      if (name === '_ga' || name === '_ga_' + id.slice(2) || name === '_ga_YDTDM0LCSC') {
        ['', ';Domain=' + host, ';Domain=.' + host].forEach(domain => {
          document.cookie = name + '=;Max-Age=0;Path=/;SameSite=Lax;Secure' + domain;
        });
      }
    });
  }
  function update() {
    suspend();
    clearTimeout(timer);
    const saved = choice();
    if (!saved?.allowed || disabled()) {
      clearCookies();
      if (loaded) location.reload();
      return;
    }
    if (location.origin !== origin || !pageTitle()) return;
    window['ga-disable-' + id] = false;
    timer = setTimeout(() => {
      update();
      if (!choice()) banner.hidden = false;
    }, Math.min(saved.until - Date.now(), 2147483647));
    const safe = context();
    if (!loaded) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('set', 'url_passthrough', false);
      window.gtag('set', { ...safe, send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false });
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
      const script = document.createElement('script');
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      script.src = 'https://www.googletagmanager.com/gtm.js?id=' + container;
      document.head.appendChild(script);
      loaded = true;
    }
    const page = origin + location.pathname;
    if (lastPage === page) return;
    window.gtag('set', safe);
    window.gtag('event', 'page_view', { ...safe, send_to: id });
    lastPage = page;
  }
  function choose(allowed) {
    if (!allowed) suspend();
    try { localStorage.setItem(key, JSON.stringify({ allowed, until: Date.now() + lifetime })); }
    catch { /* Storage failure means no consent and no collection. */ }
    update();
    banner.hidden = choice() !== null;
  }
  function init() {
    document.addEventListener('creatie:lead-accepted', () => metric('generate_lead'));
    let scrolledPage = '';
    window.addEventListener('scroll', () => {
      const element = document.scrollingElement;
      if (!element || !loaded || !choice()?.allowed || !pageTitle() || scrolledPage === location.pathname) return;
      if (element.scrollHeight > innerHeight && (element.scrollTop + innerHeight) / element.scrollHeight >= 0.9) {
        scrolledPage = location.pathname;
        metric('scroll');
      }
    }, {passive: true});
    document.addEventListener('click', e => {
      const link = e.target instanceof Element && e.target.closest('a[href]');
      if (!link) return;
      let target;
      try { target = new URL(link.href); } catch { return; }
      if (target.protocol === 'tel:') metric('click_tel');
      else if (target.protocol === 'mailto:') metric('click_email');
      else if (target.protocol === 'https:' && ['lin.ee','line.me','page.line.me'].includes(target.hostname)) metric('click_line');
      else if (link.dataset.analyticsAction === 'reservation') metric('click_reservation');
      else if (link.hasAttribute('download') || /\.(pdf|xlsx?|docx?|pptx?|zip)$/i.test(target.pathname)) metric('file_download');
      else if (['http:','https:'].includes(target.protocol) && target.origin !== origin) metric('click');
    });
    suspend();
    const privacy = config.privacy || '#analytics-privacy';
    const show = () => { banner.hidden = false; };
    const controls = document.createElement('div');
    controls.className = 'analytics-settings';
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.textContent = 'アクセス解析の設定';
    settings.addEventListener('click', show);
    controls.appendChild(settings);
    (document.querySelector('footer') || document.body).appendChild(controls);
    banner = document.createElement('section');
    banner.className = 'analytics-consent';
    banner.setAttribute('aria-label', 'アクセス解析の設定');
    banner.hidden = choice() !== null;
    banner.innerHTML = '<h2>アクセス解析について</h2><p>サイト改善のため、許可いただいた場合にGoogleアナリティクスで公開ページの閲覧数などを記録します。氏名・連絡先・フォームの入力内容は送信しません。選択は90日保存し、フッターから変更できます。</p><p><a class="analytics-details">詳しく見る</a></p><div class="analytics-choices"><button type="button" data-choice="deny">許可しない</button><button type="button" data-choice="allow">許可する</button></div>';
    banner.querySelector('.analytics-details').setAttribute('href', privacy);
    banner.querySelector('[data-choice="deny"]').addEventListener('click', () => choose(false));
    banner.querySelector('[data-choice="allow"]').addEventListener('click', () => choose(true));
    document.body.appendChild(banner);
    window.addEventListener('storage', event => {
      if (event.key === key || event.key === null) {
        update();
        banner.hidden = choice() !== null;
      }
    });
    window.addEventListener('popstate', update);
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        update();
        return result;
      };
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { update(); banner.hidden = choice() !== null; }
    });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
