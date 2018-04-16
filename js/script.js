var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * @copyright Copyright (c) 2017 IcoMoon.io
 * @license   Licensed under MIT license
 *            See https://github.com/Keyamoon/svgxuse
 * @version   1.2.6
 */
/*jslint browser: true */
/*global XDomainRequest, MutationObserver, window */
(function () {
    "use strict";

    if (typeof window !== "undefined" && window.addEventListener) {
        var cache = Object.create(null); // holds xhr objects to prevent multiple requests
        var checkUseElems;
        var tid; // timeout id
        var debouncedCheck = function debouncedCheck() {
            clearTimeout(tid);
            tid = setTimeout(checkUseElems, 100);
        };
        var unobserveChanges = function unobserveChanges() {
            return;
        };
        var observeChanges = function observeChanges() {
            var observer;
            window.addEventListener("resize", debouncedCheck, false);
            window.addEventListener("orientationchange", debouncedCheck, false);
            if (window.MutationObserver) {
                observer = new MutationObserver(debouncedCheck);
                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                unobserveChanges = function unobserveChanges() {
                    try {
                        observer.disconnect();
                        window.removeEventListener("resize", debouncedCheck, false);
                        window.removeEventListener("orientationchange", debouncedCheck, false);
                    } catch (ignore) {}
                };
            } else {
                document.documentElement.addEventListener("DOMSubtreeModified", debouncedCheck, false);
                unobserveChanges = function unobserveChanges() {
                    document.documentElement.removeEventListener("DOMSubtreeModified", debouncedCheck, false);
                    window.removeEventListener("resize", debouncedCheck, false);
                    window.removeEventListener("orientationchange", debouncedCheck, false);
                };
            }
        };
        var createRequest = function createRequest(url) {
            // In IE 9, cross origin requests can only be sent using XDomainRequest.
            // XDomainRequest would fail if CORS headers are not set.
            // Therefore, XDomainRequest should only be used with cross origin requests.
            function getOrigin(loc) {
                var a;
                if (loc.protocol !== undefined) {
                    a = loc;
                } else {
                    a = document.createElement("a");
                    a.href = loc;
                }
                return a.protocol.replace(/:/g, "") + a.host;
            }
            var Request;
            var origin;
            var origin2;
            if (window.XMLHttpRequest) {
                Request = new XMLHttpRequest();
                origin = getOrigin(location);
                origin2 = getOrigin(url);
                if (Request.withCredentials === undefined && origin2 !== "" && origin2 !== origin) {
                    Request = XDomainRequest || undefined;
                } else {
                    Request = XMLHttpRequest;
                }
            }
            return Request;
        };
        var xlinkNS = "http://www.w3.org/1999/xlink";
        checkUseElems = function checkUseElems() {
            var base;
            var bcr;
            var fallback = ""; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.
            var hash;
            var href;
            var i;
            var inProgressCount = 0;
            var isHidden;
            var Request;
            var url;
            var uses;
            var xhr;
            function observeIfDone() {
                // If done with making changes, start watching for chagnes in DOM again
                inProgressCount -= 1;
                if (inProgressCount === 0) {
                    // if all xhrs were resolved
                    unobserveChanges(); // make sure to remove old handlers
                    observeChanges(); // watch for changes to DOM
                }
            }
            function attrUpdateFunc(spec) {
                return function () {
                    if (cache[spec.base] !== true) {
                        spec.useEl.setAttributeNS(xlinkNS, "xlink:href", "#" + spec.hash);
                        if (spec.useEl.hasAttribute("href")) {
                            spec.useEl.setAttribute("href", "#" + spec.hash);
                        }
                    }
                };
            }
            function onloadFunc(xhr) {
                return function () {
                    var body = document.body;
                    var x = document.createElement("x");
                    var svg;
                    xhr.onload = null;
                    x.innerHTML = xhr.responseText;
                    svg = x.getElementsByTagName("svg")[0];
                    if (svg) {
                        svg.setAttribute("aria-hidden", "true");
                        svg.style.position = "absolute";
                        svg.style.width = 0;
                        svg.style.height = 0;
                        svg.style.overflow = "hidden";
                        body.insertBefore(svg, body.firstChild);
                    }
                    observeIfDone();
                };
            }
            function onErrorTimeout(xhr) {
                return function () {
                    xhr.onerror = null;
                    xhr.ontimeout = null;
                    observeIfDone();
                };
            }
            unobserveChanges(); // stop watching for changes to DOM
            // find all use elements
            uses = document.getElementsByTagName("use");
            for (i = 0; i < uses.length; i += 1) {
                try {
                    bcr = uses[i].getBoundingClientRect();
                } catch (ignore) {
                    // failed to get bounding rectangle of the use element
                    bcr = false;
                }
                href = uses[i].getAttribute("href") || uses[i].getAttributeNS(xlinkNS, "href") || uses[i].getAttribute("xlink:href");
                if (href && href.split) {
                    url = href.split("#");
                } else {
                    url = ["", ""];
                }
                base = url[0];
                hash = url[1];
                isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
                if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
                    // the use element is empty
                    // if there is a reference to an external SVG, try to fetch it
                    // use the optional fallback URL if there is no reference to an external SVG
                    if (fallback && !base.length && hash && !document.getElementById(hash)) {
                        base = fallback;
                    }
                    if (uses[i].hasAttribute("href")) {
                        uses[i].setAttributeNS(xlinkNS, "xlink:href", href);
                    }
                    if (base.length) {
                        // schedule updating xlink:href
                        xhr = cache[base];
                        if (xhr !== true) {
                            // true signifies that prepending the SVG was not required
                            setTimeout(attrUpdateFunc({
                                useEl: uses[i],
                                base: base,
                                hash: hash
                            }), 0);
                        }
                        if (xhr === undefined) {
                            Request = createRequest(base);
                            if (Request !== undefined) {
                                xhr = new Request();
                                cache[base] = xhr;
                                xhr.onload = onloadFunc(xhr);
                                xhr.onerror = onErrorTimeout(xhr);
                                xhr.ontimeout = onErrorTimeout(xhr);
                                xhr.open("GET", base);
                                xhr.send();
                                inProgressCount += 1;
                            }
                        }
                    }
                } else {
                    if (!isHidden) {
                        if (cache[base] === undefined) {
                            // remember this URL if the use element was not empty and no request was sent
                            cache[base] = true;
                        } else if (cache[base].onload) {
                            // if it turns out that prepending the SVG is not necessary,
                            // abort the in-progress xhr.
                            cache[base].abort();
                            delete cache[base].onload;
                            cache[base] = true;
                        }
                    } else if (base.length && cache[base]) {
                        setTimeout(attrUpdateFunc({
                            useEl: uses[i],
                            base: base,
                            hash: hash
                        }), 0);
                    }
                }
            }
            uses = "";
            inProgressCount += 1;
            observeIfDone();
        };
        var _winLoad;
        _winLoad = function winLoad() {
            window.removeEventListener("load", _winLoad, false); // to prevent memory leaks
            tid = setTimeout(checkUseElems, 0);
        };
        if (document.readyState !== "complete") {
            // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
            window.addEventListener("load", _winLoad, false);
        } else {
            // No need to add a listener if the document is already loaded, initialize immediately.
            _winLoad();
        }
    }
})();

