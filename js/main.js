(function () {
    "use strict";

    var root = document.documentElement;
    root.classList.add("js");

    // Theme: light by default, remember an explicit choice
    try {
        var saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
    } catch (e) {}

    document.querySelector(".theme-toggle").addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
    });

    // Header border once scrolled
    var header = document.querySelector(".site-header");
    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.getElementById("year").textContent = new Date().getFullYear();

    // Analytics events for key actions (no-op until GA is configured)
    document.querySelectorAll("[data-track]").forEach(function (el) {
        el.addEventListener("click", function () {
            if (typeof window.gtag === "function") window.gtag("event", el.dataset.track);
        });
    });

    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
        return;
    }

    // Reveal on scroll
    var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });

    // Count-up stats
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var counter = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            counter.unobserve(el);
            if (reduceMotion) return;
            var target = +el.dataset.count, suffix = el.dataset.suffix || "", start = null;
            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / 1400, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { counter.observe(el); });

    // Highlight the nav link for the section in view
    var links = {};
    document.querySelectorAll(".nav-links a").forEach(function (a) { links[a.hash.slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var link = links[entry.target.id];
            if (link && entry.isIntersecting) {
                Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
                link.classList.add("active");
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
        var section = document.getElementById(id);
        if (section) spy.observe(section);
    });
})();
