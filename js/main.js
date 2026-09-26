(function () {
    "use strict";

    var root = document.documentElement;
    root.classList.add("js");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    // Theme: dark by default, remember an explicit choice
    try {
        var saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
    } catch (e) {}

    document.querySelector(".theme-toggle").addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
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
    $$(".bento, .skills-grid, .edu-grid, .quotes, .about-grid, .services-grid, .faq-list").forEach(function (group) {
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

    // Showcase tile: loops my dev workflow, an agentic automation run, and its flow diagram
    var termTile = document.querySelector(".t-term");
    if (termTile) {
        var AUTOMATION_STEPS = ["Trigger", "Extract", "Validate", "Execute", "Verify", "Deliver"];
        var scenarios = [
            {
                type: "term",
                title: "claude — ~/project",
                tag: "My workflow",
                steps: ["Spec", "Plan", "Test", "Build", "Review", "Ship"],
                lines: [
                    { cmd: '/brainstorm "add order-sync service"', step: 0 },
                    { out: "✓ spec written → docs/specs/order-sync.md", k: "ok" },
                    { cmd: "/write-plan", step: 1 },
                    { out: "✓ plan: 6 tasks · TDD · 2 subagents", k: "ok" },
                    { cmd: "npm test", step: 2 },
                    { out: "✗ 3 failing — tests written first", k: "err" },
                    { out: "● subagent implementing task 3/6 …", k: "info", step: 3 },
                    { out: "✓ 24 passing", k: "ok" },
                    { cmd: "/code-review", step: 4 },
                    { out: "✓ reviewer agent: approved · 0 issues", k: "ok" },
                    { out: "✓ PR merged → shipped", k: "ok", step: 5 }
                ]
            },
            {
                type: "term",
                title: "agents — invoice-automation",
                tag: "Agentic automation",
                steps: AUTOMATION_STEPS,
                lines: [
                    { cmd: "agents run invoice-automation --source inbox", step: 0 },
                    { out: "● 12 new invoices received (email + PDF)", k: "info" },
                    { out: "✓ extractor agent: invoices parsed → structured JSON", k: "ok", step: 1 },
                    { out: "✓ validator agent: vendors matched · totals checked", k: "ok", step: 2 },
                    { out: "● browser agents posting entries to ERP & vendor portals …", k: "info", step: 3 },
                    { out: "✓ 12 records synced · payments scheduled", k: "ok" },
                    { out: "⚠ 1 amount mismatch → routed to human review", k: "warn", step: 4 },
                    { out: "✓ reviewer agent: 11/11 auto-approved", k: "ok" },
                    { out: "✓ vendors notified · ERP updated", k: "ok", step: 5 },
                    { out: "  run complete · next run in 15 min", k: "dim" }
                ]
            },
            {
                type: "flow",
                title: "workflow — invoice-automation",
                tag: "Automation flow",
                steps: AUTOMATION_STEPS
            }
        ];

        // Flow diagram: node centres for a wide (h) and a stacked phone (v) layout
        var FLOW = {
            nodes: [
                { id: "email", label: "Email", h: [70, 70], v: [62, 24] },
                { id: "form", label: "Web form", h: [70, 135], v: [170, 24] },
                { id: "api", label: "API", h: [70, 200], v: [278, 24] },
                { id: "orch", label: "Orchestrator", h: [215, 135], v: [170, 110], w: 112, cls: "agent" },
                { id: "extract", label: "Extractor", h: [375, 70], v: [62, 196], w: 120, cls: "agent" },
                { id: "validate", label: "Validator", h: [375, 135], v: [170, 196], w: 120, cls: "agent" },
                { id: "browser", label: "Browser agents", h: [375, 200], v: [278, 196], w: 120, cls: "agent" },
                { id: "review", label: "Reviewer", h: [530, 135], v: [170, 282], w: 104, cls: "agent" },
                { id: "erp", label: "ERP", h: [656, 70], v: [62, 368], w: 112 },
                { id: "notify", label: "Vendor email", h: [656, 135], v: [170, 368], w: 112 },
                { id: "human", label: "Human review", h: [656, 200], v: [278, 368], w: 112, cls: "warn" }
            ],
            edges: [
                ["email", "orch"], ["form", "orch"], ["api", "orch"],
                ["orch", "extract"], ["orch", "validate"], ["orch", "browser"],
                ["extract", "review"], ["validate", "review"], ["browser", "review"],
                ["review", "erp"], ["review", "notify"], ["review", "human", "warn"]
            ],
            cols: [["SOURCES", 70], ["ORCHESTRATE", 215], ["AI AGENTS", 375], ["VERIFY", 530], ["OUTPUTS", 656]],
            steps: [
                { pre: ["email", "form", "api"], edges: [["email", "orch"], ["form", "orch"], ["api", "orch"]], post: ["orch"], text: ["info", "● 12 invoices arrive from email, forms & API"] },
                { edges: [["orch", "extract"]], post: ["extract"], text: ["ok", "✓ extractor agent turns documents into structured JSON"] },
                { edges: [["orch", "validate"]], post: ["validate"], text: ["ok", "✓ validator agent matches vendors & checks totals"] },
                { edges: [["orch", "browser"]], post: ["browser"], text: ["info", "● browser agents post entries to ERP & vendor portals"] },
                { edges: [["extract", "review"], ["validate", "review"], ["browser", "review"]], post: ["review"], text: ["ok", "✓ reviewer agent auto-approves 11 of 12 invoices"] },
                { edges: [["review", "erp"], ["review", "notify"], ["review", "human"]], post: ["erp", "notify", "human"], text: ["ok", "✓ ERP updated & vendors notified · <span class=\"warn\">⚠ 1 sent to a human</span>"] }
            ]
        };
        var NODE_W = 92, NODE_H = 36, V_NODE_W = 96, V_NODE_H = 34;

        var flowHTML = function (layout) {
            var vertical = layout === "v";
            var byId = {};
            var nodes = FLOW.nodes.map(function (n) {
                var c = vertical ? n.v : n.h;
                var w = vertical ? Math.min(n.w || V_NODE_W, 104) : (n.w || NODE_W);
                var h = vertical ? V_NODE_H : NODE_H;
                return (byId[n.id] = { id: n.id, label: n.label, cls: n.cls || "", x: c[0], y: c[1], w: w, h: h });
            });
            var edges = FLOW.edges.map(function (e) {
                var a = byId[e[0]], b = byId[e[1]], d;
                if (vertical) {
                    var y1 = a.y + a.h / 2, y2 = b.y - b.h / 2, dy = (y2 - y1) / 2;
                    d = "M" + a.x + " " + y1 + " C" + a.x + " " + (y1 + dy) + " " + b.x + " " + (y2 - dy) + " " + b.x + " " + y2;
                } else {
                    var x1 = a.x + a.w / 2, x2 = b.x - b.w / 2, dx = (x2 - x1) / 2;
                    d = "M" + x1 + " " + a.y + " C" + (x1 + dx) + " " + a.y + " " + (x2 - dx) + " " + b.y + " " + x2 + " " + b.y;
                }
                return '<path class="f-edge' + (e[2] ? " " + e[2] : "") + '" data-edge="' + e[0] + ">" + e[1] + '" d="' + d + '"/>';
            });
            var cols = vertical ? "" : FLOW.cols.map(function (c) { return '<text class="f-col" x="' + c[1] + '" y="22">' + c[0] + "</text>"; }).join("");
            var boxes = nodes.map(function (n) {
                return '<g class="f-node ' + n.cls + '" data-node="' + n.id + '"><rect x="' + (n.x - n.w / 2) + '" y="' + (n.y - n.h / 2) + '" width="' + n.w + '" height="' + n.h + '" rx="10"/><text x="' + n.x + '" y="' + n.y + '">' + n.label + "</text></g>";
            }).join("");
            var vb = vertical ? "0 0 340 392" : "0 0 720 230";
            return '<svg class="' + layout + '" viewBox="' + vb + '">' + cols + edges.join("") + '<g class="f-packets"></g>' + boxes + "</svg>";
        };

        var termCode = termTile.querySelector("[data-term]");
        var termTitle = termTile.querySelector("[data-term-title]");
        var termTag = termTile.querySelector("[data-term-tag]");
        var stepper = termTile.querySelector(".stepper");
        var body = termTile.querySelector(".term-body");
        var flowSvg = termTile.querySelector(".flow-svg");
        var flowCaption = termTile.querySelector(".flow-caption");
        var esc = function (t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
        var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
        var cursor = document.createElement("span");
        cursor.className = "cursor";
        var flowLayout = function () { return body.clientWidth < 560 ? "v" : "h"; };

        var setStep = function (n) {
            $$("li", stepper).forEach(function (li, i) {
                li.classList.toggle("done", i < n);
                li.classList.toggle("active", i === n);
            });
        };
        var setHeader = function (sc) {
            termTitle.textContent = sc.title;
            termTag.textContent = sc.tag;
            stepper.innerHTML = sc.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("");
            setStep(-1);
        };
        var linesHtml = function (sc) {
            return sc.lines.map(function (l) {
                return l.cmd
                    ? '<span class="ln pending"><span class="prompt">$ </span><span class="cmd"><span class="typed"></span><span class="rest">' + esc(l.cmd) + "</span></span></span>"
                    : '<span class="ln pending"><span class="' + l.k + '">  ' + esc(l.out) + "</span></span>";
            }).join("");
        };

        // Reserve the height of the tallest scene so switching never shifts the page
        var reserve = function () {
            var probe = body.cloneNode(true);
            probe.style.cssText = "position:absolute;left:0;right:0;visibility:hidden;min-height:0";
            termTile.appendChild(probe);
            var pre = probe.querySelector(".term"), code = probe.querySelector("code"), flow = probe.querySelector(".flow");
            var max = 0;
            pre.style.display = "block"; flow.style.display = "none";
            scenarios.forEach(function (sc) {
                if (sc.type !== "term") return;
                code.innerHTML = linesHtml(sc);
                max = Math.max(max, probe.offsetHeight);
            });
            pre.style.display = "none"; flow.style.display = "block";
            probe.querySelector(".flow-svg").innerHTML = flowHTML(flowLayout());
            probe.querySelector(".flow-caption").textContent = "x";
            max = Math.max(max, probe.offsetHeight);
            probe.remove();
            body.style.minHeight = max + "px";
        };

        // --- Terminal scene: every line is laid out up front (hidden) and revealed in turn
        var runTerm = function (sc) {
            termTile.classList.remove("show-flow");
            setHeader(sc);
            termCode.innerHTML = linesHtml(sc);
            var lines = $$(".ln", termCode);
            var i = 0;
            var next = function () {
                if (i >= sc.lines.length) {
                    setStep(sc.steps.length);
                    lines[lines.length - 1].appendChild(cursor);
                    return Promise.resolve();
                }
                var l = sc.lines[i], el = lines[i];
                i++;
                if (l.step !== undefined) setStep(l.step);
                el.classList.remove("pending");
                if (!l.cmd) return wait(650).then(next);
                var typed = el.querySelector(".typed"), rest = el.querySelector(".rest");
                typed.after(cursor);
                var c = 0;
                var type = function () {
                    if (c < l.cmd.length) {
                        c++;
                        typed.textContent = l.cmd.slice(0, c);
                        rest.textContent = l.cmd.slice(c);
                        return wait(38 + Math.random() * 40).then(type);
                    }
                    return wait(420).then(next);
                };
                return wait(300).then(type);
            };
            return next();
        };

        // --- Flow scene: nodes light up and data packets travel along the edges
        var sendPackets = function (paths, group) {
            return new Promise(function (resolve) {
                var packets = [];
                paths.forEach(function (path) {
                    var len = path.getTotalLength();
                    [0, 220].forEach(function (delay) {
                        var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        dot.setAttribute("r", "4");
                        dot.setAttribute("class", "f-packet" + (path.classList.contains("warn") ? " warn" : ""));
                        dot.setAttribute("opacity", "0");
                        group.appendChild(dot);
                        packets.push({ dot: dot, path: path, len: len, delay: delay });
                    });
                });
                var duration = 1100, start = null;
                var frame = function (ts) {
                    if (!start) start = ts;
                    var done = true;
                    packets.forEach(function (p) {
                        var t = Math.min(Math.max((ts - start - p.delay) / duration, 0), 1);
                        if (t < 1) done = false;
                        var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                        var pt = p.path.getPointAtLength(p.len * e);
                        p.dot.setAttribute("cx", pt.x);
                        p.dot.setAttribute("cy", pt.y);
                        p.dot.setAttribute("opacity", t > 0 && t < 1 ? "1" : "0");
                    });
                    if (done) { packets.forEach(function (p) { p.dot.remove(); }); resolve(); }
                    else requestAnimationFrame(frame);
                };
                requestAnimationFrame(frame);
            });
        };

        var runFlow = function (sc) {
            setHeader(sc);
            flowSvg.innerHTML = flowHTML(flowLayout());
            flowCaption.innerHTML = "";
            termTile.classList.add("show-flow");
            var svg = flowSvg.firstChild, packets = svg.querySelector(".f-packets");
            var node = function (id) { return svg.querySelector('[data-node="' + id + '"]'); };
            var edge = function (e) { return svg.querySelector('[data-edge="' + e[0] + ">" + e[1] + '"]'); };
            var lit = [];
            var light = function (ids) {
                lit.forEach(function (n) { n.classList.remove("active"); n.classList.add("done"); });
                lit = ids.map(node);
                lit.forEach(function (n) { n.classList.add("active"); });
            };
            var s = 0;
            var step = function () {
                if (s >= FLOW.steps.length) {
                    setStep(sc.steps.length);
                    lit.forEach(function (n) { n.classList.remove("active"); n.classList.add("done"); });
                    return Promise.resolve();
                }
                var st = FLOW.steps[s];
                setStep(s);
                s++;
                flowCaption.innerHTML = '<span class="' + st.text[0] + '">' + st.text[1] + "</span>";
                if (st.pre) light(st.pre);
                var paths = st.edges.map(edge);
                return wait(350).then(function () {
                    paths.forEach(function (p) { p.classList.add("flowing"); });
                    return sendPackets(paths, packets);
                }).then(function () {
                    paths.forEach(function (p) { p.classList.remove("flowing"); p.classList.add("done"); });
                    light(st.post);
                    return wait(900);
                }).then(step);
            };
            return step();
        };

        // --- Loop through the scenes with a fade between them
        var loop = function (si) {
            var sc = scenarios[si];
            (sc.type === "flow" ? runFlow(sc) : runTerm(sc)).then(function () {
                return wait(4000);
            }).then(function () {
                termTile.classList.add("switching");
                return wait(500);
            }).then(function () {
                loop((si + 1) % scenarios.length);
                termTile.classList.remove("switching");
            });
        };

        reserve();
        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(reserve, 200);
        });

        if (reduceMotion) {
            setHeader(scenarios[0]);
            termCode.innerHTML = linesHtml(scenarios[0]);
            $$(".ln", termCode).forEach(function (el) { el.classList.remove("pending"); });
            $$(".typed", termCode).forEach(function (t) { t.textContent = t.nextSibling.textContent; t.nextSibling.textContent = ""; });
            setStep(scenarios[0].steps.length);
        } else if ("IntersectionObserver" in window) {
            setHeader(scenarios[0]);
            termCode.innerHTML = linesHtml(scenarios[0]);
            var termObs = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) { termObs.disconnect(); setTimeout(function () { loop(0); }, 600); }
            }, { threshold: 0.3 });
            termObs.observe(termTile);
        } else {
            loop(0);
        }
    }

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