/*! smooth-scroll v12.1.5 | (c) 2017 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/smooth-scroll */
!function (e, t) {
    "function" == typeof define && define.amd ? define([], function () {
        return t(e);
    }) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? module.exports = t(e) : e.SmoothScroll = t(e);
}("undefined" != typeof global ? global : "undefined" != typeof window ? window : this, function (e) {
    "use strict";
    var t = "querySelector" in document && "addEventListener" in e && "requestAnimationFrame" in e && "closest" in e.Element.prototype,
        n = { ignore: "[data-scroll-ignore]", header: null, speed: 500, offset: 0, easing: "easeInOutCubic", customEasing: null, before: function before() {}, after: function after() {} },
        o = function o() {
        for (var e = {}, t = 0, n = arguments.length; t < n; t++) {
            var o = arguments[t];!function (t) {
                for (var n in t) {
                    t.hasOwnProperty(n) && (e[n] = t[n]);
                }
            }(o);
        }return e;
    },
        a = function a(t) {
        return parseInt(e.getComputedStyle(t).height, 10);
    },
        r = function r(e) {
        "#" === e.charAt(0) && (e = e.substr(1));for (var t, n = String(e), o = n.length, a = -1, r = "", i = n.charCodeAt(0); ++a < o;) {
            if (0 === (t = n.charCodeAt(a))) throw new InvalidCharacterError("Invalid character: the input contains U+0000.");t >= 1 && t <= 31 || 127 == t || 0 === a && t >= 48 && t <= 57 || 1 === a && t >= 48 && t <= 57 && 45 === i ? r += "\\" + t.toString(16) + " " : r += t >= 128 || 45 === t || 95 === t || t >= 48 && t <= 57 || t >= 65 && t <= 90 || t >= 97 && t <= 122 ? n.charAt(a) : "\\" + n.charAt(a);
        }return "#" + r;
    },
        i = function i(e, t) {
        var n;return "easeInQuad" === e.easing && (n = t * t), "easeOutQuad" === e.easing && (n = t * (2 - t)), "easeInOutQuad" === e.easing && (n = t < .5 ? 2 * t * t : (4 - 2 * t) * t - 1), "easeInCubic" === e.easing && (n = t * t * t), "easeOutCubic" === e.easing && (n = --t * t * t + 1), "easeInOutCubic" === e.easing && (n = t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1), "easeInQuart" === e.easing && (n = t * t * t * t), "easeOutQuart" === e.easing && (n = 1 - --t * t * t * t), "easeInOutQuart" === e.easing && (n = t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t), "easeInQuint" === e.easing && (n = t * t * t * t * t), "easeOutQuint" === e.easing && (n = 1 + --t * t * t * t * t), "easeInOutQuint" === e.easing && (n = t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t), e.customEasing && (n = e.customEasing(t)), n || t;
    },
        u = function u() {
        return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
    },
        c = function c(e, t, n) {
        var o = 0;if (e.offsetParent) do {
            o += e.offsetTop, e = e.offsetParent;
        } while (e);return o = Math.max(o - t - n, 0);
    },
        s = function s(e) {
        return e ? a(e) + e.offsetTop : 0;
    },
        l = function l(t, n, o) {
        o || (t.focus(), document.activeElement.id !== t.id && (t.setAttribute("tabindex", "-1"), t.focus(), t.style.outline = "none"), e.scrollTo(0, n));
    },
        f = function f(t) {
        return !!("matchMedia" in e && e.matchMedia("(prefers-reduced-motion)").matches);
    };return function (a, d) {
        var m,
            h,
            g,
            p,
            v,
            b,
            y,
            S = {};S.cancelScroll = function () {
            cancelAnimationFrame(y);
        }, S.animateScroll = function (t, a, r) {
            var f = o(m || n, r || {}),
                d = "[object Number]" === Object.prototype.toString.call(t),
                h = d || !t.tagName ? null : t;if (d || h) {
                var g = e.pageYOffset;f.header && !p && (p = document.querySelector(f.header)), v || (v = s(p));var b,
                    y,
                    E,
                    I = d ? t : c(h, v, parseInt("function" == typeof f.offset ? f.offset() : f.offset, 10)),
                    O = I - g,
                    A = u(),
                    C = 0,
                    w = function w(n, o) {
                    var r = e.pageYOffset;if (n == o || r == o || (g < o && e.innerHeight + r) >= A) return S.cancelScroll(), l(t, o, d), f.after(t, a), b = null, !0;
                },
                    Q = function Q(t) {
                    b || (b = t), C += t - b, y = C / parseInt(f.speed, 10), y = y > 1 ? 1 : y, E = g + O * i(f, y), e.scrollTo(0, Math.floor(E)), w(E, I) || (e.requestAnimationFrame(Q), b = t);
                };0 === e.pageYOffset && e.scrollTo(0, 0), f.before(t, a), S.cancelScroll(), e.requestAnimationFrame(Q);
            }
        };var E = function E(e) {
            h && (h.id = h.getAttribute("data-scroll-id"), S.animateScroll(h, g), h = null, g = null);
        },
            I = function I(t) {
            if (!f() && 0 === t.button && !t.metaKey && !t.ctrlKey && (g = t.target.closest(a)) && "a" === g.tagName.toLowerCase() && !t.target.closest(m.ignore) && g.hostname === e.location.hostname && g.pathname === e.location.pathname && /#/.test(g.href)) {
                var n;try {
                    n = r(decodeURIComponent(g.hash));
                } catch (e) {
                    n = r(g.hash);
                }if ("#" === n) {
                    t.preventDefault(), h = document.body;var o = h.id ? h.id : "smooth-scroll-top";return h.setAttribute("data-scroll-id", o), h.id = "", void (e.location.hash.substring(1) === o ? E() : e.location.hash = o);
                }h = document.querySelector(n), h && (h.setAttribute("data-scroll-id", h.id), h.id = "", g.hash === e.location.hash && (t.preventDefault(), E()));
            }
        },
            O = function O(e) {
            b || (b = setTimeout(function () {
                b = null, v = s(p);
            }, 66));
        };return S.destroy = function () {
            m && (document.removeEventListener("click", I, !1), e.removeEventListener("resize", O, !1), S.cancelScroll(), m = null, h = null, g = null, p = null, v = null, b = null, y = null);
        }, S.init = function (a) {
            t && (S.destroy(), m = o(n, a || {}), p = m.header ? document.querySelector(m.header) : null, v = s(p), document.addEventListener("click", I, !1), e.addEventListener("hashchange", E, !1), p && e.addEventListener("resize", O, !1));
        }, S.init(d), S;
    };
});
//=============Header Menu===============

