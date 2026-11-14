/*
 * 쿠키 동의 배너와 추적 스크립트 게이트.
 *
 * 동의 전에는 Google Analytics 스크립트를 아예 요청하지 않는다. 선택은
 * 이 브라우저의 localStorage 에 저장하고 /cookies.html 에서 다시 바꿀 수
 * 있다. 새 외부 서비스를 추가하지 않는다. 이 사이트의 각 페이지는 자신의
 * GA 측정 아이디를 data-ga-id 속성으로 넘긴다.
 *
 *   <script defer src="/consent.js" data-ga-id="G-XXXXXXXXXX"></script>
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hannune_cookie_consent";
  var EVENT_NAME = "hannune-cookie-consent-changed";

  function getConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* localStorage 가 막혀 있으면 이 방문에서만 선택을 기억하지 못한다. */
    }
    window.dispatchEvent(new Event(EVENT_NAME));
  }

  function clearConsent() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT_NAME));
  }
  // /cookies.html 의 "다시 선택하기" 버튼이 쓴다.
  window.hannuneResetCookieConsent = clearConsent;
  window.hannuneGetCookieConsent = getConsent;

  function loadGoogleAnalytics(gaId) {
    if (!gaId || document.getElementById("hannune-ga-script")) return;
    var tag = document.createElement("script");
    tag.id = "hannune-ga-script";
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", gaId);
  }

  function applyConsent(gaId) {
    if (getConsent() === "accepted") {
      loadGoogleAnalytics(gaId);
    }
  }

  function renderBanner() {
    if (getConsent() || document.getElementById("hannune-cookie-banner")) return;

    var banner = document.createElement("div");
    banner.id = "hannune-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:9999;" +
      "background:#fff;border-top:1px solid rgba(51,58,47,0.2);" +
      "box-shadow:0 -2px 10px rgba(0,0,0,0.08);" +
      "padding:1rem 1.25rem;font-family:inherit;";

    var inner = document.createElement("div");
    inner.style.cssText =
      "max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;" +
      "align-items:center;justify-content:space-between;gap:0.75rem;";

    var text = document.createElement("p");
    text.style.cssText = "margin:0;font-size:0.9rem;color:#444;flex:1 1 320px;";
    text.innerHTML =
      "We use analytics cookies (Google Analytics) to understand how this site is used. " +
      "You can accept or reject them; your choice is saved in this browser and you can " +
      'change it anytime on our <a href="/cookies.html" style="color:#333a2f;text-decoration:underline;">Cookie Policy</a> page.';

    var buttons = document.createElement("div");
    buttons.style.cssText = "display:flex;gap:0.5rem;flex-shrink:0;";

    var rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.textContent = "Reject";
    rejectBtn.style.cssText =
      "border:1px solid #ccc;background:#fff;color:#333;border-radius:6px;" +
      "padding:0.5rem 1rem;font-size:0.9rem;cursor:pointer;";

    var acceptBtn = document.createElement("button");
    acceptBtn.type = "button";
    acceptBtn.textContent = "Accept";
    acceptBtn.style.cssText =
      "border:none;background:#333a2f;color:#fff;border-radius:6px;" +
      "padding:0.5rem 1rem;font-size:0.9rem;cursor:pointer;";

    rejectBtn.addEventListener("click", function () {
      setConsent("rejected");
      removeBanner();
    });
    acceptBtn.addEventListener("click", function () {
      setConsent("accepted");
      removeBanner();
    });

    buttons.appendChild(rejectBtn);
    buttons.appendChild(acceptBtn);
    inner.appendChild(text);
    inner.appendChild(buttons);
    banner.appendChild(inner);
    document.body.appendChild(banner);
  }

  function removeBanner() {
    var el = document.getElementById("hannune-cookie-banner");
    if (el) el.remove();
  }

  function init() {
    var scriptEl = document.currentScript;
    var gaId = scriptEl ? scriptEl.getAttribute("data-ga-id") : null;

    applyConsent(gaId);
    renderBanner();

    window.addEventListener(EVENT_NAME, function () {
      applyConsent(gaId);
      if (getConsent()) {
        removeBanner();
      } else {
        renderBanner();
      }
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
