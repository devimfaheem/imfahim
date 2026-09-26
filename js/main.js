(function () {
    "use strict";

    var root = document.documentElement;
    root.classList.add("js");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

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

    document.getElementById("year").textContent = new Date().getFullYear();

    // Analytics events for key actions (no-op until GA is configured)
    $$("[data-track]").forEach(function (el) {
        el.addEventListener("click", function () {
            if (typeof window.gtag === "function") window.gtag("event", el.dataset.track);
        });
    });

    // Split headings into words for the rise-in animation
    $$(".split").forEach(function (el) {
        var words = el.textContent.trim().split(/\s+/);
        el.setAttribute("aria-label", el.textContent.trim());
        el.innerHTML = words.map(function (w, i) {
            return '<span class="w" aria-hidden="true"><span style="--wi:' + i + '">' + w.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span></span>";
        }).join(" ");
    });

    // Skill card index numbers
    $$(".skill-card[data-index]").forEach(function (el) {
        var n = document.createElement("span");
        n.className = "index";
        n.setAttribute("aria-hidden", "true");
        n.textContent = el.dataset.index;
        el.appendChild(n);
    });

    // Duplicate marquee items so the loop is seamless
    $$(".marquee-track").forEach(function (track) {
        $$("li", track).forEach(function (li) {
            var clone = li.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            track.appendChild(clone);
        });
    });

    // Stagger reveal delays inside grids
    $$(".bento, .skills-grid, .edu-grid, .quotes, .about-grid").forEach(function (group) {
        $$(".reveal", group).forEach(function (el, i) { el.style.setProperty("--i", i); });
    });

    // Live Lahore clock
    var clock = document.querySelector("[data-clock]");
    if (clock) {
        var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false });
        var tick = function () {
            var parts = fmt.format(new Date()).split(":");
            clock.innerHTML = parts[0] + '<span class="colon">:</span>' + parts[1];
        };
        tick();
        setInterval(tick, 15000);
    }

    // Scroll-linked: header border, progress bar, timeline fill
    var header = document.querySelector(".site-header");
    var progress = document.querySelector(".scroll-progress");
    var timeline = document.querySelector(".timeline");
    var fill = document.querySelector(".timeline-fill");
    var jobs = $$(".job");
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle("scrolled", y > 8);
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";

        if (timeline) {
            var r = timeline.getBoundingClientRect();
            var mark = window.innerHeight * 0.6;
            var f = Math.min(Math.max((mark - r.top) / r.height, 0), 1);
            fill.style.setProperty("--fill", f.toFixed(4));
            jobs.forEach(function (job) {
                job.classList.toggle("lit", job.getBoundingClientRect().top + 24 < mark);
            });
        }
        ticking = false;
    }
    window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    // Pause SVG pipeline animation for reduced-motion users
    var pipeline = document.querySelector(".pipeline");
    if (reduceMotion && pipeline && pipeline.pauseAnimations) pipeline.pauseAnimations();

    // Cursor-driven effects (desktop only)
    if (finePointer && !reduceMotion) {
        // Glow: every card in a group tracks the cursor, so borders light up as you approach
        $$(".glow-group").forEach(function (group) {
            var cards = group.classList.contains("card") ? [group] : $$(".card", group);
            var raf = 0, ev = null;
            group.addEventListener("pointermove", function (e) {
                ev = e;
                if (raf) return;
                raf = requestAnimationFrame(function () {
                    raf = 0;
                    cards.forEach(function (c) {
                        var b = c.getBoundingClientRect();
                        c.style.setProperty("--mx", (ev.clientX - b.left) + "px");
                        c.style.setProperty("--my", (ev.clientY - b.top) + "px");
                    });
                });
            });
        });

        // Subtle 3D tilt on hero tiles
        $$(".tilt").forEach(function (tile) {
            tile.addEventListener("pointermove", function (e) {
                var b = tile.getBoundingClientRect();
                var px = (e.clientX - b.left) / b.width - 0.5;
                var py = (e.clientY - b.top) / b.height - 0.5;
                var max = tile.classList.contains("t-intro") ? 2.5 : 6;
                tile.style.transform = "perspective(900px) rotateX(" + (-py * max) + "deg) rotateY(" + (px * max) + "deg)";
            });
            tile.addEventListener("pointerleave", function () { tile.style.transform = ""; });
        });

        // Magnetic buttons
        $$(".magnetic").forEach(function (el) {
            el.addEventListener("pointermove", function (e) {
                var b = el.getBoundingClientRect();
                var dx = e.clientX - (b.left + b.width / 2);
                var dy = e.clientY - (b.top + b.height / 2);
                el.style.translate = (dx * 0.25) + "px " + (dy * 0.35) + "px";
            });
            el.addEventListener("pointerleave", function () { el.style.translate = ""; });
        });
    }

    if (!("IntersectionObserver" in window)) {
        $$(".reveal").forEach(function (el) { el.classList.add("visible", "settled"); });
        $$(".split").forEach(function (el) { el.classList.add("in"); });
        return;
    }

    // Reveal on scroll
    var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            el.classList.add("visible");
            revealer.unobserve(el);
            // drop the stagger delay afterwards so hover effects respond instantly
            setTimeout(function () { el.classList.add("settled"); }, 1400);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { revealer.observe(el); });

    // Heading word rise
    var splitter = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                splitter.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    $$(".split").forEach(function (el) { splitter.observe(el); });

    // Count-up stats
    var counter = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            counter.unobserve(el);
            if (reduceMotion) return;
            var target = +el.dataset.count, suffix = el.dataset.suffix || "", start = null;
            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / 1600, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { counter.observe(el); });

    // Highlight the nav link for the section in view
    var links = {};
    $$(".nav-links a").forEach(function (a) { links[a.hash.slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
            var link = links[entry.target.id];
            if (link) link.classList.add("active");
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).concat(["top", "testimonials"]).forEach(function (id) {
        var section = document.getElementById(id);
        if (section) spy.observe(section);
    });
})();