console.log('Hello 333');
var scroll = new SmoothScroll('a[href*="#"]');

/* $(document).click(function (e){
  console.log(e.target);
}) */

var topMobMenuOpen = $('.svg-icon__mobIco-open');
var navTopMobMenu = $('.nav-topMenu');
var navTopMobMenuClose = $('.svg-icon__mobIco');

topMobMenuOpen.on('click', mobTopMenuOpen);
navTopMobMenuClose.on('click', mobTopMenuClose);

function mobTopMenuOpen() {
    topMobMenuOpen.css({
        display: 'none'
    });
    navTopMobMenu.css({
        display: 'block',
        animation: 'bounceInDown 1s'
    });
}

function mobTopMenuClose() {
    //console.log('click');
    navTopMobMenu.css({
        animation: 'bounceOutUp 1s'
    });
    setTimeout(function () {
        navTopMobMenu.css({
            display: 'none'
        });
        topMobMenuOpen.css({
            display: 'block'
        });
    }, 900);
}
//=======================Media for js

/* function initTablet() {
  device = 'tablet';
  $('.header__menu_link').css({
    backgroundColor: "transparent",
    borderBottom: '1px solid transparent',
    border: "1px solid transparent",
    fontStyle: 'normal',
    left: '0',
    width: 'auto'
  });
}

function initMobile() {
  device = 'mobile';
  $('.header__menu_link').css({
    border: "none",
    backgroundColor: "rgba(0,0,0,0.9)"
  });
} */

