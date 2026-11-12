(function () {
  var KEY = "terraforming.cookie-consent";
  var GA = "G-T419MSNEWJ";
  var CLARITY = "yvum2tlvam";
  var PIXELS = ["2986286885067417", "2278679232865207"];
  var loaded = false;

  function read() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function write(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {}
    window.dispatchEvent(new Event("terra-consent"));
  }

  function insert(src) {
    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    var first = document.getElementsByTagName("script")[0];
    if (first && first.parentNode) first.parentNode.insertBefore(script, first);
    else document.head.appendChild(script);
  }

  function enableTracking() {
    if (loaded || read() !== "granted") return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA);
    insert("https://www.googletagmanager.com/gtag/js?id=" + GA);
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY);
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq.disablePushState = true;
      PIXELS.forEach(function (id) { window.fbq("init", id); });
    }
    window.fbq("track", "PageView");
    if (window.location.pathname.indexOf("/terra/estado") === 0) {
      window.fbq("track", "ViewContent", {
        content_name: "Disponibilidad de lotes TERRA",
        content_category: "inventory",
        content_type: "product_group",
      });
    }
  }

  window.TerraConsent = {
    read: read,
    grant: function () {
      write("granted");
      enableTracking();
    },
    deny: function () {
      var previous = read();
      write("denied");
      if (previous === "granted") window.location.reload();
    },
  };

  if (read() === "granted") enableTracking();
})();