/* ssm.addState({
  id: 'tablet',
  query: '(max-width: 768px)',
  onEnter: function() {
    initTablet();
  }
});

ssm.addState({
  id: 'tablet',
  query: '(min-width: 575px)',
  onEnter: function() {
    initTablet();
  }
});

ssm.addState({
  id: 'mobile',
  query: '(max-width: 576px)',
  onEnter: function() {
    initMobile();
  }
});

//============Portfolio-galary=====================
/* 
let $portfolioGallery = $('.portfolio__gallery').isotope({
  itemSelector: '.portfolio__img',
  horizontalOrder: true,
  layoutMode: 'masonry',
  masonry: {
    gutter: '.gutter-sizer'
  }
});

$(".galleryBlock__btn").click(function() {
  const $this = $(this);
  const filter = "." + $this.data('filter');
  $portfolioGallery.isotope({
    filter: filter
  });
}); */

//===================SlickSlider===============

/* $(document).ready(function() {
  $('.team_slider').slick({
    infinite: true,
    dots: true,
    arrows: false,
    autoplay: true,
  //fade: true,
  });
}); */

//=================BX-Slider====================
/*  //Initialize the slider
$(document).ready(function() {
  $('.testimonials_slider').bxSlider({
    auto: true,
    stopAutoOnClick: true,
    pause: 4000,
    controls: false,
  });
}); */

//========Google-Maps==============
/* var map;
const cnt = {
  lat: 46.485878,
  lng: 30.7399100
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: cnt,
    zoom: 18
  });
  const marker = new google.maps.Marker({
    position: cnt,
    map: map,
    title: 'Cannoli confectionery',
    icon: 'img/cannoliFav.png'
  })
  const infoWindow = new google.maps.InfoWindow({
    content: 'Cannoli confectionery, Tchaikovsky line 19, Odesa Ukraine'
  })
  marker.addListener('click', function() {
    infoWindow.open(map, marker)
  })
} */

//========================Animation========

/* jQuery(document).ready(function() {
  jQuery('.container-header').addClass("hidden").viewportChecker({
    classToAdd: 'visible animated lightSpeedIn', // Class to add to the elements when they are visible
    offset: 100
  });
}); */