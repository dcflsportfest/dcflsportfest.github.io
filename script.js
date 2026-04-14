function escapeHTML(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function pickLocalizedText(value, lang) {
    if (value && typeof value === "object") {
        return value[lang] || value.tr || value.en || value.pl || "";
    }
    return value || "";
}

function getSharedSiteState() {
    if (window.DCFLSiteData && typeof window.DCFLSiteData.getData === "function") {
        return window.DCFLSiteData.getData();
    }
    if (window.DCFLSiteData && typeof window.DCFLSiteData.getDefaultData === "function") {
        return window.DCFLSiteData.getDefaultData();
    }
    return {
        publishResults: false,
        branchTemplates: []
    };
}

(function () {
    var cornerLogos = document.querySelectorAll(".corner-logo-stack");
    if (!cornerLogos.length) {
        return;
    }

    function syncCornerLogos() {
        var hideOnMobile = window.innerWidth <= 900;
        cornerLogos.forEach(function (logo) {
            logo.style.display = hideOnMobile ? "none" : "";
        });
    }

    syncCornerLogos();
    window.addEventListener("resize", syncCornerLogos);
})();

(function () {
    var navToggles = document.querySelectorAll("[data-nav-toggle]");
    if (!navToggles.length) {
        return;
    }

    navToggles.forEach(function (toggle) {
        var nav = toggle.closest(".top-nav");
        if (!nav) {
            return;
        }

        var links = nav.querySelector("[data-nav-links]");
        if (!links) {
            return;
        }

        function setOpenState(isOpen) {
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            toggle.classList.toggle("open", isOpen);
            links.classList.toggle("open", isOpen);
            if (window.innerWidth <= 640) {
                document.body.classList.toggle("nav-menu-open", isOpen);
            } else {
                document.body.classList.remove("nav-menu-open");
            }
        }

        toggle.addEventListener("click", function () {
            var isOpen = links.classList.contains("open");
            setOpenState(!isOpen);
        });

        links.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                setOpenState(false);
            });
        });

        document.addEventListener("click", function (event) {
            if (!links.classList.contains("open")) {
                return;
            }

            if (!nav.contains(event.target)) {
                setOpenState(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && links.classList.contains("open")) {
                setOpenState(false);
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 640) {
                setOpenState(false);
            }
        });
    });
})();

(function () {
    var toggles = document.querySelectorAll("[data-expand-toggle]");
    if (!toggles.length) {
        return;
    }

    toggles.forEach(function (toggle) {
        var panelId = toggle.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) {
            return;
        }

        panel.hidden = false;
        panel.removeAttribute("hidden");

        function setOpen(isOpen) {
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            panel.classList.toggle("is-open", isOpen);
            panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
        }

        toggle.addEventListener("click", function () {
            var isOpen = toggle.getAttribute("aria-expanded") === "true";
            setOpen(!isOpen);
        });

        setOpen(false);
    });
})();

(function () {
    var scoreboards = document.querySelectorAll("[data-scoreboard]");
    if (!scoreboards.length) {
        return;
    }

    scoreboards.forEach(function (scoreboard) {
        var tabs = scoreboard.querySelectorAll("[data-score-tab]");
        var panels = scoreboard.querySelectorAll("[data-score-panel]");
        if (!tabs.length || !panels.length) {
            return;
        }

        function activate(tabKey) {
            tabs.forEach(function (tab) {
                var isActive = tab.getAttribute("data-score-tab") === tabKey;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            panels.forEach(function (panel) {
                var isActive = panel.getAttribute("data-score-panel") === tabKey;
                panel.classList.toggle("active", isActive);
                panel.hidden = !isActive;
            });

            if (tabKey === "results" && typeof renderScoreResults === "function") {
                renderScoreResults((document.documentElement.getAttribute("lang") || "tr").toLowerCase());
            }
        }

        tabs.forEach(function (tab) {
            tab.setAttribute("role", "tab");
            tab.addEventListener("click", function () {
                activate(tab.getAttribute("data-score-tab"));
            });
        });

        panels.forEach(function (panel) {
            panel.setAttribute("role", "tabpanel");
            panel.hidden = !panel.classList.contains("active");
        });

        var activeTab = scoreboard.querySelector("[data-score-tab].active");
        activate(activeTab ? activeTab.getAttribute("data-score-tab") : tabs[0].getAttribute("data-score-tab"));
    });
})();

(function () {
    var footer = document.querySelector(".footer");
    if (!footer || document.body.hasAttribute("data-admin-page")) {
        return;
    }

    if (footer.querySelector(".footer-social")) {
        return;
    }

    footer.insertAdjacentHTML("beforeend", [
        "<div class=\"footer-social\">",
        "    <a class=\"footer-social-link\" href=\"https://www.instagram.com/dcflsportfest?igsh=MWszOWFhcm92NnVwYQ==\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"DCFL Sportfest Instagram\">",
        "        <img src=\"assets/instagram-logo.jfif\" alt=\"Instagram\" class=\"footer-social-icon\">",
        "        <span>@dcflsportfest</span>",
        "    </a>",
        "    <a class=\"footer-social-link footer-social-link--tiktok\" href=\"https://www.tiktok.com/@dcflsportfest?_r=1&_t=ZS-95L5JIFX8Oy\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"DCFL Sportfest TikTok\">",
        "        <img src=\"assets/tiktok-icon.png\" alt=\"TikTok\" class=\"footer-social-icon\">",
        "        <span>@dcflsportfest</span>",
        "    </a>",
        "</div>"
    ].join(""));
})();

function renderLiveScoreboard() {
    var liveGrid = document.querySelector("[data-live-score-grid]");
    var activeSummary = document.querySelector("[data-score-summary-active]");
    var completedSummary = document.querySelector("[data-score-summary-completed]");
    if (!liveGrid) {
        return;
    }

    var state = window.DCFLSiteData && typeof window.DCFLSiteData.getData === "function"
        ? window.DCFLSiteData.getData()
        : null;

    if (completedSummary) {
        completedSummary.textContent = String((state && state.summary && state.summary.completedToday) || "0");
    }

    if (!state || !Array.isArray(state.liveMatches)) {
        liveGrid.innerHTML = "";
        if (activeSummary) {
            activeSummary.textContent = "0";
        }
        return;
    }

    function asNumber(value) {
        var normalized = String(value == null ? "" : value).replace(",", ".");
        var number = Number(normalized);
        return Number.isFinite(number) ? number : null;
    }

    if (!state.liveMatches.length) {
        liveGrid.classList.add("scoreboard-grid-empty");
        liveGrid.innerHTML = [
            "<article class=\"score-card score-card-empty\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">Canl&#305; Skor</p>",
            "    </div>",
            "    <p class=\"score-card-meta score-card-empty-text\">&#350;u an aktif bir kar&#351;&#305;la&#351;ma yok.</p>",
            "</article>"
        ].join("");

        if (activeSummary) {
            activeSummary.textContent = "0";
        }
        return;
    }

    liveGrid.classList.remove("scoreboard-grid-empty");
    liveGrid.innerHTML = state.liveMatches.map(function (match) {
        var homeValue = asNumber(match.homeScore);
        var awayValue = asNumber(match.awayScore);
        var homeLeading = homeValue != null && awayValue != null && homeValue > awayValue;
        var awayLeading = homeValue != null && awayValue != null && awayValue > homeValue;

        return [
            "<article class=\"score-card score-card-live\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + escapeHTML(match.branch) + "</p>",
            "        <span class=\"score-card-badge score-card-badge-live\">" + escapeHTML(match.status) + "</span>",
            "    </div>",
            "    <div class=\"score-card-teams\">",
            "        <div class=\"score-card-team" + (homeLeading ? " is-leading" : "") + "\">",
            "            <strong>" + escapeHTML(match.home) + "</strong>",
            "            <span class=\"score-card-score\">" + escapeHTML(match.homeScore) + "</span>",
            "        </div>",
            "        <div class=\"score-card-team" + (awayLeading ? " is-leading" : "") + "\">",
            "            <strong>" + escapeHTML(match.away) + "</strong>",
            "            <span class=\"score-card-score\">" + escapeHTML(match.awayScore) + "</span>",
            "        </div>",
            "    </div>",
            "    <p class=\"score-card-meta\">" + escapeHTML(match.meta) + "</p>",
            "</article>"
        ].join("");
    }).join("");

    if (activeSummary) {
        activeSummary.textContent = String(state.liveMatches.length);
    }
}

(function () {
    renderLiveScoreboard();
})();

(function () {
    var form = document.querySelector("[data-contact-form]");
    var status = document.querySelector("[data-contact-form-status]");
    var bridge = window.DCFLSupabaseBridge || null;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form) {
        return;
    }

    function setStatus(text, tone) {
        if (!status) {
            return;
        }
        status.textContent = text;
        status.setAttribute("data-tone", tone || "info");
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!bridge || !bridge.isConfigured || !bridge.isConfigured() || !bridge.submitContactSubmission) {
            setStatus("Form servisi ge\u00e7ici olarak haz\u0131r de\u011fil. L\u00fctfen do\u011frudan dcflsportfest2020@gmail.com adresine yaz.", "error");
            return;
        }

        var formData = new FormData(form);
        var payload = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            topic: String(formData.get("topic") || "").trim(),
            message: String(formData.get("message") || "").trim()
        };

        if (form.hasAttribute("data-athlete-application")) {
            var teacherName = String(formData.get("teacher_name") || "").trim();
            var teacherPhone = String(formData.get("teacher_phone") || "").trim();
            var studentCount = String(formData.get("student_count") || "").trim();
            var extraMessage = [
                "Ad Soyad / Okul Adi: " + payload.name,
                "Katilim Saglanan Brans: " + payload.topic,
                "Sorumlu Beden Ogretmeni: " + teacherName,
                "Sorumlu Beden Ogretmeni Telefon Numarasi: " + teacherPhone,
                "Sorumlu Beden Ogretmeni E-Posta: " + payload.email,
                "Gelecek Sporcu Ogrenci Sayisi: " + studentCount
            ];

            if (payload.message) {
                extraMessage.push("Ek Notlar: " + payload.message);
            }

            payload.topic = "Sporcu Basvurusu | " + payload.topic;
            payload.message = extraMessage.join("\n");
        }

        if (
            payload.name.length < 2 ||
            !emailPattern.test(payload.email) ||
            payload.topic.length < 2 ||
            payload.message.length < 6
        ) {
            setStatus("L\u00fctfen ad soyad, ge\u00e7erli e-posta, konu ve en az 6 karakterlik mesaj alanlar\u0131n\u0131 do\u011fru doldur.", "warning");
            return;
        }

        try {
            setStatus("Mesaj g\u00f6nderiliyor...", "info");
            await bridge.submitContactSubmission(payload);
            form.reset();
            setStatus("Mesaj\u0131n g\u00f6nderildi. En k\u0131sa s\u00fcrede d\u00f6n\u00fc\u015f sa\u011flanacak.", "success");
        } catch (error) {
            var errorMessage = error && error.message ? error.message : "Bilinmeyen hata";
            if (errorMessage === "Invalid contact payload") {
                errorMessage = "L\u00fctfen ad soyad, ge\u00e7erli e-posta, konu ve mesaj alanlar\u0131n\u0131 eksiksiz doldur.";
            }
            setStatus("Mesaj g\u00f6nderilemedi: " + errorMessage, "error");
        }
    });
})();

(function () {
    if (!window.DCFLSiteData || typeof window.DCFLSiteData.loadData !== "function") {
        return;
    }

    window.DCFLSiteData.loadData();

    window.addEventListener("dcfl-site-data-updated", function () {
        renderLiveScoreboard();
        if (typeof renderScoreResults === "function") {
            renderScoreResults((document.documentElement.getAttribute("lang") || "tr").toLowerCase());
        }
        if (typeof renderProgramFixtures === "function") {
            renderProgramFixtures((document.documentElement.getAttribute("lang") || "tr").toLowerCase());
        }
    });
})();

(function () {
    var output = document.querySelector("[data-last-push-time]");
    if (!output) {
        return;
    }

    var repoApi = "https://api.github.com/repos/dcflsportfest/dcflsportfest.github.io";
    var cacheKey = "dcfl_repo_push_meta_v1";
    var cachedFallbackPushAt = null;
    var isShowingAdminUpdate = false;

    function getLocale() {
        var lang = (document.documentElement.getAttribute("lang") || "tr").toLowerCase();
        if (lang === "en") {
            return "en-GB";
        }
        if (lang === "pl") {
            return "pl-PL";
        }
        return "tr-TR";
    }

    function formatTime(isoString) {
        var date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return new Intl.DateTimeFormat(getLocale(), {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Europe/Istanbul"
        }).format(date);
    }

    function formatTooltip(isoString) {
        var date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(getLocale(), {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Europe/Istanbul"
        }).format(date) + " TS\u0130";
    }

    function applyTime(isoString) {
        var formatted = formatTime(isoString);
        if (!formatted) {
            return false;
        }

        output.textContent = formatted;
        output.setAttribute("datetime", isoString);
        output.setAttribute("title", formatTooltip(isoString));
        return true;
    }

    function readAdminUpdatedAt(detail) {
        if (detail && detail.updatedAt) {
            return detail.updatedAt;
        }

        if (window.DCFLSiteData && typeof window.DCFLSiteData.getLastUpdatedAt === "function") {
            return window.DCFLSiteData.getLastUpdatedAt();
        }

        return null;
    }

    function applyAdminUpdatedAt(detail) {
        var updatedAt = readAdminUpdatedAt(detail);
        if (!updatedAt) {
            isShowingAdminUpdate = false;
            if (cachedFallbackPushAt) {
                applyTime(cachedFallbackPushAt);
            }
            return false;
        }

        var applied = applyTime(updatedAt);
        if (applied) {
            isShowingAdminUpdate = true;
        }
        return applied;
    }

    function applyFallbackPushTime(isoString) {
        cachedFallbackPushAt = isoString || cachedFallbackPushAt;
        if (isShowingAdminUpdate || !cachedFallbackPushAt) {
            return false;
        }
        return applyTime(cachedFallbackPushAt);
    }

    window.addEventListener("dcfl-site-data-updated", function (event) {
        applyAdminUpdatedAt(event && event.detail ? event.detail : null);
    });

    applyAdminUpdatedAt();

    try {
        var cachedRaw = window.localStorage.getItem(cacheKey);
        if (cachedRaw) {
            var cached = JSON.parse(cachedRaw);
            if (cached && cached.pushedAt) {
                applyFallbackPushTime(cached.pushedAt);
            }
        }
    } catch (error) {
        // Ignore localStorage access failures.
    }

    fetch(repoApi, {
        headers: {
            "Accept": "application/vnd.github+json"
        }
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("GitHub push time request failed");
        }
        return response.json();
    }).then(function (repoData) {
        if (!repoData || !repoData.pushed_at) {
            return;
        }

        applyFallbackPushTime(repoData.pushed_at);

        try {
            window.localStorage.setItem(cacheKey, JSON.stringify({
                pushedAt: repoData.pushed_at,
                cachedAt: Date.now()
            }));
        } catch (error) {
            // Ignore localStorage write failures.
        }
    }).catch(function () {
        // Keep the fallback time already rendered in HTML.
    });
})();

function initializeFixtureTabGroups(root) {
    var scope = root || document;
    var tabGroups = scope.querySelectorAll("[data-fixture-tabs]");
    if (!tabGroups.length) {
        return;
    }

    tabGroups.forEach(function (group) {
        if (group.getAttribute("data-fixture-ready") === "true") {
            return;
        }

        var tabs = Array.prototype.filter.call(group.children, function (child) {
            return child && child.nodeType === 1 && child.hasAttribute("data-fixture-tab");
        });
        if (!tabs.length) {
            return;
        }

        var panelsContainer = group.nextElementSibling;
        if (!panelsContainer || !panelsContainer.querySelector || !panelsContainer.querySelector("[data-fixture-panel]")) {
            if (group.parentElement && group.parentElement.nextElementSibling && group.parentElement.nextElementSibling.querySelector && group.parentElement.nextElementSibling.querySelector("[data-fixture-panel]")) {
                panelsContainer = group.parentElement.nextElementSibling;
            }
        }
        if (!panelsContainer) {
            return;
        }

        var panels = Array.prototype.filter.call(panelsContainer.children, function (child) {
            return child && child.nodeType === 1 && child.hasAttribute("data-fixture-panel");
        });

        function activate(branch) {
            tabs.forEach(function (tab) {
                var isActive = tab.getAttribute("data-fixture-tab") === branch;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            panels.forEach(function (panel) {
                var isActive = panel.getAttribute("data-fixture-panel") === branch;
                panel.classList.toggle("active", isActive);
                panel.setAttribute("aria-hidden", isActive ? "false" : "true");
            });
        }

        tabs.forEach(function (tab) {
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", tab.classList.contains("active") ? "true" : "false");
            tab.addEventListener("click", function () {
                activate(tab.getAttribute("data-fixture-tab"));
            });
        });

        panels.forEach(function (panel) {
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-hidden", panel.classList.contains("active") ? "false" : "true");
        });

        group.setAttribute("data-fixture-ready", "true");

        var initiallyActive = tabs.find(function (tab) {
            return tab.classList.contains("active");
        });
        activate(initiallyActive ? initiallyActive.getAttribute("data-fixture-tab") : tabs[0].getAttribute("data-fixture-tab"));
    });
}

function initializeFixtureDateGroups(root) {
    var scope = root || document;
    var dateGroups = scope.querySelectorAll("[data-fixture-date-group]");
    if (!dateGroups.length) {
        return;
    }

    dateGroups.forEach(function (group) {
        if (group.getAttribute("data-fixture-date-ready") === "true") {
            return;
        }

        var tabs = group.querySelectorAll("[data-fixture-date-tab]");
        if (!tabs.length) {
            return;
        }

        var hostPanel = group.closest("[data-fixture-date-host]") || group.parentElement;
        if (!hostPanel) {
            return;
        }

        var placeholders = hostPanel.querySelectorAll("[data-fixture-date-placeholder]");
        var targets = hostPanel.querySelectorAll("[data-fixture-date-target]");

        function buildMessage(baseText, dateLabel) {
            return dateLabel ? (dateLabel + " • " + baseText) : baseText;
        }

        function activate(dateLabel) {
            tabs.forEach(function (tab) {
                var isActive = tab.getAttribute("data-fixture-date-tab") === dateLabel;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-pressed", isActive ? "true" : "false");
            });

            placeholders.forEach(function (placeholder) {
                var baseText = placeholder.getAttribute("data-placeholder-base") || placeholder.textContent || "";
                placeholder.textContent = buildMessage(baseText, dateLabel);
            });

            targets.forEach(function (target) {
                var isActive = target.getAttribute("data-fixture-date-target") === dateLabel;
                target.hidden = !isActive;
                target.classList.toggle("active", isActive);
            });
        }

        tabs.forEach(function (tab) {
            tab.setAttribute("type", "button");
            tab.setAttribute("aria-pressed", tab.classList.contains("active") ? "true" : "false");
            tab.addEventListener("click", function () {
                activate(tab.getAttribute("data-fixture-date-tab"));
            });
        });

        group.setAttribute("data-fixture-date-ready", "true");

        var initiallyActive = group.querySelector("[data-fixture-date-tab].active");
        activate(initiallyActive ? initiallyActive.getAttribute("data-fixture-date-tab") : tabs[0].getAttribute("data-fixture-date-tab"));
    });
}

var renderScoreResults = (function () {
    var uiCopy = {
        tr: {
            dayTabsAria: "G\u00fcnlere g\u00f6re sonu\u00e7lar",
            dayCaptions: {
                "12-mayis": "Bran\u015fa g\u00f6re \u00e7eyrek final ma\u00e7lar\u0131",
                "13-mayis": "Bran\u015fa g\u00f6re yar\u0131 final ma\u00e7lar\u0131",
                "14-mayis": "Bran\u015fa g\u00f6re final ma\u00e7lar\u0131"
            },
            empty: "Hen\u00fcz bir ma\u00e7 oynanmad\u0131.",
            resultsTitle: function (branchName) {
                return branchName + " Sonu\u00e7lar\u0131";
            },
            rounds: {
                qf: "\u00c7eyrek Final",
                sf: "Yar\u0131 Final",
                final: "Final"
            },
            statuses: {
                pending: "Oynanmad\u0131",
                completed: "Tamamland\u0131"
            },
            placeholders: {
                qfWinner: "\u00c7F {n} Galibi",
                sfWinner: "YF {n} Galibi"
            }
        },
        en: {
            dayTabsAria: "Results by day",
            dayCaptions: {
                "12-mayis": "Quarter-final matches by branch",
                "13-mayis": "Semi-final matches by branch",
                "14-mayis": "Final matches by branch"
            },
            empty: "No matches have been played yet.",
            resultsTitle: function (branchName) {
                return branchName + " Results";
            },
            rounds: {
                qf: "Quarter-final",
                sf: "Semi-final",
                final: "Final"
            },
            statuses: {
                pending: "Not Played",
                completed: "Completed"
            },
            placeholders: {
                qfWinner: "QF {n} Winner",
                sfWinner: "SF {n} Winner"
            }
        },
        pl: {
            dayTabsAria: "Wyniki wedlug dni",
            dayCaptions: {
                "12-mayis": "Mecze cwiercfinalowe wedlug dyscyplin",
                "13-mayis": "Mecze polfinalowe wedlug dyscyplin",
                "14-mayis": "Mecze finalowe wedlug dyscyplin"
            },
            empty: "Nie rozegrano jeszcze zadnego meczu.",
            resultsTitle: function (branchName) {
                return "Wyniki: " + branchName;
            },
            rounds: {
                qf: "Cwiercfinal",
                sf: "Polfinal",
                final: "Final"
            },
            statuses: {
                pending: "Nie rozegrano",
                completed: "Zakonczono"
            },
            placeholders: {
                qfWinner: "Zwyciezca CF {n}",
                sfWinner: "Zwyciezca PF {n}"
            }
        }
    };

    var days = [
        {
            key: "12-mayis",
            stage: "qf",
            label: { tr: "12 May\u0131s", en: "May 12", pl: "12 maja" },
            fullDate: { tr: "12 May\u0131s 2026", en: "May 12, 2026", pl: "12 maja 2026" }
        },
        {
            key: "13-mayis",
            stage: "sf",
            label: { tr: "13 May\u0131s", en: "May 13", pl: "13 maja" },
            fullDate: { tr: "13 May\u0131s 2026", en: "May 13, 2026", pl: "13 maja 2026" }
        },
        {
            key: "14-mayis",
            stage: "final",
            label: { tr: "14 May\u0131s", en: "May 14", pl: "14 maja" },
            fullDate: { tr: "14 May\u0131s 2026", en: "May 14, 2026", pl: "14 maja 2026" }
        }
    ];

    var branchTemplates = [
        {
            key: "voleybol",
            name: { tr: "Voleybol", en: "Volleyball", pl: "Siatkowka" },
            venue: { tr: "Kapal\u0131 Spor Salonu", en: "Indoor Hall", pl: "Hala sportowa" },
            qf: {
                times: ["10:00", "11:30", "14:00", "15:30"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["2", "0"], ["2", "1"], ["2", "1"], ["0", "2"]]
            },
            sf: { times: ["11:00", "14:00"], scores: [["2", "1"], ["1", "2"]] },
            final: { time: "16:00", score: ["3", "1"] }
        },
        {
            key: "basketbol",
            name: { tr: "Basketbol", en: "Basketball", pl: "Koszykowka" },
            venue: { tr: "Basketbol Sahas\u0131", en: "Basketball Court", pl: "Boisko do koszykowki" },
            qf: {
                times: ["09:30", "11:30", "13:30", "15:30"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["66", "58"], ["63", "71"], ["74", "69"], ["61", "67"]]
            },
            sf: { times: ["12:00", "16:00"], scores: [["78", "72"], ["70", "76"]] },
            final: { time: "17:00", score: ["81", "77"] }
        },
        {
            key: "futbol",
            name: { tr: "Futbol", en: "Football", pl: "Pilka Nozna" },
            venue: { tr: "\u00c7im Saha", en: "Grass Field", pl: "Boisko trawiaste" },
            qf: {
                times: ["10:30", "12:30", "14:30", "16:30"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["2", "0"], ["1", "2"], ["3", "1"], ["2", "1"]]
            },
            sf: { times: ["12:30", "15:30"], scores: [["2", "1"], ["1", "0"]] },
            final: { time: "18:00", score: ["2", "1"] }
        },
        {
            key: "masa-tenisi",
            name: { tr: "Masa Tenisi", en: "Table Tennis", pl: "Tenis Stolowy" },
            venue: { tr: "Masa Tenisi Alan\u0131", en: "Table Tennis Zone", pl: "Strefa tenisa stolowego" },
            qf: {
                times: ["11:00", "12:00", "15:00", "16:00"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["3", "1"], ["3", "2"], ["1", "3"], ["3", "0"]]
            },
            sf: { times: ["13:00", "15:00"], scores: [["3", "1"], ["2", "3"]] },
            final: { time: "11:30", score: ["3", "2"] }
        },
        {
            key: "okculuk",
            name: { tr: "Ok\u00e7uluk", en: "Archery", pl: "Lucznictwo" },
            venue: { tr: "Ok\u00e7uluk Parkuru", en: "Archery Range", pl: "Tor luczniczy" },
            qf: {
                times: ["10:00", "11:00", "13:00", "14:00"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["122", "118"], ["117", "120"], ["119", "121"], ["123", "119"]]
            },
            sf: { times: ["14:30", "16:00"], scores: [["125", "121"], ["120", "124"]] },
            final: { time: "12:30", score: ["128", "126"] }
        },
        {
            key: "oryantiring",
            name: { tr: "Oryantiring", en: "Orienteering", pl: "Bieg na Orientacje" },
            venue: { tr: "Kamp\u00fcs Alan\u0131", en: "Campus Course", pl: "Trasa kampusowa" },
            lowWins: true,
            qf: {
                times: ["09:45", "10:30", "12:45", "13:30"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["38:14", "40:02"], ["37:44", "38:31"], ["39:10", "37:52"], ["36:58", "37:21"]]
            },
            sf: { times: ["10:45", "13:45"], scores: [["35:40", "36:12"], ["36:08", "35:49"]] },
            final: { time: "10:15", score: ["34:08", "35:21"] }
        },
        {
            key: "bahce-satranci",
            name: { tr: "Bah\u00e7e Satranc\u0131", en: "Garden Chess", pl: "Szachy Ogrodowe" },
            venue: { tr: "Bah\u00e7e Satran\u00e7 Alan\u0131", en: "Garden Chess Zone", pl: "Strefa szachow ogrodowych" },
            qf: {
                times: ["11:30", "12:30", "16:00", "17:00"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["1", "0"], ["0", "1"], ["1", "0"], ["0", "1"]]
            },
            sf: { times: ["12:00", "15:00"], scores: [["1", "0"], ["1", "0"]] },
            final: { time: "13:30", score: ["1", "0"] }
        },
        {
            key: "playstation",
            name: { tr: "PlayStation", en: "PlayStation", pl: "PlayStation" },
            venue: { tr: "E-Spor Alan\u0131", en: "E-Sports Area", pl: "Strefa e-sportu" },
            qf: {
                times: ["10:15", "11:15", "14:15", "15:15"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["3", "2"], ["1", "3"], ["2", "3"], ["3", "1"]]
            },
            sf: { times: ["15:30", "17:00"], scores: [["2", "3"], ["3", "1"]] },
            final: { time: "12:00", score: ["2", "3"] }
        },
        {
            key: "atletizm",
            name: { tr: "Atletizm", en: "Athletics", pl: "Lekkoatletyka" },
            venue: { tr: "Atletizm Pisti", en: "Athletics Track", pl: "Tor lekkoatletyczny" },
            lowWins: true,
            qf: {
                times: ["09:00", "10:00", "11:15", "12:15"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["11.52", "11.68"], ["11.61", "11.57"], ["11.74", "11.66"], ["11.69", "11.72"]]
            },
            sf: { times: ["14:00", "16:30"], scores: [["11.48", "11.54"], ["11.59", "11.53"]] },
            final: { time: "15:00", score: ["11.38", "11.44"] }
        },
        {
            key: "bahce-oyunlari",
            name: { tr: "Bah\u00e7e Oyunlar\u0131", en: "Garden Games", pl: "Gry Ogrodowe" },
            venue: { tr: "Bah\u00e7e Etkinlik Alan\u0131", en: "Garden Activity Zone", pl: "Strefa gier ogrodowych" },
            qf: {
                times: ["10:45", "11:45", "13:45", "14:45"],
                pairs: [["Tak\u0131m 1", "Tak\u0131m 8"], ["Tak\u0131m 2", "Tak\u0131m 7"], ["Tak\u0131m 3", "Tak\u0131m 6"], ["Tak\u0131m 4", "Tak\u0131m 5"]],
                scores: [["21", "18"], ["19", "23"], ["24", "20"], ["17", "22"]]
            },
            sf: { times: ["16:15", "17:30"], scores: [["26", "21"], ["18", "24"]] },
            final: { time: "11:45", score: ["27", "25"] }
        }
    ];

    function getScoreData() {
        if (window.DCFLSiteData && typeof window.DCFLSiteData.getData === "function") {
            return window.DCFLSiteData.getData();
        }

        return {
            publishResults: false,
            branchTemplates: branchTemplates
        };
    }

    function pickText(value, lang) {
        if (value && typeof value === "object") {
            return value[lang] || value.tr || value.en || value.pl || "";
        }
        return value || "";
    }

    function formatTemplate(template, number) {
        return String(template || "").replace("{n}", String(number));
    }

    function buildPlaceholderPair(stageKey, lang, index) {
        var copy = uiCopy[lang] || uiCopy.tr;
        if (stageKey === "sf") {
            return [
                formatTemplate(copy.placeholders.qfWinner, index * 2 + 1),
                formatTemplate(copy.placeholders.qfWinner, index * 2 + 2)
            ];
        }

        if (stageKey === "final") {
            return [
                formatTemplate(copy.placeholders.sfWinner, 1),
                formatTemplate(copy.placeholders.sfWinner, 2)
            ];
        }

        return ["", ""];
    }

    function hasPlayableScore(score, publishResults) {
        return publishResults && Array.isArray(score) && score.length === 2 && score[0] != null && score[1] != null;
    }

    function scoreToNumber(value) {
        if (typeof value !== "string") {
            return Number(value) || 0;
        }
        if (/^\d+:\d+$/.test(value)) {
            var parts = value.split(":");
            return Number(parts[0]) * 60 + Number(parts[1]);
        }
        return Number(value);
    }

    function getWinnerKey(score, lowWins, publishResults) {
        if (!hasPlayableScore(score, publishResults)) {
            return null;
        }
        var homeValue = scoreToNumber(score[0]);
        var awayValue = scoreToNumber(score[1]);
        if (lowWins) {
            return homeValue <= awayValue ? "home" : "away";
        }
        return homeValue >= awayValue ? "home" : "away";
    }

    function buildStageLabel(stageKey, index, lang) {
        var copy = uiCopy[lang] || uiCopy.tr;
        if (stageKey === "final") {
            return copy.rounds.final;
        }
        return copy.rounds[stageKey] + " " + String(index + 1);
    }

    function createMatch(day, template, stageKey, index, time, home, away, score, lang, publishResults) {
        var copy = uiCopy[lang] || uiCopy.tr;
        var hasScore = hasPlayableScore(score, publishResults);
        var winner = hasScore ? getWinnerKey(score, !!template.lowWins, publishResults) : null;
        var normalizedScore = hasScore ? score : ["-", "-"];
        return {
            stage: buildStageLabel(stageKey, index, lang),
            time: time,
            home: home,
            away: away,
            homeScore: normalizedScore[0],
            awayScore: normalizedScore[1],
            winner: winner,
            played: hasScore,
            status: hasScore ? copy.statuses.completed : copy.statuses.pending,
            badgeClass: hasScore ? "score-card-badge-final" : "score-card-badge-pending",
            meta: pickText(day.fullDate, lang) + " | " + time + " | " + pickText(template.venue, lang)
        };
    }

    function getWinnerName(match) {
        if (!match || !match.winner) {
            return null;
        }
        return match.winner === "home" ? match.home : match.away;
    }

    function buildMatchesForBranch(template, day, lang, publishResults) {
        var qfMatches = template.qf.pairs.map(function (pair, index) {
            return createMatch(day, template, "qf", index, template.qf.times[index], pair[0], pair[1], template.qf.scores[index], lang, publishResults);
        }).filter(function (_match, index) {
            return !(template.qf.hidden && template.qf.hidden[index]);
        });

        if (day.stage === "qf") {
            return qfMatches;
        }

        var sfPairs = template.sf.pairs || [
            [getWinnerName(qfMatches[0]), getWinnerName(qfMatches[1])],
            [getWinnerName(qfMatches[2]), getWinnerName(qfMatches[3])]
        ];

        if (!publishResults || sfPairs.some(function (pair) { return !pair[0] || !pair[1]; })) {
            sfPairs = [
                buildPlaceholderPair("sf", lang, 0),
                buildPlaceholderPair("sf", lang, 1)
            ];
        }

        var sfMatches = sfPairs.map(function (pair, index) {
            return createMatch(day, template, "sf", index, template.sf.times[index], pair[0], pair[1], template.sf.scores[index], lang, publishResults);
        }).filter(function (_match, index) {
            return !(template.sf.hidden && template.sf.hidden[index]);
        });

        if (day.stage === "sf") {
            return sfMatches;
        }

        var finalPair = template.final.pair || [getWinnerName(sfMatches[0]), getWinnerName(sfMatches[1])];
        if (!publishResults || !finalPair[0] || !finalPair[1]) {
            finalPair = buildPlaceholderPair("final", lang, 0);
        }

        if (template.final.hidden) {
            return [];
        }

        return [
            createMatch(day, template, "final", 0, template.final.time, finalPair[0], finalPair[1], template.final.score, lang, publishResults)
        ];
    }

    function renderResultMatchCard(match) {
        var homeClass = match.winner === "home" ? " is-leading" : "";
        var awayClass = match.winner === "away" ? " is-leading" : "";

        return [
            "<article class=\"score-card score-card-result" + (match.played ? "" : " is-pending") + "\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + match.stage + "</p>",
            "        <span class=\"score-card-badge " + match.badgeClass + "\">" + match.status + "</span>",
            "    </div>",
            "    <div class=\"score-card-teams\">",
            "        <div class=\"score-card-team" + homeClass + "\">",
            "            <strong>" + match.home + "</strong>",
            "            <span class=\"score-card-score\">" + match.homeScore + "</span>",
            "        </div>",
            "        <div class=\"score-card-team" + awayClass + "\">",
            "            <strong>" + match.away + "</strong>",
            "            <span class=\"score-card-score\">" + match.awayScore + "</span>",
            "        </div>",
            "    </div>",
            "    <p class=\"score-card-meta\">" + match.meta + "</p>",
            "</article>"
        ].join("");
    }

    function renderDayPanel(day, lang, dayUi, isActive, templates, publishResults, resultsCount) {
        var branchTabs = templates.map(function (branch, index) {
            return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-fixture-tab=\"" + branch.key + "\">" + pickText(branch.name, lang) + "</button>";
        }).join("");

        var branchPanels = templates.map(function (branch, index) {
            var matches = buildMatchesForBranch(branch, day, lang, publishResults).slice(0, resultsCount);
            var cards = matches.length
                ? matches.map(function (match) { return renderResultMatchCard(match); }).join("")
                : "<p class=\"score-results-empty-branch\">Bu branş için görünür sonuç kartı yok.</p>";

            return [
                "<article class=\"fixture-panel score-results-branch-panel" + (index === 0 ? " active" : "") + "\" data-fixture-panel=\"" + branch.key + "\">",
                "    <h3>" + dayUi.resultsTitle(pickText(branch.name, lang)) + "</h3>",
                "    <div class=\"scoreboard-grid score-results-grid\">",
                cards,
                "    </div>",
                "</article>"
            ].join("");
        }).join("");

        return [
            "<section class=\"score-results-day-panel" + (isActive ? " active" : "") + "\" id=\"score-results-" + day.key + "\" data-score-day-panel=\"" + day.key + "\" aria-hidden=\"" + (isActive ? "false" : "true") + "\">",
            "    <div class=\"score-results-head\">",
            "        <p class=\"score-results-date\">" + pickText(day.fullDate, lang) + "</p>",
            "        <p class=\"score-results-caption\">" + dayUi.dayCaptions[day.key] + "</p>",
            "    </div>",
            "    <div class=\"fixture-tabs score-results-branch-tabs\" data-fixture-tabs>",
            "        " + branchTabs,
            "    </div>",
            "    <div class=\"fixture-panels\">",
            "        " + branchPanels,
            "    </div>",
            "</section>"
        ].join("");
    }

    return function (lang) {
        var currentLang = uiCopy[lang] ? lang : "tr";
        var dayUi = uiCopy[currentLang];
        var state = getScoreData();
        var templates = Array.isArray(state.branchTemplates) && state.branchTemplates.length ? state.branchTemplates : branchTemplates;
        var publishResults = !!state.publishResults;
        var resultsCount = Math.max(0, Number(state.summary && state.summary.resultsCount != null ? state.summary.resultsCount : 4) || 0);
        var shells = document.querySelectorAll("[data-score-results]");
        if (!shells.length) {
            return;
        }

        shells.forEach(function (shell) {
            if (resultsCount === 0) {
                shell.innerHTML = [
                    "<div class=\"score-results-empty\">",
                    "    <p class=\"score-results-empty-text\">" + dayUi.empty + "</p>",
                    "</div>"
                ].join("");
                return;
            }

            shell.innerHTML = [
                "<div class=\"fixture-tabs score-results-day-tabs\" data-score-day-tabs role=\"tablist\" aria-label=\"" + dayUi.dayTabsAria + "\">",
                days.map(function (day, index) {
                    return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-score-day-tab=\"" + day.key + "\" aria-selected=\"" + (index === 0 ? "true" : "false") + "\">" + pickText(day.label, currentLang) + "</button>";
                }).join(""),
                "</div>",
                "<div class=\"score-results-day-panels\">",
                days.map(function (day) {
                    return renderDayPanel(day, currentLang, dayUi, day.key === days[0].key, templates, publishResults, resultsCount);
                }).join(""),
                "</div>"
            ].join("");

            var dayTabs = Array.prototype.slice.call(shell.querySelectorAll("[data-score-day-tab]"));
            var dayPanels = Array.prototype.slice.call(shell.querySelectorAll("[data-score-day-panel]"));

            function activateDay(dayKey) {
                dayTabs.forEach(function (tab) {
                    var isActive = tab.getAttribute("data-score-day-tab") === dayKey;
                    tab.classList.toggle("active", isActive);
                    tab.setAttribute("aria-selected", isActive ? "true" : "false");
                });

                dayPanels.forEach(function (panel) {
                    var isActive = panel.getAttribute("data-score-day-panel") === dayKey;
                    panel.classList.toggle("active", isActive);
                    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
                });
            }

            dayTabs.forEach(function (tab) {
                tab.setAttribute("role", "tab");
                tab.addEventListener("click", function () {
                    activateDay(tab.getAttribute("data-score-day-tab"));
                });
            });

            dayPanels.forEach(function (panel) {
                panel.setAttribute("role", "tabpanel");
            });

            activateDay(days[0].key);
            initializeFixtureTabGroups(shell);
        });
    };
})();

(function () {
    initializeFixtureTabGroups(document);
    initializeFixtureDateGroups(document);
    if (document.querySelector("[data-score-results]")) {
        renderScoreResults((document.documentElement.getAttribute("lang") || "tr").toLowerCase());
    }
})();

var renderProgramFixtures = (function () {
    var copy = {
        tr: {
            tabsAria: "Branşa göre fikstür seçimi",
            groupTabsAria: "Fikstür ve katılımcı seçimi",
            divisionTabsAria: "Kategori seçimi",
            fixtureSuffix: "Fikstürü",
            participantsSuffix: "Katılımcıları",
            fixturePending: "Fikstür henüz belirlenmedi",
            participantPending: "Katılımcılar belli değil",
            rounds: {
                qf: "Çeyrek Final",
                sf: "Yarı Final",
                final: "Final"
            },
            scheduleKicker: "Maç Akışı",
            note: "8 takımlı eşleşme yapısı 12-13-14 Mayıs akışına göre ilerler.",
            placeholders: {
                qfWinner: "ÇF {n} Galibi",
                sfWinner: "YF {n} Galibi"
            },
            dates: {
                qf: "12 Mayıs",
                sf: "13 Mayıs",
                final: "14 Mayıs"
            },
            groups: {
                fixture: "Fikstür",
                participants: "Katılımcılar"
            },
            branchLabels: {
                basketbol: "Basketbol 3x3",
                "bahce-satranci": "Satranç"
            },
            branchDateHints: {
                voleybol: "12-13 Mayıs",
                "masa-tenisi": "13 Mayıs",
                atletizm: "13-13 Mayıs",
                futbol: "12-13 Mayıs",
                "bahce-satranci": "13 Mayıs",
                oryantiring: "14 Mayıs"
            },
            divisions: {
                kiz: "Kız",
                erkek: "Erkek"
            }
        },
        en: {
            tabsAria: "Fixture selection by branch",
            divisionTabsAria: "Category selection",
            fixtureSuffix: "Fixtures",
            fixturePending: "Fixture has not been announced yet",
            rounds: {
                qf: "Quarter-final",
                sf: "Semi-final",
                final: "Final"
            },
            scheduleKicker: "Match Flow",
            note: "The 8-team bracket progresses according to the May 12-13-14 schedule.",
            placeholders: {
                qfWinner: "QF {n} Winner",
                sfWinner: "SF {n} Winner"
            },
            dates: {
                qf: "May 12",
                sf: "May 13",
                final: "May 14"
            },
            divisions: {
                kiz: "Girls",
                erkek: "Boys",
                katilimcilar: "Participants"
            }
        },
        pl: {
            tabsAria: "Wybor terminarza wedlug dyscyplin",
            divisionTabsAria: "Wybor kategorii",
            fixtureSuffix: "Terminarz",
            fixturePending: "Terminarz nie zostal jeszcze ustalony",
            rounds: {
                qf: "Cwiercfinal",
                sf: "Polfinal",
                final: "Final"
            },
            scheduleKicker: "Przebieg Meczow",
            note: "Drabinka 8 druzyn rozwija sie zgodnie z harmonogramem 12-13-14 maja.",
            placeholders: {
                qfWinner: "Zwyciezca CF {n}",
                sfWinner: "Zwyciezca PF {n}"
            },
            dates: {
                qf: "12 maja",
                sf: "13 maja",
                final: "14 maja"
            },
            divisions: {
                kiz: "Dziewczeta",
                erkek: "Chlopcy",
                katilimcilar: "Uczestnicy"
            }
        }
    };

    var dividedBranches = {
        "voleybol": true,
        "masa-tenisi": true,
        "atletizm": true
    };

    var participantLists = {
        "basketbol": {
            default: [
                "Adnan Menderes Anadolu Lisesi",
                "Doğan Cüceloğlu Fen Lisesi",
                "Fuat Sezgin Fen Lisesi",
                "Bahçelievler Anadolu Lisesi",
                "TEMA Bahçeşehir Koleji",
                "Çapa Fen Lisesi"
            ]
        },
        "futbol": {
            default: [
                "Doğan Cüceloğlu Fen Lisesi",
                "Yaşar Acar Fen Lisesi",
                "Fuat Sezgin Fen Lisesi",
                "Çapa Fen Lisesi"
            ]
        },
        "bahce-satranci": {
            default: [
                "Doğan Cüceloğlu Fen Lisesi",
                "Fuat Sezgin Fen Lisesi",
                "Bahçelievler Anadolu Lisesi",
                "Adnan Menderes Anadolu Lisesi",
                "Müptas Turhan Sosyal Bilimler Lisesi"
            ]
        },
        "atletizm": {
            default: [
                "Doğan Cüceloğlu Fen Lisesi",
                "Fuat Sezgin Fen Lisesi",
                "Orhan Cemal Anadolu Lisesi"
            ]
        },
        "oryantiring": {
            default: [
                "Orhan Cemal Anadolu Lisesi"
            ]
        },
        "voleybol": {
            kiz: [
                "Doğan Cüceloğlu Fen Lisesi",
                "Fuat Sezgin",
                "Çapa Fen",
                "Müptas Turhan Sosyal Bilimler",
                "Yaşar Acar Fen Lisesi"
            ],
            erkek: [
                "Polonya",
                "Doğan Cüceloğlu Fen Lisesi",
                "Fuat Sezgin",
                "Çapa Fen Lisesi",
                "Orhan Gazi Anadolu Lisesi"
            ]
        },
        "masa-tenisi": {
            kiz: [
                "Doğan Cüceloğlu Fen Lisesi",
                "Fuat Sezgin Fen Lisesi",
                "TED Atakent Koleji",
                "Çapa Fen Lisesi"
            ],
            erkek: [
                "Atakent Anadolu",
                "Doğan Cüceloğlu Fen Lisesi",
                "Adnan Menderes Anadolu Lisesi",
                "Fuat Sezgin Fen Lisesi",
                "Bahçelievler Anadolu Lisesi",
                "Müptas Turhan Sosyal Bilimler Lisesi"
            ]
        }
    };

    function formatTemplate(template, number) {
        return String(template || "").replace("{n}", String(number));
    }

    function getTemplatePair(template, stageKey, lang, index) {
        var langCopy = copy[lang] || copy.tr;
        if (stageKey === "qf") {
            return (template.qf.pairs && template.qf.pairs[index]) || ["", ""];
        }
        if (stageKey === "sf") {
            return (template.sf.pairs && template.sf.pairs[index]) || [
                formatTemplate(langCopy.placeholders.qfWinner, index * 2 + 1),
                formatTemplate(langCopy.placeholders.qfWinner, index * 2 + 2)
            ];
        }
        return (template.final.pair && template.final.pair.length === 2 && template.final.pair) || [
            formatTemplate(langCopy.placeholders.sfWinner, 1),
            formatTemplate(langCopy.placeholders.sfWinner, 2)
        ];
    }

    function isPlaceholderPair(pair, stageKey, lang) {
        var langCopy = copy[lang] || copy.tr;
        if (!Array.isArray(pair) || pair.length !== 2) {
            return false;
        }
        if (stageKey === "qf") {
            return false;
        }
        if (stageKey === "sf") {
            return pair[0] === formatTemplate(langCopy.placeholders.qfWinner, 1)
                || pair[0] === formatTemplate(langCopy.placeholders.qfWinner, 3)
                || /Winner|Galibi|Zwyciezca/.test(pair[0]);
        }
        return /Winner|Galibi|Zwyciezca/.test(pair[0]) || /Winner|Galibi|Zwyciezca/.test(pair[1]);
    }

    function renderBracketMatch(stageKey, label, dateLabel, time, pair, score, lang, seedA, seedB) {
        var placeholder = isPlaceholderPair(pair, stageKey, lang);
        var safeScore = Array.isArray(score) && score.length === 2 ? score : ["-", "-"];
        return [
            "<article class=\"bracket-match" + (placeholder ? " bracket-match-placeholder" : "") + "\">",
            "    <p class=\"bracket-match-meta\">" + dateLabel + " &#183; " + time + "</p>",
            "    <div class=\"bracket-team-row\"><span class=\"bracket-seed\">" + seedA + "</span><span class=\"bracket-team-name\">" + escapeHTML(pair[0]) + "</span><span class=\"bracket-team-score\">" + escapeHTML(safeScore[0] || "-") + "</span></div>",
            "    <div class=\"bracket-team-row\"><span class=\"bracket-seed\">" + seedB + "</span><span class=\"bracket-team-name\">" + escapeHTML(pair[1]) + "</span><span class=\"bracket-team-score\">" + escapeHTML(safeScore[1] || "-") + "</span></div>",
            "</article>"
        ].join("");
    }

    function renderScheduleItem(dateLabel, time, stageLabel, pair, venue) {
        return [
            "<article class=\"fixture-schedule-item\" data-fixture-date-target=\"" + escapeHTML(dateLabel) + "\">",
            "    <span class=\"fixture-schedule-time\">" + dateLabel + " &#183; " + time + "</span>",
            "    <strong>" + stageLabel + "</strong>",
            "    <p>" + escapeHTML(pair[0]) + " vs " + escapeHTML(pair[1]) + " &#183; " + escapeHTML(venue) + "</p>",
            "</article>"
        ].join("");
    }

    function getProgramBranchLabel(template, lang) {
        var langCopy = copy[lang] || copy.tr;
        if (langCopy.branchLabels && langCopy.branchLabels[template.key]) {
            return langCopy.branchLabels[template.key];
        }
        return pickLocalizedText(template.name, lang);
    }

    function getBranchDateHint(template, lang) {
        var langCopy = copy[lang] || copy.tr;
        return langCopy.branchDateHints && langCopy.branchDateHints[template.key]
            ? langCopy.branchDateHints[template.key]
            : "";
    }

    function getBranchDateOptions(template, lang) {
        var hint = getBranchDateHint(template, lang);
        var rangeMatch;

        if (!hint) {
            return [];
        }

        rangeMatch = hint.match(/^(\d+)\s*-\s*(\d+)\s+(.+)$/);
        if (rangeMatch) {
            if (rangeMatch[1] === rangeMatch[2]) {
                return [rangeMatch[1] + " " + rangeMatch[3]];
            }
            return [
                rangeMatch[1] + " " + rangeMatch[3],
                rangeMatch[2] + " " + rangeMatch[3]
            ];
        }

        return [hint];
    }

    function createDivisionTemplates(template, lang) {
        var langCopy = copy[lang] || copy.tr;
        if (!dividedBranches[template.key]) {
            return [template];
        }

        if (Array.isArray(template.divisions) && template.divisions.length) {
            return template.divisions.map(function (division, index) {
                return {
                    key: division.key || (template.key + "-division-" + index),
                    slug: division.slug || "",
                    branchKey: template.key,
                    name: division.name || {
                        tr: (pickLocalizedText(template.name, "tr") + " - " + (langCopy.divisions[division.slug] || division.slug || "")),
                        en: (pickLocalizedText(template.name, "en") + " - " + (langCopy.divisions[division.slug] || division.slug || "")),
                        pl: (pickLocalizedText(template.name, "pl") + " - " + (langCopy.divisions[division.slug] || division.slug || ""))
                    },
                    venue: division.venue || template.venue,
                    lowWins: typeof division.lowWins === "boolean" ? division.lowWins : template.lowWins,
                    qf: division.qf || template.qf,
                    sf: division.sf || template.sf,
                    final: division.final || template.final
                };
            });
        }

        return ["kiz", "erkek"].map(function (slug) {
            return {
                key: template.key + "-" + slug,
                slug: slug,
                branchKey: template.key,
                shortLabel: langCopy.divisions[slug],
                name: {
                    tr: pickLocalizedText(template.name, "tr") + " - " + copy.tr.divisions[slug],
                    en: pickLocalizedText(template.name, "en") + " - " + copy.en.divisions[slug],
                    pl: pickLocalizedText(template.name, "pl") + " - " + copy.pl.divisions[slug]
                },
                venue: template.venue,
                lowWins: template.lowWins,
                qf: template.qf,
                sf: template.sf,
                final: template.final
            };
        });
    }

    function getParticipantItems(template, mode) {
        var branchKey;
        var branchLists;
        var inferredSlug = "";

        if (mode !== "participants") {
            return [];
        }

        branchKey = template.branchKey || template.key;
        branchLists = participantLists[branchKey];
        if (!branchLists) {
            return [];
        }

        if (!template.slug && typeof template.key === "string") {
            if (/\-kiz$/.test(template.key)) {
                inferredSlug = "kiz";
            } else if (/\-erkek$/.test(template.key)) {
                inferredSlug = "erkek";
            }
        }

        if (template.slug && Array.isArray(branchLists[template.slug])) {
            return branchLists[template.slug];
        }

        if (inferredSlug && Array.isArray(branchLists[inferredSlug])) {
            return branchLists[inferredSlug];
        }

        if (Array.isArray(branchLists.default)) {
            return branchLists.default;
        }

        return [];
    }

    function renderDivisionPlaceholderBody(template, lang, mode, selectedDate) {
        var langCopy = copy[lang] || copy.tr;
        var suffix = mode === "participants" ? langCopy.participantsSuffix : langCopy.fixtureSuffix;
        var pendingText = mode === "participants" ? langCopy.participantPending : langCopy.fixturePending;
        var message = selectedDate ? (selectedDate + " • " + pendingText) : pendingText;
        var participantItems = getParticipantItems(template, mode);

        if (participantItems.length) {
            return [
                "    <h3>" + escapeHTML(getProgramBranchLabel(template, lang)) + " " + suffix + "</h3>",
                "    <ul class=\"fixture-participant-list\">",
                participantItems.map(function (item) {
                    return "        <li>" + escapeHTML(item) + "</li>";
                }).join(""),
                "    </ul>"
            ].join("");
        }

        return [
            "    <h3>" + escapeHTML(getProgramBranchLabel(template, lang)) + " " + suffix + "</h3>",
            "    <div class=\"fixture-placeholder-state\">",
            "        <p class=\"fixture-placeholder-text\" data-fixture-date-placeholder data-placeholder-base=\"" + escapeHTML(pendingText) + "\">" + escapeHTML(message) + "</p>",
            "    </div>"
        ].join("");
    }

    function renderDivisionGroup(template, lang, mode) {
        var divisions = createDivisionTemplates(template, lang);
        var dateOptions = getBranchDateOptions(template, lang);
        return [
            "    <div class=\"fixture-division-group\" data-fixture-date-host>",
            "    <div class=\"fixture-subtabs-row\">",
            "        <div class=\"fixture-tabs fixture-subtabs\" data-fixture-tabs role=\"tablist\" aria-label=\"" + (copy[lang] || copy.tr).divisionTabsAria + "\">",
            divisions.map(function (division, divisionIndex) {
                var shortLabel = division.shortLabel || pickLocalizedText(division.name, lang);
                return "<button type=\"button\" class=\"fixture-tab" + (divisionIndex === 0 ? " active" : "") + "\" data-fixture-tab=\"" + division.key + "-" + mode + "\">" + escapeHTML(shortLabel) + "</button>";
            }).join(""),
            "        </div>",
            (dateOptions.length ? [
                "        <div class=\"fixture-date-tabs\" data-fixture-date-group>",
                dateOptions.map(function (dateLabel, dateIndex) {
                    return "            <button class=\"fixture-date-pill" + (dateIndex === 0 ? " active" : "") + "\" data-fixture-date-tab=\"" + escapeHTML(dateLabel) + "\">" + escapeHTML(dateLabel) + "</button>";
                }).join(""),
                "        </div>"
            ].join("") : ""),
            "    </div>",
            "    <div class=\"fixture-panels\">",
            divisions.map(function (division, divisionIndex) {
                return [
                    "<article class=\"fixture-panel fixture-subpanel" + (divisionIndex === 0 ? " active" : "") + "\" data-fixture-panel=\"" + division.key + "-" + mode + "\">",
                    renderDivisionPlaceholderBody(division, lang, mode, dateOptions[0] || ""),
                    "</article>"
                ].join("");
            }).join(""),
            "    </div>",
            "    </div>"
        ].join("");
    }

    function renderSingleModeGroup(template, lang, mode) {
        var dateOptions = getBranchDateOptions(template, lang);
        return [
            "    <div class=\"fixture-division-group\"" + (dateOptions.length ? " data-fixture-date-host" : "") + ">",
            (dateOptions.length ? [
                "    <div class=\"fixture-subtabs-row fixture-single-date-row\">",
                "        <div class=\"fixture-date-tabs\" data-fixture-date-group>",
                dateOptions.map(function (dateLabel, dateIndex) {
                    return "            <button class=\"fixture-date-pill" + (dateIndex === 0 ? " active" : "") + "\" data-fixture-date-tab=\"" + escapeHTML(dateLabel) + "\">" + escapeHTML(dateLabel) + "</button>";
                }).join(""),
                "        </div>",
                "    </div>"
            ].join("") : ""),
            renderDivisionPlaceholderBody(template, lang, mode, dateOptions[0] || ""),
            "    </div>"
        ].join("");
    }

    function renderFixturePanelBody(template, lang) {
        var langCopy = copy[lang] || copy.tr;
        var dateOptions = getBranchDateOptions(template, lang);

        return [
            "    <div class=\"fixture-division-group\"" + (dateOptions.length ? " data-fixture-date-host" : "") + ">",
            (dateOptions.length ? [
                "    <div class=\"fixture-subtabs-row fixture-single-date-row\">",
                "        <h3>" + escapeHTML(getProgramBranchLabel(template, lang)) + " " + langCopy.fixtureSuffix + "</h3>",
                "        <div class=\"fixture-date-tabs\" data-fixture-date-group>",
                dateOptions.map(function (dateLabel, dateIndex) {
                    return "            <button class=\"fixture-date-pill" + (dateIndex === 0 ? " active" : "") + "\" data-fixture-date-tab=\"" + escapeHTML(dateLabel) + "\">" + escapeHTML(dateLabel) + "</button>";
                }).join(""),
                "        </div>",
                "    </div>"
            ].join("") : "    <h3>" + escapeHTML(getProgramBranchLabel(template, lang)) + " " + langCopy.fixtureSuffix + "</h3>"),
            "    <div class=\"fixture-placeholder-state\">",
            (dateOptions.length ? dateOptions.map(function (dateLabel, dateIndex) {
                return "        <p class=\"fixture-placeholder-text" + (dateIndex === 0 ? " active" : "") + "\" data-fixture-date-target=\"" + escapeHTML(dateLabel) + "\"" + (dateIndex === 0 ? "" : " hidden") + ">" + escapeHTML(dateLabel + " • " + langCopy.fixturePending) + "</p>";
            }).join("") : "        <p class=\"fixture-placeholder-text\">" + escapeHTML(langCopy.fixturePending) + "</p>"),
            "    </div>",
            "    </div>"
        ].join("");
    }

    function renderFixturePanel(template, index, lang) {
        var langCopy = copy[lang] || copy.tr;
        var divisions = createDivisionTemplates(template, lang);
        return [
            "<article class=\"fixture-panel" + (index === 0 ? " active" : "") + "\" data-fixture-panel=\"" + template.key + "\">",
            "    <div class=\"fixture-tabs fixture-subtabs fixture-group-tabs\" data-fixture-tabs role=\"tablist\" aria-label=\"" + langCopy.groupTabsAria + "\">",
            "        <button type=\"button\" class=\"fixture-tab active\" data-fixture-tab=\"" + template.key + "-fixture-group\">" + langCopy.groups.fixture + "</button>",
            "        <button type=\"button\" class=\"fixture-tab\" data-fixture-tab=\"" + template.key + "-participants-group\">" + langCopy.groups.participants + "</button>",
            "    </div>",
            "    <div class=\"fixture-panels\">",
            "        <article class=\"fixture-panel fixture-subpanel active\" data-fixture-panel=\"" + template.key + "-fixture-group\">",
            (divisions.length === 1 ? renderSingleModeGroup(divisions[0], lang, "fixture") : renderDivisionGroup(template, lang, "fixture")),
            "        </article>",
            "        <article class=\"fixture-panel fixture-subpanel\" data-fixture-panel=\"" + template.key + "-participants-group\">",
            (divisions.length === 1 ? renderSingleModeGroup(divisions[0], lang, "participants") : renderDivisionGroup(template, lang, "participants")),
            "        </article>",
            "    </div>",
            "</article>"
        ].join("");
    }

    return function (lang) {
        var currentLang = copy[lang] ? lang : "tr";
        var state = getSharedSiteState();
        var templates = Array.isArray(state.branchTemplates) && state.branchTemplates.length ? state.branchTemplates : [];
        var section = document.querySelector(".fixture-section");
        if (!section) {
            return;
        }

        var head = section.querySelector(".section-head");
        if (!head) {
            return;
        }

        section.innerHTML = [
            head.outerHTML,
            "<div class=\"fixture-tabs\" data-fixture-tabs role=\"tablist\" aria-label=\"" + copy[currentLang].tabsAria + "\">",
            templates.map(function (template, index) {
                return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-fixture-tab=\"" + template.key + "\">" + escapeHTML(getProgramBranchLabel(template, currentLang)) + "</button>";
            }).join(""),
            "</div>",
            "<div class=\"fixture-panels\">",
            templates.map(function (template, index) {
                return renderFixturePanel(template, index, currentLang);
            }).join(""),
            "</div>"
        ].join("");

        initializeFixtureTabGroups(section);
        initializeFixtureDateGroups(section);
    };
})();

(function () {
    var navs = document.querySelectorAll(".top-nav");
    if (!navs.length) {
        return;
    }

    var LANG_KEY = "dcfl_lang";
    var LANGS = ["tr", "en", "pl"];
    var LANG_OPTIONS = [
        { code: "tr", label: "TR" },
        { code: "en", label: "EN" },
        { code: "pl", label: "PL" }
    ];

    var common = {
        tr: {
            menu: "Men\u00fc",
            pickerAria: "Dil",
            nav: {
                "index.html": "Ana Sayfa",
                "kurumsal.html": "Amac\u0131m\u0131z",
                "hizmetler.html": "S\u0131k\u00e7a Sorulanlar",
                "program.html": "Program & Turnuva",
                "finans.html": "Finans",
                "blog.html": "Blog",
                "arsiv.html": "Ar\u015fiv",
                "sporcu-basvuru.html": "Sporcu Ba\u015fvuru",
                "iletisim.html": "\u0130leti\u015fim",
                "turnuva.html": "Program & Turnuva"
            }
        },
        en: {
            menu: "Menu",
            pickerAria: "Language",
            nav: {
                "index.html": "Home",
                "kurumsal.html": "Purpose",
                "hizmetler.html": "FAQ",
                "program.html": "Program & Tournament",
                "finans.html": "Finance",
                "blog.html": "Blog",
                "arsiv.html": "Archive",
                "sporcu-basvuru.html": "Athlete Application",
                "iletisim.html": "Contact",
                "turnuva.html": "Program & Tournament"
            }
        },
        pl: {
            menu: "Menu",
            pickerAria: "Jezyk",
            nav: {
                "index.html": "Strona glowna",
                "kurumsal.html": "Cel",
                "hizmetler.html": "FAQ",
                "program.html": "Program i Turniej",
                "finans.html": "Finanse",
                "blog.html": "Blog",
                "arsiv.html": "Archiwum",
                "sporcu-basvuru.html": "Zgloszenie Zawodnika",
                "iletisim.html": "Kontakt",
                "turnuva.html": "Program i Turniej"
            }
        }
    };

    function normalizeLang(value) {
        return LANGS.indexOf(value) >= 0 ? value : "tr";
    }

    function getLang() {
        return normalizeLang(window.localStorage.getItem(LANG_KEY) || "tr");
    }

    function setLang(lang) {
        window.localStorage.setItem(LANG_KEY, normalizeLang(lang));
    }

    function pageKey() {
        var file = window.location.pathname.split("/").pop();
        return (file && file.length ? file : "index.html").toLowerCase();
    }

    function setText(selector, value) {
        if (typeof value !== "string") {
            return;
        }
        var el = document.querySelector(selector);
        if (el) {
            el.textContent = value;
        }
    }

    function setHTML(selector, value) {
        if (typeof value !== "string") {
            return;
        }
        var el = document.querySelector(selector);
        if (el) {
            el.innerHTML = value;
        }
    }

    function setAttr(selector, attrName, value) {
        if (typeof value !== "string") {
            return;
        }
        var el = document.querySelector(selector);
        if (el) {
            el.setAttribute(attrName, value);
        }
    }

    function setList(selector, values) {
        if (!Array.isArray(values)) {
            return;
        }
        var nodes = document.querySelectorAll(selector);
        values.forEach(function (value, index) {
            if (nodes[index]) {
                nodes[index].textContent = value;
            }
        });
    }

    function mapText(selector, mapping) {
        if (!mapping || typeof mapping !== "object") {
            return;
        }
        document.querySelectorAll(selector).forEach(function (node) {
            var base = node.getAttribute("data-i18n-base");
            if (!base) {
                base = node.textContent.trim();
                node.setAttribute("data-i18n-base", base);
            }
            node.textContent = Object.prototype.hasOwnProperty.call(mapping, base) ? mapping[base] : base;
        });
    }

    function replaceText(selector, replacements) {
        if (!replacements || typeof replacements !== "object") {
            return;
        }
        document.querySelectorAll(selector).forEach(function (node) {
            var base = node.getAttribute("data-i18n-base");
            if (!base) {
                base = node.textContent.trim();
                node.setAttribute("data-i18n-base", base);
            }

            var next = base;
            Object.keys(replacements).forEach(function (key) {
                next = next.split(key).join(replacements[key]);
            });
            node.textContent = next;
        });
    }

    function applyScoreboard(copy) {
        if (!copy || !copy.scoreboard) {
            return;
        }

        setText("[data-scoreboard-kicker]", copy.scoreboard.kicker);
        setText("[data-scoreboard-title]", copy.scoreboard.title);
        setText("[data-scoreboard-text]", copy.scoreboard.text);
        setAttr("[data-scoreboard-tabs]", "aria-label", copy.scoreboard.tabAria);
        setList(".scoreboard-tab", copy.scoreboard.tabs);
        setList("[data-score-summary-label]", copy.scoreboard.summaryLabels);
        setList("[data-score-live-branch]", copy.scoreboard.liveBranches);
        setList("[data-score-live-status]", copy.scoreboard.liveStatuses);
        setList("[data-score-live-meta]", copy.scoreboard.liveMeta);
        setList("[data-score-result-branch]", copy.scoreboard.resultBranches);
        setList("[data-score-result-status]", copy.scoreboard.resultStatuses);
        setList("[data-score-result-meta]", copy.scoreboard.resultMeta);
    }

    function applyCommon(lang) {
        var copy = common[lang] || common.tr;
        document.documentElement.lang = lang;

        document.querySelectorAll(".nav-toggle").forEach(function (button) {
            button.textContent = copy.menu;
        });

        document.querySelectorAll(".nav-actions a.nav-link").forEach(function (link) {
            var href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
            if (Object.prototype.hasOwnProperty.call(copy.nav, href)) {
                link.textContent = copy.nav[href];
            }
        });

        document.querySelectorAll("[data-lang-picker]").forEach(function (picker) {
            picker.value = lang;
            picker.setAttribute("aria-label", copy.pickerAria);
        });
    }

    function applyIndex(lang) {
        var copy = {
            tr: {
                title: "DCFLSPORTFEST'26 | Ana Sayfa",
                h1: "Uluslararas\u0131 Spor ve\u00a0Gen\u00e7lik\u00a0Festivali",
                hero: [
                    "DCFLSPORTFEST'26, yaln\u0131zca yerel bir organizasyon de\u011fildir.",
                    "Bu yap\u0131 sayesinde etkinlik, sponsor markalar i\u00e7in global g\u00f6r\u00fcn\u00fcrl\u00fck sa\u011flar."
                ],
                list: [
                    "Birden fazla \u00fclkeden tak\u0131m ve bireysel sporcu kat\u0131l\u0131m\u0131",
                    "Nitelikli okullar ve spor kul\u00fcplerinin kat\u0131l\u0131m\u0131",
                    "Profesyonel hakemler ve davetli konu\u015fmac\u0131lar",
                    "\u00c7ok dilli ileti\u015fim ve tan\u0131t\u0131m"
                ],
                cta: "Program ve Turnuva",
                stats: ["10 Adet Bran\u015f", "14 Farkl\u0131 Okuldan Kat\u0131l\u0131mc\u0131lar", "Her G\u00fcn 300+ Kat\u0131l\u0131mc\u0131"],
                sponsorCta: "Sporcu Ba\u015fvurusu Yap",
                countdown: "SportFeste kalan s\u00fcre",
                countdownLabels: ["G\u00fcn", "Saat", "Dakika", "Saniye"],
                ended: "Festival ba\u015flad\u0131!",
                scoreboard: {
                    kicker: "SKOR MERKEZ\u0130",
                    title: "Canl\u0131 Skor ve Sonu\u00e7lar",
                    text: "G\u00fcn\u00fcn canl\u0131 kar\u015f\u0131la\u015fmalar\u0131n\u0131 ve tamamlanan ma\u00e7 sonu\u00e7lar\u0131n\u0131 tek panelden takip et.",
                    tabAria: "Skor paneli sekmeleri",
                    tabs: ["Canl\u0131", "Sonu\u00e7lar"],
                    summaryLabels: ["Aktif kar\u015f\u0131la\u015fma", "Bug\u00fcn tamamlanan ma\u00e7", "Son g\u00fcncelleme"],
                    liveBranches: ["Voleybol", "Basketbol", "Futbol", "PlayStation"],
                    liveStatuses: ["Canl\u0131", "Canl\u0131", "67. dakika", "Canl\u0131"],
                    liveMeta: [
                        "Yar\u0131 final | Kapal\u0131 Spor Salonu | 2. set",
                        "Grup A | Ana Saha | 3. \u00e7eyrek",
                        "Yar\u0131 final | D\u0131\u015f Saha | 67. dakika",
                        "Final | E-spor Alan\u0131 | 2. ma\u00e7"
                    ],
                    resultBranches: ["Masa Tenisi", "Ok\u00e7uluk", "Atletizm", "Bah\u00e7e Satranc\u0131"],
                    resultStatuses: ["Final", "Tamamland\u0131", "Tamamland\u0131", "Tamamland\u0131"],
                    resultMeta: [
                        "Kad\u0131nlar yar\u0131 finali | Salon B",
                        "Klasman turu | A\u00e7\u0131k Alan",
                        "100m finali | Ana Pist",
                        "Eleme turu | Bah\u00e7e Alan\u0131"
                    ]
                },
                branches: ["Voleybol", "Basketbol", "Futbol", "Masa Tenisi", "Ok\u00e7uluk", "Oryantiring", "Bah\u00e7e Satranc\u0131", "PlayStation Turnuvas\u0131", "Atletizm", "Bah\u00e7e Oyunlar\u0131"],
                schools: [
                    "Do\u011fan C\u00fccelo\u011flu Fen Lisesi",
                    "Atakent Anadolu Lisesi",
                    "Atakent TED Koleji",
                    "Tema Bah\u00e7e\u015fehir Koleji",
                    "Prof. Dr. Fuat Sezgin Fen Lisesi",
                    "Fahrettin Kerim G\u00f6kay Anadolu Lisesi",
                    "\u00c7apa Fen Lisesi",
                    "Adnan Menderes Anadolu Lisesi",
                    "Bah\u00e7elievler Anadolu Lisesi",
                    "Prof. Dr. M\u00fcmtaz Turhan Sosyal Bilimler Lisesi",
                    "Ca\u011falo\u011flu Fen Lisesi",
                    "Orhan Gazi Anadolu Lisesi",
                    "Orhan Cemal Fersoy Anadolu Lisesi",
                    "Ya\u015far Acar Fen Lisesi"
                ],
                contactTitle: "\u0130leti\u015fim Formu",
                contactDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 K\u00fc\u00e7\u00fck\u00e7ekmece / \u0130stanbul",
                    "<strong>Tarih:</strong> 12-13-14 May\u0131s 2026"
                ],
                quick: "H\u0131zl\u0131 Mesaj",
                labels: ["Ad Soyad/ Firma Ad\u0131", "E-posta", "Konu", "Mesaj"],
                placeholders: ["Ad Soyad/ Firma Ad\u0131", "ornek@mail.com", "Tak\u0131m kayd\u0131 / Sponsorluk / Soru", "Mesaj\u0131n\u0131 yaz..."],
                send: "G\u00f6nder"
            },
            en: {
                title: "DCFLSPORTFEST'26 | Home",
                h1: "International Sports and Youth Festival",
                hero: [
                    "DCFLSPORTFEST'26 is not only a local organization.",
                    "This structure gives sponsor brands global visibility."
                ],
                list: [
                    "Teams and individual athletes from multiple countries",
                    "Participation of qualified schools and sports clubs",
                    "Professional referees and invited speakers",
                    "Multilingual communication and promotion"
                ],
                cta: "Program and Tournament",
                stats: ["10 Sports Branches", "Participants from 14 Different Schools", "300+ Participants Daily"],
                sponsorCta: "Apply as an Athlete",
                countdown: "Time Left to Sportfest",
                countdownLabels: ["Days", "Hours", "Minutes", "Seconds"],
                ended: "The festival has started!",
                scoreboard: {
                    kicker: "SCORE CENTER",
                    title: "Live Scores and Results",
                    text: "Track live matches and completed results from a single panel.",
                    tabAria: "Score panel tabs",
                    tabs: ["Live", "Results"],
                    summaryLabels: ["Active matches", "Finished today", "Last update"],
                    liveBranches: ["Volleyball", "Basketball", "Football", "PlayStation"],
                    liveStatuses: ["Live", "Live", "67th minute", "Live"],
                    liveMeta: [
                        "Semi-final | Indoor Hall | 2nd set",
                        "Group A | Main Court | 3rd quarter",
                        "Semi-final | Outdoor Field | 67th minute",
                        "Final | E-sports Area | Match 2"
                    ],
                    resultBranches: ["Table Tennis", "Archery", "Athletics", "Garden Chess"],
                    resultStatuses: ["Final", "Completed", "Completed", "Completed"],
                    resultMeta: [
                        "Women's semi-final | Hall B",
                        "Ranking round | Open Area",
                        "100m final | Main Track",
                        "Elimination round | Garden Area"
                    ]
                },
                branches: ["Volleyball", "Basketball", "Football", "Table Tennis", "Archery", "Orienteering", "Garden Chess", "PlayStation Tournament", "Athletics", "Garden Games"],
                schools: [
                    "Dogan Cuceloglu Science High School",
                    "Atakent Anatolian High School",
                    "Atakent TED College",
                    "Tema Bahcesehir College",
                    "Prof. Dr. Fuat Sezgin Science High School",
                    "Fahrettin Kerim Gokay Anatolian High School",
                    "Capa Science High School",
                    "Adnan Menderes Anatolian High School",
                    "Bahcelievler Anatolian High School",
                    "Prof. Dr. Mumtaz Turhan Social Sciences High School",
                    "Cagaloglu Science High School",
                    "Orhan Gazi Anatolian High School",
                    "Orhan Cemal Fersoy Anatolian High School",
                    "Yasar Acar Science High School"
                ],
                contactTitle: "Contact Form",
                contactDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Location:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Date:</strong> May 12-14, 2026"
                ],
                quick: "Quick Message",
                labels: ["Name / Company Name", "E-mail", "Subject", "Message"],
                placeholders: ["Name / Company Name", "example@mail.com", "Team registration / Sponsorship / Question", "Write your message..."],
                send: "Send"
            },
            pl: {
                title: "DCFLSPORTFEST'26 | Strona glowna",
                h1: "Miedzynarodowy Festiwal Sportu i Mlodziezy",
                hero: [
                    "DCFLSPORTFEST'26 to nie tylko lokalna organizacja.",
                    "Ta struktura zapewnia sponsorom globalna widocznosc."
                ],
                list: [
                    "Druzyny i zawodnicy indywidualni z wielu krajow",
                    "Udzial renomowanych szkol i klubow sportowych",
                    "Profesjonalni sedziowie i zaproszeni prelegenci",
                    "Wielojezyczna komunikacja i promocja"
                ],
                cta: "Program i Turniej",
                stats: ["10 Dyscyplin", "Uczestnicy z 14 Roznych Szkol", "300+ Uczestnikow Dziennie"],
                sponsorCta: "Zloz Wniosek Zawodnika",
                countdown: "Czas do Sportfestu",
                countdownLabels: ["Dni", "Godz.", "Min.", "Sek."],
                ended: "Festiwal sie rozpoczal!",
                scoreboard: {
                    kicker: "CENTRUM WYNIKOW",
                    title: "Wyniki na Zywo i Rezultaty",
                    text: "Sledz mecze na zywo i zakonczone wyniki w jednym panelu.",
                    tabAria: "Zakladki panelu wynikow",
                    tabs: ["Na Zywo", "Rezultaty"],
                    summaryLabels: ["Aktywne mecze", "Zakonczone dzisiaj", "Ostatnia aktualizacja"],
                    liveBranches: ["Siatkowka", "Koszykowka", "Pilka Nozna", "PlayStation"],
                    liveStatuses: ["Na Zywo", "Na Zywo", "67. minuta", "Na Zywo"],
                    liveMeta: [
                        "Polfinal | Hala sportowa | 2. set",
                        "Grupa A | Boisko glowne | 3. kwarta",
                        "Polfinal | Boisko zewnetrzne | 67. minuta",
                        "Final | Strefa e-sportu | Mecz 2"
                    ],
                    resultBranches: ["Tenis Stolowy", "Lucznictwo", "Lekkoatletyka", "Szachy Ogrodowe"],
                    resultStatuses: ["Final", "Zakonczono", "Zakonczono", "Zakonczono"],
                    resultMeta: [
                        "Polfinal kobiet | Hala B",
                        "Runda klasyfikacyjna | Strefa otwarta",
                        "Final 100 m | Tor glowny",
                        "Runda eliminacyjna | Strefa ogrodowa"
                    ]
                },
                branches: ["Siatkowka", "Koszykowka", "Pilka nozna", "Tenis stolowy", "Lucznictwo", "Bieg na orientacje", "Szachy ogrodowe", "Turniej PlayStation", "Lekkoatletyka", "Gry ogrodowe"],
                schools: [
                    "Dogan Cuceloglu Fen Lisesi",
                    "Atakent Anadolu Lisesi",
                    "Atakent TED Koleji",
                    "Tema Bahcesehir Koleji",
                    "Prof. Dr. Fuat Sezgin Fen Lisesi",
                    "Fahrettin Kerim Gokay Anadolu Lisesi",
                    "Capa Fen Lisesi",
                    "Adnan Menderes Anadolu Lisesi",
                    "Bahcelievler Anadolu Lisesi",
                    "Prof. Dr. Mumtaz Turhan Sosyal Bilimler Lisesi",
                    "Cagaloglu Fen Lisesi",
                    "Orhan Gazi Anadolu Lisesi",
                    "Orhan Cemal Fersoy Anadolu Lisesi",
                    "Yasar Acar Fen Lisesi"
                ],
                contactTitle: "Formularz Kontaktowy",
                contactDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Lokalizacja:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Data:</strong> 12-14 maja 2026"
                ],
                quick: "Szybka Wiadomosc",
                labels: ["Imie i nazwisko / Firma", "E-mail", "Temat", "Wiadomosc"],
                placeholders: ["Imie i nazwisko / Firma", "przyklad@mail.com", "Rejestracja druzyny / Sponsoring / Pytanie", "Napisz wiadomosc..."],
                send: "Wyslij"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".hero-copy h1", copy.h1);
        setList(".hero-copy .hero-text", copy.hero);
        setList(".hero-list li", copy.list);
        setText(".cta-row .btn", copy.cta);
        setText(".stats [aria-controls='home-branches-list'] h3", copy.stats[0]);
        setText(".stats [aria-controls='home-schools-list'] h3", copy.stats[1]);
        setText(".stats [data-stat-daily] h3", copy.stats[2]);
        setText(".countdown-title", copy.countdown);
        setText(".countdown-cta", copy.sponsorCta);
        setList(".countdown-label", copy.countdownLabels);
        setAttr("[data-countdown]", "data-ended-text", copy.ended);
        applyScoreboard(copy);
        renderLiveScoreboard();
        renderScoreResults(lang);
        setList(".home-branch-list li", copy.branches);
        setList(".home-school-list li", copy.schools || []);
        setText(".contact-info h2", copy.contactTitle);
        if (Array.isArray(copy.contactDetails)) {
            setHTML(".contact-info .section-text:nth-of-type(1)", copy.contactDetails[0]);
            setHTML(".contact-info .section-text:nth-of-type(2)", copy.contactDetails[1]);
            setHTML(".contact-info .section-text:nth-of-type(3)", copy.contactDetails[2]);
        }
        setText(".contact-form-card h2", copy.quick);
        setText("label[for='home-name']", copy.labels[0]);
        setText("label[for='home-email']", copy.labels[1]);
        setText("label[for='home-topic']", copy.labels[2]);
        setText("label[for='home-message']", copy.labels[3]);
        setAttr("#home-name", "placeholder", copy.placeholders[0]);
        setAttr("#home-email", "placeholder", copy.placeholders[1]);
        setAttr("#home-topic", "placeholder", copy.placeholders[2]);
        setAttr("#home-message", "placeholder", copy.placeholders[3]);
        setText(".contact-form-card .btn", copy.send);
    }
    function applyProgram(lang) {
        var copy = {
            tr: {
                title: "Program & Turnuva | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TURNUVA",
                h1: "Sportfest Etkinlik Ak\u0131\u015f\u0131\u00a0ve\u00a0Turnuva\u00a0Ak\u0131\u015f\u0131",
                hero: "A\u00e7\u0131l\u0131\u015f, g\u00fcnl\u00fck etkinlik plan\u0131 ve bran\u015f bazl\u0131 8 tak\u0131ml\u0131 t\u00fcm turnuva fikst\u00fcrlerini tek sayfada takip edebilirsin.",
                sections: ["OPERASYON AKI\u015eI", "FEST\u0130VAL HATLARI", "F\u0130KST\u00dcR DETAYLARI"],
                titles: ["G\u00fcnl\u00fck Program", "Bran\u015flar", "Turnuva Se\u00e7im Ekran\u0131"],
                tabs: ["Voleybol", "Basketbol", "Futbol", "Masa Tenisi", "Ok\u00e7uluk", "Oryantiring", "Bah\u00e7e Satranc\u0131", "PlayStation", "Atletizm", "Bah\u00e7e Oyunlar\u0131"],
                panels: ["Voleybol Fikst\u00fcr\u00fc", "Basketbol Fikst\u00fcr\u00fc", "Futbol Fikst\u00fcr\u00fc", "Masa Tenisi Fikst\u00fcr\u00fc", "Ok\u00e7uluk Fikst\u00fcr\u00fc", "Oryantiring Fikst\u00fcr\u00fc", "Bah\u00e7e Satranc\u0131 Fikst\u00fcr\u00fc", "PlayStation Turnuvas\u0131 Fikst\u00fcr\u00fc", "Atletizm Fikst\u00fcr\u00fc", "Bah\u00e7e Oyunlar\u0131 Fikst\u00fcr\u00fc"],
                timelineTitles: [
                    "12 May\u0131s | A\u00e7\u0131l\u0131\u015f,\u00c7eyrek Finaller ve Yar\u0131 Finaller",
                    "13 May\u0131s | Yar\u0131 Finaller ve Yan Etkinlikler",
                    "14 May\u0131s | Final ve \u00d6d\u00fcl T\u00f6reni"
                ],
                timelineText: [
                    "",
                    "\u00c7eyrek final galipleri yar\u0131 finalde bulu\u015fur; g\u00fcn boyunca yan etkinlik ak\u0131\u015f\u0131 devam eder.",
                    "Her bran\u015fta \u015fampiyonluk ma\u00e7\u0131 oynan\u0131r, ard\u0131ndan kupa seremonisi ve kapan\u0131\u015f yap\u0131l\u0131r."
                ],
                headerMap: {
                    "Tarih": "Tarih",
                    "Saat": "Saat",
                    "E\u015fle\u015fme": "E\u015fle\u015fme",
                    "Saha": "Saha",
                    "Tur": "Tur",
                    "Alan": "Alan",
                    "Yar\u0131\u015f": "Yar\u0131\u015f",
                    "Pist": "Pist",
                    "Etap": "Etap"
                },
                detailMap: {},
                footer: "Program & Turnuva Sayfas\u0131"
            },
            en: {
                title: "Program & Tournament | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TOURNAMENT",
                h1: "Sportfest Event Flow\u00a0and\u00a0Tournament\u00a0Flow",
                hero: "Follow the opening, daily schedule and branch-based 8-team brackets on one page.",
                sections: ["OPERATION FLOW", "FESTIVAL LINES", "FIXTURE DETAILS"],
                titles: ["Daily Program", "Sports Branches", "Tournament Selection Screen"],
                tabs: ["Volleyball", "Basketball", "Football", "Table Tennis", "Archery", "Orienteering", "Garden Chess", "PlayStation", "Athletics", "Garden Games"],
                panels: ["Volleyball Fixture", "Basketball Fixture", "Football Fixture", "Table Tennis Fixture", "Archery Fixture", "Orienteering Fixture", "Garden Chess Fixture", "PlayStation Tournament Fixture", "Athletics Fixture", "Garden Games Fixture"],
                timelineTitles: [
                    "May 12 | Quarter-finals and Opening",
                    "May 13 | Semi-finals and Side Events",
                    "May 14 | Final and Award Ceremony"
                ],
                timelineText: [
                    "The 8-team tournament bracket starts on the same day as the opening ceremony.",
                    "Quarter-final winners meet in the semi-finals while side activities continue throughout the day.",
                    "Each branch plays its championship match, followed by the cup ceremony and closing."
                ],
                headerMap: {
                    "Tarih": "Date",
                    "Saat": "Time",
                    "E\u015fle\u015fme": "Match",
                    "Saha": "Court",
                    "Tur": "Round",
                    "Alan": "Area",
                    "Yar\u0131\u015f": "Race",
                    "Pist": "Track",
                    "Etap": "Stage"
                },
                detailMap: {
                    "\u00c7eyrek Final": "Quarter-final",
                    "Yar\u0131 Final": "Semi-final",
                    "Ma\u00e7 Ak\u0131\u015f\u0131": "Match Flow",
                    "12 May\u0131s": "May 12",
                    "13 May\u0131s": "May 13",
                    "14 May\u0131s": "May 14",
                    "Kapal\u0131 Spor Salonu": "Indoor Hall",
                    "Ana Saha": "Main Court",
                    "D\u0131\u015f Saha": "Outdoor Field",
                    "Salon B": "Hall B",
                    "A\u00e7\u0131k Alan": "Open Area",
                    "Kamp\u00fcs Rotas\u0131": "Campus Route",
                    "Bah\u00e7e Alan\u0131": "Garden Area",
                    "E-spor Alan\u0131": "E-sports Area",
                    "Festival Bah\u00e7esi": "Festival Garden",
                    "Ana Pist": "Main Track",
                    "\u00c7F 1 Galibi": "QF 1 Winner",
                    "\u00c7F 2 Galibi": "QF 2 Winner",
                    "\u00c7F 3 Galibi": "QF 3 Winner",
                    "\u00c7F 4 Galibi": "QF 4 Winner",
                    "YF 1 Galibi": "SF 1 Winner",
                    "YF 2 Galibi": "SF 2 Winner",
                    "8 tak\u0131ml\u0131 e\u015fle\u015fme yap\u0131s\u0131 12-13-14 May\u0131s ak\u0131\u015f\u0131na g\u00f6re ilerler.": "The 8-team bracket advances according to the May 12-13-14 festival flow."
                },
                footer: "Program & Tournament Page"
            },
            pl: {
                title: "Program i Turniej | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM I TURNIEJ",
                h1: "Przebieg Sportfest\u00a0i\u00a0przebieg\u00a0turnieju",
                hero: "Na jednej stronie sledzisz otwarcie, plan dnia i drabinki turniejowe z udzialem 8 druzyn.",
                sections: ["PRZEBIEG OPERACYJNY", "LINIE FESTIWALU", "SZCZEGOLY TERMINARZA"],
                titles: ["Program Dzienny", "Dyscypliny", "Ekran Wyboru Turnieju"],
                tabs: ["Siatkowka", "Koszykowka", "Pilka nozna", "Tenis stolowy", "Lucznictwo", "Bieg na orientacje", "Szachy ogrodowe", "PlayStation", "Lekkoatletyka", "Gry ogrodowe"],
                panels: ["Terminarz siatkowki", "Terminarz koszykowki", "Terminarz pilki noznej", "Terminarz tenisa stolowego", "Terminarz lucznictwa", "Terminarz biegu na orientacje", "Terminarz szachow ogrodowych", "Terminarz turnieju PlayStation", "Terminarz lekkoatletyki", "Terminarz gier ogrodowych"],
                timelineTitles: [
                    "12 maja | Cwiercfinaly i Otwarcie",
                    "13 maja | Polfinaly i Wydarzenia Towarzyszace",
                    "14 maja | Final i Ceremonia Nagrod"
                ],
                timelineText: [
                    "Drabinka turnieju z udzialem 8 druzyn rusza tego samego dnia co ceremonia otwarcia.",
                    "Zwyciezcy cwiercfinalow spotykaja sie w polfinalach, a wydarzenia towarzyszace trwaja przez caly dzien.",
                    "Kazda dyscyplina rozgrywa mecz mistrzowski, po czym odbywa sie ceremonia pucharowa i zamkniecie."
                ],
                headerMap: {
                    "Tarih": "Data",
                    "Saat": "Godz.",
                    "E\u015fle\u015fme": "Mecz",
                    "Saha": "Boisko",
                    "Tur": "Runda",
                    "Alan": "Strefa",
                    "Yar\u0131\u015f": "Bieg",
                    "Pist": "Tor",
                    "Etap": "Etap"
                },
                detailMap: {
                    "\u00c7eyrek Final": "Cwiercfinal",
                    "Yar\u0131 Final": "Polfinal",
                    "Ma\u00e7 Ak\u0131\u015f\u0131": "Przebieg meczow",
                    "12 May\u0131s": "12 maja",
                    "13 May\u0131s": "13 maja",
                    "14 May\u0131s": "14 maja",
                    "Kapal\u0131 Spor Salonu": "Hala sportowa",
                    "Ana Saha": "Boisko glowne",
                    "D\u0131\u015f Saha": "Boisko zewnetrzne",
                    "Salon B": "Hala B",
                    "A\u00e7\u0131k Alan": "Strefa otwarta",
                    "Kamp\u00fcs Rotas\u0131": "Trasa kampusowa",
                    "Bah\u00e7e Alan\u0131": "Strefa ogrodowa",
                    "E-spor Alan\u0131": "Strefa e-sportu",
                    "Festival Bah\u00e7esi": "Ogrod festiwalowy",
                    "Ana Pist": "Tor glowny",
                    "\u00c7F 1 Galibi": "Zwyciezca CF 1",
                    "\u00c7F 2 Galibi": "Zwyciezca CF 2",
                    "\u00c7F 3 Galibi": "Zwyciezca CF 3",
                    "\u00c7F 4 Galibi": "Zwyciezca CF 4",
                    "YF 1 Galibi": "Zwyciezca PF 1",
                    "YF 2 Galibi": "Zwyciezca PF 2",
                    "8 tak\u0131ml\u0131 e\u015fle\u015fme yap\u0131s\u0131 12-13-14 May\u0131s ak\u0131\u015f\u0131na g\u00f6re ilerler.": "Drabinka 8 druzyn rozwija sie zgodnie z harmonogramem 12-13-14 maja."
                },
                footer: "Strona Program i Turniej"
            }
        }[lang] || {};

        renderProgramFixtures(lang);
        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        if (Array.isArray(copy.sections) && copy.sections.length) {
            setText(".program-overview-program .section-head .section-kicker", copy.sections[0]);
            setText(".fixture-section .section-head .section-kicker", copy.sections[copy.sections.length - 1]);
        }
        if (Array.isArray(copy.titles) && copy.titles.length) {
            setText(".program-overview-program .section-head h2", copy.titles[0]);
            setText(".fixture-section .section-head h2", copy.titles[copy.titles.length - 1]);
        }
        setList(".timeline h3", copy.timelineTitles);
        setList(".timeline .step p", copy.timelineText);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyFinans(lang) {
        var copy = {
            tr: {
                title: "Finans | DCFLSPORTFEST'26",
                eyebrow: "SPONSORLUK DERECELER\u0130",
                h1: "Sponsorluk Paketlerini Kar\u015f\u0131la\u015ft\u0131r\u0131n",
                hero: "Ayni sponsorlu\u011fu ayr\u0131 bir blokta, maddi sponsorluk paketlerini ise kolay kar\u015f\u0131la\u015ft\u0131rmal\u0131 kart d\u00fczeninde inceleyebilirsin.",
                section: "F\u0130NANS",
                sectionTitle: "Sponsorluk Paketlerini Kar\u015f\u0131la\u015ft\u0131r\u0131n",
                group: "MADD\u0130 SPONSORLUK PAKETLER\u0130",
                groupTitle: "Maddi Sponsorluk Paketleri",
                contact: "\u0130leti\u015fim",
                contactDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 K\u00fc\u00e7\u00fck\u00e7ekmece / \u0130stanbul",
                    "<strong>Not:</strong> Sponsorluk detay dosyas\u0131 ve teklif g\u00f6nderimi i\u00e7in ileti\u015fime ge\u00e7ebilirsin."
                ],
                quick: "H\u0131zl\u0131 Mesaj",
                labels: ["Ad Soyad / Firma Ad\u0131", "E-posta", "Konu", "Mesaj"],
                placeholders: ["Ad Soyad / Firma Ad\u0131", "ornek@mail.com", "Sponsorluk Paketi / Dosya Talebi", "Mesaj\u0131n\u0131 yaz..."],
                send: "G\u00f6nder",
                footer: "Finans Sayfas\u0131"
            },
            en: {
                title: "Finance | DCFLSPORTFEST'26",
                eyebrow: "SPONSORSHIP TIERS",
                h1: "Compare Sponsorship Packages",
                hero: "Review in-kind sponsorship in a dedicated block and compare financial packages side by side.",
                section: "FINANCE",
                sectionTitle: "Compare Sponsorship Packages",
                group: "FINANCIAL SPONSORSHIP PACKAGES",
                groupTitle: "Financial Sponsorship Packages",
                contact: "Contact",
                contactDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Location:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Note:</strong> Contact us for the sponsorship file and proposal process."
                ],
                quick: "Quick Message",
                labels: ["Name / Company Name", "E-mail", "Subject", "Message"],
                placeholders: ["Name / Company Name", "example@mail.com", "Sponsorship Package / File Request", "Write your message..."],
                send: "Send",
                footer: "Finance Page"
            },
            pl: {
                title: "Finanse | DCFLSPORTFEST'26",
                eyebrow: "POZIOMY SPONSORINGU",
                h1: "Porownaj pakiety sponsorskie",
                hero: "Sponsorstwo rzeczowe sprawdzisz osobno, a pakiety finansowe porownasz obok siebie.",
                section: "FINANSE",
                sectionTitle: "Porownaj pakiety sponsorskie",
                group: "PAKIETY SPONSORINGU FINANSOWEGO",
                groupTitle: "Pakiety Sponsoringu Finansowego",
                contact: "Kontakt",
                contactDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Lokalizacja:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Notatka:</strong> Skontaktuj sie z nami, aby otrzymac plik sponsorski i wyslac propozycje."
                ],
                quick: "Szybka Wiadomosc",
                labels: ["Imie i nazwisko / Firma", "E-mail", "Temat", "Wiadomosc"],
                placeholders: ["Imie i nazwisko / Firma", "przyklad@mail.com", "Pakiet sponsorski / Prosba o plik", "Napisz wiadomosc..."],
                send: "Wyslij",
                footer: "Strona Finanse"
            }
        }[lang] || {};

        var map = {
            en: {
                "Ayni Sponsorluk": "In-Kind Sponsorship",
                "Bronz Sponsorluk": "Bronze Sponsorship",
                "G\u00fcm\u00fc\u015f Sponsorluk": "Silver Sponsorship",
                "Alt\u0131n Sponsorluk": "Gold Sponsorship",
                "Destek niteli\u011fine g\u00f6re \u00f6zel g\u00f6r\u00fcn\u00fcrl\u00fck.": "Custom visibility based on support type.",
                "Temel g\u00f6r\u00fcn\u00fcrl\u00fck ve resmi te\u015fekk\u00fcr paketi.": "Core visibility and official appreciation package.",
                "Daha fazla g\u00f6r\u00fcn\u00fcrl\u00fck ve sahne te\u015fekk\u00fcr\u00fc.": "Higher visibility and stage appreciation.",
                "Maksimum g\u00f6r\u00fcn\u00fcrl\u00fck ve premium haklar.": "Maximum visibility and premium rights.",
                "De\u011fer: Destek i\u00e7eri\u011fine g\u00f6re": "Value: Based on support content",
                "Ayni sponsor ba\u015fl\u0131\u011f\u0131 alt\u0131nda logo payla\u015f\u0131m\u0131": "Logo placement under the in-kind sponsorship title",
                "Tan\u0131t\u0131m hakk\u0131 destek kapsam\u0131na g\u00f6re belirlenir": "Promotion rights are defined by the support scope",
                "Etkinlik boyunca sosyal medya te\u015fekk\u00fcr\u00fc": "Social media appreciation throughout the event",
                "Kuruma \u00f6zel te\u015fekk\u00fcr iletimi": "Dedicated appreciation message for the institution",
                "Etkinlik afi\u015flerinde logo g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc (K\u00fc\u00e7\u00fck Boy)": "Logo visibility on event posters (Small size)",
                "Etkinlik afi\u015flerinde logo g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc (Orta Boy)": "Logo visibility on event posters (Medium size)",
                "Etkinlik afi\u015flerinde logo g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc (B\u00fcy\u00fck Boy)": "Logo visibility on event posters (Large size)",
                "Firmaya \u00f6zel te\u015fekk\u00fcr belgesi": "Custom certificate of appreciation",
                "Medyada yap\u0131lan toplu te\u015fekk\u00fcr payla\u015f\u0131m\u0131nda logosu bulunur.": "Logo placement in the collective media thank-you post.",
                "A\u00e7\u0131l\u0131\u015fta isimle te\u015fekk\u00fcr": "Name mention during the opening",
                "A\u00e7\u0131l\u0131\u015fta \u00f6zel te\u015fekk\u00fcr": "Special thanks during the opening",
                "Stant a\u00e7ma hakk\u0131": "Right to open a stand",
                "Firmaya \u00f6zel te\u015fekk\u00fcr plaketi": "Custom appreciation plaque"
            },
            pl: {
                "Ayni Sponsorluk": "Sponsorstwo rzeczowe",
                "Bronz Sponsorluk": "Sponsorstwo brazowe",
                "G\u00fcm\u00fc\u015f Sponsorluk": "Sponsorstwo srebrne",
                "Alt\u0131n Sponsorluk": "Sponsorstwo zlote",
                "Destek niteli\u011fine g\u00f6re \u00f6zel g\u00f6r\u00fcn\u00fcrl\u00fck.": "Widocznosc dopasowana do rodzaju wsparcia.",
                "Temel g\u00f6r\u00fcn\u00fcrl\u00fck ve resmi te\u015fekk\u00fcr paketi.": "Podstawowa widocznosc i oficjalny pakiet podziekowan.",
                "Daha fazla g\u00f6r\u00fcn\u00fcrl\u00fck ve sahne te\u015fekk\u00fcr\u00fc.": "Wieksza widocznosc i podziekowanie na scenie.",
                "Maksimum g\u00f6r\u00fcn\u00fcrl\u00fck ve premium haklar.": "Maksymalna widocznosc i prawa premium.",
                "De\u011fer: Destek i\u00e7eri\u011fine g\u00f6re": "Wartosc: Wedlug zakresu wsparcia",
                "Ayni sponsor ba\u015fl\u0131\u011f\u0131 alt\u0131nda logo payla\u015f\u0131m\u0131": "Publikacja logo w ramach sponsorstwa rzeczowego",
                "Tan\u0131t\u0131m hakk\u0131 destek kapsam\u0131na g\u00f6re belirlenir": "Zakres praw promocyjnych zalezy od rodzaju wsparcia",
                "Etkinlik boyunca sosyal medya te\u015fekk\u00fcr\u00fc": "Podziekowanie w mediach spolecznosciowych przez cale wydarzenie",
                "Kuruma \u00f6zel te\u015fekk\u00fcr iletimi": "Dedykowane podziekowanie dla instytucji",
                "Etkinlik afi\u015flerinde logo g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc (K\u00fc\u00e7\u00fck Boy)": "Widocznosc logo na plakatach wydarzenia (maly rozmiar)",
                "Etkinlik afi\u015flerinde logo g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc (Orta Boy)": "Widocznosc logo na plakatach wydarzenia (sredni rozmiar)",
                "Etkinlik afi\u015flerinde logo g\u00f6r\u00fcn\u00fcrl\u00fc\u011f\u00fc (B\u00fcy\u00fck Boy)": "Widocznosc logo na plakatach wydarzenia (duzy rozmiar)",
                "Firmaya \u00f6zel te\u015fekk\u00fcr belgesi": "Dedykowany certyfikat podziekowania",
                "Medyada yap\u0131lan toplu te\u015fekk\u00fcr payla\u015f\u0131m\u0131nda logosu bulunur.": "Logo w zbiorczym wpisie z podziekowaniem w mediach.",
                "A\u00e7\u0131l\u0131\u015fta isimle te\u015fekk\u00fcr": "Podziekowanie z nazwa podczas otwarcia",
                "A\u00e7\u0131l\u0131\u015fta \u00f6zel te\u015fekk\u00fcr": "Specjalne podziekowanie podczas otwarcia",
                "Stant a\u00e7ma hakk\u0131": "Prawo do otwarcia stoiska",
                "Firmaya \u00f6zel te\u015fekk\u00fcr plaketi": "Dedykowana plakieta podziekowania"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.sectionTitle);
        setText(".finance-group-head .section-kicker", copy.group);
        setText(".finance-group-head h3", copy.groupTitle);
        setText(".contact-info h2", copy.contact);
        if (Array.isArray(copy.contactDetails)) {
            setHTML(".contact-info .section-text:nth-of-type(1)", copy.contactDetails[0]);
            setHTML(".contact-info .section-text:nth-of-type(2)", copy.contactDetails[1]);
            setHTML(".contact-info .section-text:nth-of-type(3)", copy.contactDetails[2]);
        }
        setText(".contact-form-card h2", copy.quick);
        setText("label[for='finans-name']", copy.labels[0]);
        setText("label[for='finans-email']", copy.labels[1]);
        setText("label[for='finans-topic']", copy.labels[2]);
        setText("label[for='finans-message']", copy.labels[3]);
        setAttr("#finans-name", "placeholder", copy.placeholders[0]);
        setAttr("#finans-email", "placeholder", copy.placeholders[1]);
        setAttr("#finans-topic", "placeholder", copy.placeholders[2]);
        setAttr("#finans-message", "placeholder", copy.placeholders[3]);
        setText(".contact-form-card .btn", copy.send);
        setText(".footer p:nth-of-type(2)", copy.footer);

        mapText(".finance-card h3", map);
        mapText(".finance-sub", map);
        mapText(".finance-price", map);
        mapText(".finance-ayni .finance-body li", map);
        mapText(".feature-name", map);
    }

    function applyKurumsal(lang) {
        var copy = {
            tr: {
                title: "Etkinli\u011fin Amac\u0131 | DCFLSPORTFEST'26",
                eyebrow: "AMACIMIZ",
                h1: "Etkinli\u011fin Amac\u0131",
                hero: [
                    "DCFLSPORTFEST'26, \u00e7ok boyutlu bir spor ve gen\u00e7lik deneyimi sunmay\u0131 ama\u00e7layan uluslararas\u0131 bir organizasyondur.",
                    "Etkinlikteki temel ama\u00e7lar\u0131m\u0131z:",
                    "Bu sayede DCFLSPORTFEST'26, yaln\u0131zca bir etkinlik de\u011fil; s\u00fcreklilik vadeder."
                ],
                heroList: [
                    "Uluslararas\u0131 spor k\u00fclt\u00fcr\u00fcn\u00fc gen\u00e7ler aras\u0131nda yayg\u0131nla\u015ft\u0131rmak",
                    "Gen\u00e7 sporculara kendilerini ifade edebilecekleri ve g\u00f6r\u00fcn\u00fcrl\u00fck kazanabilecekleri bir platform sunmak",
                    "Markalar ile gen\u00e7 hedef kitle aras\u0131nda g\u00fc\u00e7l\u00fc ve kal\u0131c\u0131 bir ba\u011f olu\u015fturmak",
                    "Spor, e\u011flence ve deneyimi tek bir festival \u00e7at\u0131s\u0131 alt\u0131nda birle\u015ftirmek",
                    "Uluslararas\u0131 i\u015f birliklerinin ve yeni projelerin \u00f6n\u00fcn\u00fc a\u00e7mak"
                ],
                section: "V\u0130ZYON VE M\u0130SYON",
                sectionTitle: "Temel Yakla\u015f\u0131m\u0131m\u0131z",
                tileTitles: ["Vizyon", "Misyon"],
                tileParagraphs: [
                    "DCFLSPORTFEST'26'y\u0131; farkl\u0131 \u00fclkelerden gen\u00e7 sporcular\u0131n, kul\u00fcplerin ve spor markalar\u0131n\u0131n her y\u0131l bir araya geldi\u011fi, uluslararas\u0131 \u00f6l\u00e7ekte tan\u0131nan, s\u00fcrd\u00fcr\u00fclebilir ve prestijli bir spor festivali haline getirmeyi hedefliyoruz.",
                    "Uzun vadede DCFLSPORTFEST'26'n\u0131n a\u015fa\u011f\u0131daki niteliklere sahip bir etkinlik olmas\u0131n\u0131 ama\u00e7l\u0131yoruz:",
                    "DCFLSPORTFEST'26'n\u0131n misyonu, sporu yaln\u0131zca bir yar\u0131\u015fma alan\u0131 olarak de\u011fil; ileti\u015fim, geli\u015fim ve k\u00fclt\u00fcrel etkile\u015fim arac\u0131 olarak konumland\u0131rmakt\u0131r.",
                    "Bu do\u011frultuda \u00f6ncelikli hedeflerimiz:"
                ],
                tileList: [
                    "Avrupa, Orta Do\u011fu ve Balkanlar'dan d\u00fczenli kat\u0131l\u0131mc\u0131 \u00e7eken.",
                    "Gen\u00e7lik ve spor alan\u0131nda referans g\u00f6sterilen.",
                    "Markalar i\u00e7in stratejik bir ileti\u015fim ve deneyim platformu olan.",
                    "Gen\u00e7lerin spor yoluyla uluslararas\u0131 deneyim kazanmas\u0131n\u0131 sa\u011flamak.",
                    "Farkl\u0131 k\u00fclt\u00fcrlerden gelen kat\u0131l\u0131mc\u0131lar aras\u0131nda kal\u0131c\u0131 ba\u011flar kurmak.",
                    "Markalara, gen\u00e7 hedef kitle ile do\u011frudan ve sahici temas kurabilecekleri alanlar sunmak.",
                    "Sporun e\u011fitici, birle\u015ftirici ve ilham verici g\u00fcc\u00fcn\u00fc g\u00f6r\u00fcn\u00fcr k\u0131lmak."
                ],
                footer: "Amac\u0131m\u0131z Sayfas\u0131"
            },
            en: {
                title: "Purpose of the Event | DCFLSPORTFEST'26",
                eyebrow: "PURPOSE",
                h1: "Purpose of the Event",
                hero: [
                    "DCFLSPORTFEST'26 is an international organization designed to deliver a multi-dimensional sports and youth experience.",
                    "Our core objectives:",
                    "In this way, DCFLSPORTFEST'26 promises continuity, not just a single event."
                ],
                heroList: [
                    "To spread international sports culture among young people",
                    "To provide young athletes with a platform where they can express themselves and gain visibility",
                    "To build a strong and lasting bond between brands and the young target audience",
                    "To unite sport, entertainment and experience under a single festival roof",
                    "To open the way for international collaborations and new projects"
                ],
                section: "VISION AND MISSION",
                sectionTitle: "Our Core Approach",
                tileTitles: ["Vision", "Mission"],
                tileParagraphs: [
                    "We aim to turn DCFLSPORTFEST'26 into a sustainable and prestigious sports festival that brings together young athletes, clubs and sports brands from different countries every year.",
                    "In the long term, we want DCFLSPORTFEST'26 to become an event with the following qualities:",
                    "The mission of DCFLSPORTFEST'26 is to position sport not only as a competition arena, but also as a tool for communication, development and cultural exchange.",
                    "In line with this mission, our priority goals are:"
                ],
                tileList: [
                    "Attracting regular participants from Europe, the Middle East and the Balkans.",
                    "Being recognized as a reference point in youth and sports.",
                    "Becoming a strategic communication and experience platform for brands.",
                    "Enabling young people to gain international experience through sport.",
                    "Building lasting bonds among participants from different cultures.",
                    "Giving brands spaces where they can make direct and authentic contact with a young audience.",
                    "Making the educational, unifying and inspiring power of sport visible."
                ],
                footer: "Purpose Page"
            },
            pl: {
                title: "Cel Wydarzenia | DCFLSPORTFEST'26",
                eyebrow: "CEL",
                h1: "Cel Wydarzenia",
                hero: [
                    "DCFLSPORTFEST'26 to miedzynarodowa organizacja, ktora ma dostarczac wielowymiarowe doswiadczenie sportowe i mlodziezowe.",
                    "Nasze glowne cele:",
                    "Dzieki temu DCFLSPORTFEST'26 obiecuje ciaglosc, a nie tylko jednorazowe wydarzenie."
                ],
                heroList: [
                    "Upowszechniac miedzynarodowa kulture sportu wsrod mlodziezy",
                    "Zapewniac mlodym sportowcom platforme do wyrazania siebie i zdobywania widocznosci",
                    "Budowac silna i trwala wiez miedzy markami a mloda grupa docelowa",
                    "Laczyc sport, rozrywke i doswiadczenie pod jednym szyldem festiwalu",
                    "Otwierac droge dla miedzynarodowej wspolpracy i nowych projektow"
                ],
                section: "WIZJA I MISJA",
                sectionTitle: "Nasze Glowne Podejscie",
                tileTitles: ["Wizja", "Misja"],
                tileParagraphs: [
                    "Naszym celem jest przeksztalcenie DCFLSPORTFEST'26 w zrownowazony i prestizowy festiwal sportowy, ktory co roku laczy mlodych sportowcow, kluby i marki sportowe z roznych krajow.",
                    "W dluzszej perspektywie chcemy, aby DCFLSPORTFEST'26 mial nastepujace cechy:",
                    "Misja DCFLSPORTFEST'26 polega na tym, by postrzegac sport nie tylko jako przestrzen rywalizacji, ale takze jako narzedzie komunikacji, rozwoju i wymiany kulturowej.",
                    "W tym kierunku nasze priorytetowe cele to:"
                ],
                tileList: [
                    "Regularnie przyciagac uczestnikow z Europy, Bliskiego Wschodu i Balkanow.",
                    "Byc uznawanym za punkt odniesienia w obszarze mlodziezy i sportu.",
                    "Stac sie strategiczna platforma komunikacji i doswiadczenia dla marek.",
                    "Umozliwiac mlodym ludziom zdobywanie miedzynarodowego doswiadczenia poprzez sport.",
                    "Budowac trwale relacje miedzy uczestnikami z roznych kultur.",
                    "Tworzyc dla marek przestrzenie do bezposredniego i autentycznego kontaktu z mloda grupa odbiorcow.",
                    "Pokazywac edukacyjna, integrujaca i inspirujaca sile sportu."
                ],
                footer: "Strona Celu"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setList(".page-shell .hero-text", copy.hero);
        setList(".page-shell .hero-list li", copy.heroList);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.sectionTitle);
        setList(".feature-grid .tile h3", copy.tileTitles);
        setList(".feature-grid .tile p", copy.tileParagraphs);
        setList(".feature-grid .tile ul li", copy.tileList);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyFaq(lang) {
        var copy = {
            tr: {
                title: "S\u0131k\u00e7a Sorulanlar | DCFLSPORTFEST'26",
                eyebrow: "SIK\u00c7A SORULANLAR",
                h1: "Merak edilen sorular\u0131n net cevaplar\u0131.",
                hero: "Kat\u0131l\u0131m, kay\u0131t, kontenjan ve sponsorluk s\u00fcre\u00e7leriyle ilgili en \u00e7ok sorulan sorular\u0131 burada bulabilirsin.",
                section: "SIK\u00c7A SORULANLAR",
                title2: "H\u0131zl\u0131 Cevaplar",
                cardsTitle: ["Kay\u0131t nas\u0131l yap\u0131l\u0131r?", "Bran\u015flara kat\u0131l\u0131m s\u0131n\u0131r\u0131 var m\u0131?", "Sponsor ba\u015fvurusu nas\u0131l olur?"],
                cardsText: [
                    "\u0130leti\u015fim sekmesindeki form \u00fczerinden tak\u0131m veya bireysel ba\u015fvuru al\u0131n\u0131r.",
                    "Her bran\u015f i\u00e7in kontenjan vard\u0131r. Erken ba\u015fvuru \u00f6nceli\u011fi uygulan\u0131r.",
                    "\u0130leti\u015fim sekmesinden sponsorluk konusu se\u00e7ilerek teklif g\u00f6nderilebilir."
                ],
                footer: "S\u0131k\u00e7a Sorulanlar Sayfas\u0131"
            },
            en: {
                title: "FAQ | DCFLSPORTFEST'26",
                eyebrow: "FAQ",
                h1: "Clear answers to common questions.",
                hero: "Find the most frequently asked questions about registration, quotas and sponsorship.",
                section: "FAQ",
                title2: "Quick Answers",
                cardsTitle: ["How do I register?", "Is there a participation limit for branches?", "How does sponsorship application work?"],
                cardsText: [
                    "Team or individual applications are collected through the form on the contact page.",
                    "Each branch has a quota. Early applications are prioritized.",
                    "You can send a proposal by selecting the sponsorship topic from the contact page."
                ],
                footer: "FAQ Page"
            },
            pl: {
                title: "FAQ | DCFLSPORTFEST'26",
                eyebrow: "FAQ",
                h1: "Jasne odpowiedzi na najczestsze pytania.",
                hero: "Znajdziesz tu najczestsze pytania o rejestracje, limity i sponsoring.",
                section: "FAQ",
                title2: "Szybkie Odpowiedzi",
                cardsTitle: ["Jak sie zarejestrowac?", "Czy istnieje limit uczestnikow w dyscyplinach?", "Jak dziala zgloszenie sponsorskie?"],
                cardsText: [
                    "Zgloszenia druzynowe i indywidualne przyjmowane sa przez formularz na stronie kontaktowej.",
                    "Kazda dyscyplina ma limit miejsc. Wczesniejsze zgloszenia maja pierwszenstwo.",
                    "Mozesz wyslac propozycje, wybierajac temat sponsoringu na stronie kontaktowej."
                ],
                footer: "Strona FAQ"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setList(".faq-card h3", copy.cardsTitle);
        setList(".faq-card p", copy.cardsText);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applySporcuBasvuru(lang) {
        var copy = {
            tr: {
                title: "Sporcu Ba\u015fvuru | DCFLSPORTFEST'26",
                eyebrow: "SPORCU BA\u015eVURU",
                h1: "Ba\u015fvurunu ilet, de\u011ferlendirmeye alal\u0131m.",
                hero: "Tak\u0131m veya bireysel sporcu ba\u015fvurular\u0131n\u0131 g\u00fcvenli form \u00fczerinden g\u00f6nderebilirsin.",
                infoTitle: "Ba\u015fvuru Bilgileri",
                infoDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 K\u00fc\u00e7\u00fck\u00e7ekmece / \u0130stanbul",
                    "<strong>Not:</strong> Bran\u015f, okul ve sorumlu \u00f6\u011fretmen bilgilerini eksiksiz gir."
                ],
                formTitle: "Sporcu Ba\u015fvuru Formu",
                labels: [
                    "Ad Soyad / Okul Ad\u0131",
                    "Kat\u0131l\u0131m Sa\u011flanan Bran\u015f",
                    "Sorumlu Beden \u00d6\u011fretmeni",
                    "Sorumlu Beden \u00d6\u011fretmeni Telefon Numaras\u0131",
                    "Sorumlu Beden \u00d6\u011fretmeni E-Posta",
                    "Gelecek Sporcu \u00d6\u011frenci Say\u0131s\u0131",
                    "Ek Notlar"
                ],
                placeholders: [
                    "Ad Soyad / Okul Ad\u0131",
                    "Kat\u0131l\u0131m Sa\u011flanan Bran\u015f",
                    "Sorumlu Beden \u00d6\u011fretmeni",
                    "05xx xxx xx xx",
                    "ornek@mail.com",
                    "0",
                    "Eklemek istedi\u011fin notlar\u0131 yaz..."
                ],
                send: "Ba\u015fvuruyu G\u00f6nder",
                status: "Ba\u015fvurun g\u00fcvenli form kanal\u0131yla iletilir.",
                footer: "Sporcu Ba\u015fvuru Sayfas\u0131"
            },
            en: {
                title: "Athlete Application | DCFLSPORTFEST'26",
                eyebrow: "ATHLETE APPLICATION",
                h1: "Submit your application for review.",
                hero: "You can send team or individual athlete applications through the secure form.",
                infoTitle: "Application Details",
                infoDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Location:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Note:</strong> Fill in the branch, school and responsible teacher details completely."
                ],
                formTitle: "Athlete Application Form",
                labels: [
                    "Full Name / School Name",
                    "Participating Branch",
                    "Responsible PE Teacher",
                    "Responsible PE Teacher Phone Number",
                    "Responsible PE Teacher E-mail",
                    "Number of Athlete Students Attending",
                    "Additional Notes"
                ],
                placeholders: [
                    "Full Name / School Name",
                    "Participating Branch",
                    "Responsible PE Teacher",
                    "+90 5xx xxx xx xx",
                    "example@mail.com",
                    "0",
                    "Write any additional notes..."
                ],
                send: "Submit Application",
                status: "Your application is sent through the secure form channel.",
                footer: "Athlete Application Page"
            },
            pl: {
                title: "Zgloszenie Zawodnika | DCFLSPORTFEST'26",
                eyebrow: "ZGLOSZENIE ZAWODNIKA",
                h1: "Przeslij zgloszenie do oceny.",
                hero: "Mozesz wyslac zgloszenia druzynowe lub indywidualne przez bezpieczny formularz.",
                infoTitle: "Informacje o Zgloszeniu",
                infoDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Lokalizacja:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Notatka:</strong> Wypelnij komplet informacji o dyscyplinie, szkole i nauczycielu odpowiedzialnym."
                ],
                formTitle: "Formularz Zgloszenia Zawodnika",
                labels: [
                    "Imie i nazwisko / Nazwa szkoly",
                    "Dyscyplina",
                    "Nauczyciel WF odpowiedzialny",
                    "Telefon nauczyciela WF odpowiedzialnego",
                    "E-mail nauczyciela WF odpowiedzialnego",
                    "Liczba uczniow-sportowcow",
                    "Dodatkowe notatki"
                ],
                placeholders: [
                    "Imie i nazwisko / Nazwa szkoly",
                    "Dyscyplina",
                    "Nauczyciel WF odpowiedzialny",
                    "+48 ...",
                    "przyklad@mail.com",
                    "0",
                    "Wpisz dodatkowe notatki..."
                ],
                send: "Wyslij Zgloszenie",
                status: "Zgloszenie zostanie wyslane przez bezpieczny formularz.",
                footer: "Strona Zgloszenia Zawodnika"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText(".contact-info h2", copy.infoTitle);
        if (Array.isArray(copy.infoDetails)) {
            setHTML(".contact-info .section-text:nth-of-type(1)", copy.infoDetails[0]);
            setHTML(".contact-info .section-text:nth-of-type(2)", copy.infoDetails[1]);
            setHTML(".contact-info .section-text:nth-of-type(3)", copy.infoDetails[2]);
        }
        setText(".contact-form-card h2", copy.formTitle);
        setText("label[for='athlete-name']", copy.labels[0]);
        setText("label[for='athlete-topic']", copy.labels[1]);
        setText("label[for='athlete-teacher-name']", copy.labels[2]);
        setText("label[for='athlete-teacher-phone']", copy.labels[3]);
        setText("label[for='athlete-email']", copy.labels[4]);
        setText("label[for='athlete-student-count']", copy.labels[5]);
        setText("label[for='athlete-message']", copy.labels[6]);
        setAttr("#athlete-name", "placeholder", copy.placeholders[0]);
        setAttr("#athlete-topic", "placeholder", copy.placeholders[1]);
        setAttr("#athlete-teacher-name", "placeholder", copy.placeholders[2]);
        setAttr("#athlete-teacher-phone", "placeholder", copy.placeholders[3]);
        setAttr("#athlete-email", "placeholder", copy.placeholders[4]);
        setAttr("#athlete-student-count", "placeholder", copy.placeholders[5]);
        setAttr("#athlete-message", "placeholder", copy.placeholders[6]);
        setText(".contact-form-card .btn", copy.send);
        setText(".contact-form-status", copy.status);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyBlog(lang) {
        var copy = {
            tr: {
                title: "Blog | DCFLSPORTFEST'26",
                eyebrow: "BLOG",
                h1: "Sportfest g\u00fcndeminden notlar.",
                hero: "Etkinlik haz\u0131rl\u0131klar\u0131, bran\u015f hikayeleri ve organizasyon g\u00fcncellemeleri.",
                section: "YAKINDA",
                title2: "Yak\u0131nda",
                postMeta: ["Yak\u0131nda", "Yak\u0131nda", "Yak\u0131nda"],
                postTitles: ["Yak\u0131nda", "Yak\u0131nda", "Yak\u0131nda"],
                postText: ["Yak\u0131nda", "Yak\u0131nda", "Yak\u0131nda"],
                footer: "Yak\u0131nda"
            },
            en: {
                title: "Blog | DCFLSPORTFEST'26",
                eyebrow: "BLOG",
                h1: "Coming Soon",
                hero: "Coming Soon",
                section: "COMING SOON",
                title2: "Coming Soon",
                postMeta: ["Coming Soon", "Coming Soon", "Coming Soon"],
                postTitles: ["Coming Soon", "Coming Soon", "Coming Soon"],
                postText: ["Coming Soon", "Coming Soon", "Coming Soon"],
                footer: "Coming Soon"
            },
            pl: {
                title: "Blog | DCFLSPORTFEST'26",
                eyebrow: "BLOG",
                h1: "Wkr\u00f3tce",
                hero: "Wkr\u00f3tce",
                section: "WKR\u00d3TCE",
                title2: "Wkr\u00f3tce",
                postMeta: ["Wkr\u00f3tce", "Wkr\u00f3tce", "Wkr\u00f3tce"],
                postTitles: ["Wkr\u00f3tce", "Wkr\u00f3tce", "Wkr\u00f3tce"],
                postText: ["Wkr\u00f3tce", "Wkr\u00f3tce", "Wkr\u00f3tce"],
                footer: "Wkr\u00f3tce"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setList(".post-meta", copy.postMeta);
        setList(".post-card h3", copy.postTitles);
        setList(".post-card p:not(.post-meta)", copy.postText);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyArsiv(lang) {
        var copy = {
            tr: {
                title: "Ar\u015fiv | DCFLSPORTFEST'26",
                eyebrow: "AR\u015e\u0130V",
                h1: "Etkinlik Ar\u015fivi",
                hero: "Ge\u00e7mi\u015f y\u0131llara ait duyurular, g\u00f6rseller ve \u00f6ne \u00e7\u0131kan anlar yak\u0131nda burada yer alacak.",
                section: "AR\u015e\u0130V",
                title2: "Yak\u0131nda Eklenecek \u0130\u00e7erikler",
                postMeta: ["Yak\u0131nda", "Yak\u0131nda", "Yak\u0131nda"],
                postTitles: ["Ge\u00e7mi\u015f Etkinlik Foto\u011fraflar\u0131", "Turnuva Sonu\u00e7 Ar\u015fivi", "Bas\u0131n ve Duyuru Kay\u0131tlar\u0131"],
                postText: [
                    "\u00d6nceki d\u00f6nem organizasyonlar\u0131ndan \u00f6ne \u00e7\u0131kan kareler bu alanda yay\u0131nlanacak.",
                    "Bran\u015f bazl\u0131 ge\u00e7mi\u015f y\u0131llar\u0131n fikst\u00fcr ve sonu\u00e7lar\u0131 ar\u015fiv olarak eri\u015fime a\u00e7\u0131lacak.",
                    "Ge\u00e7mi\u015f duyurular, afi\u015fler ve medya i\u00e7erikleri tek noktadan g\u00f6r\u00fcnt\u00fclenebilecek."
                ],
                footer: "Ar\u015fiv Sayfas\u0131"
            },
            en: {
                title: "Archive | DCFLSPORTFEST'26",
                eyebrow: "ARCHIVE",
                h1: "Event Archive",
                hero: "Announcements, visuals and highlights from previous years will be added here soon.",
                section: "ARCHIVE",
                title2: "Upcoming Archive Content",
                postMeta: ["Soon", "Soon", "Soon"],
                postTitles: ["Photos from Past Events", "Tournament Results Archive", "Press and Announcement Records"],
                postText: [
                    "Highlight frames from previous editions will be published in this area.",
                    "Past years' fixtures and results by branch will be available as an archive.",
                    "Past announcements, posters and media content will be viewable from a single point."
                ],
                footer: "Archive Page"
            },
            pl: {
                title: "Archiwum | DCFLSPORTFEST'26",
                eyebrow: "ARCHIWUM",
                h1: "Archiwum Wydarzenia",
                hero: "Wkrotce pojawia sie tu ogloszenia, materialy wizualne i najwazniejsze momenty z poprzednich lat.",
                section: "ARCHIWUM",
                title2: "Nadchodzace Materialy",
                postMeta: ["Wkrotce", "Wkrotce", "Wkrotce"],
                postTitles: ["Zdjecia z poprzednich wydarzen", "Archiwum wynikow turniejowych", "Materialy prasowe i ogloszenia"],
                postText: [
                    "Najciekawsze kadry z poprzednich edycji zostana opublikowane w tej sekcji.",
                    "Dawne terminarze i wyniki wedlug dyscyplin beda dostepne w archiwum.",
                    "Wczesniejsze ogloszenia, plakaty i materialy medialne beda widoczne w jednym miejscu."
                ],
                footer: "Strona Archiwum"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setList(".post-meta", copy.postMeta);
        setList(".post-card h3", copy.postTitles);
        setList(".post-card p:not(.post-meta)", copy.postText);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyIletisim(lang) {
        var copy = {
            tr: {
                title: "\u0130leti\u015fim | DCFLSPORTFEST'26",
                eyebrow: "\u0130LET\u0130\u015e\u0130M",
                h1: "Bize ula\u015f, birlikte planlayal\u0131m.",
                hero: "Tak\u0131m kayd\u0131, partnerlik veya genel sorular i\u00e7in formu doldurabilirsin.",
                contact: "\u0130leti\u015fim Bilgileri",
                contactDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 K\u00fc\u00e7\u00fck\u00e7ekmece / \u0130stanbul",
                    "<strong>Tarih:</strong> 12-13-14 May\u0131s 2026"
                ],
                quick: "H\u0131zl\u0131 Mesaj",
                labels: ["Ad Soyad/ Firma Ad\u0131", "E-posta", "Konu", "Mesaj"],
                placeholders: ["Ad Soyad/ Firma Ad\u0131", "ornek@mail.com", "Tak\u0131m kayd\u0131 / Sponsorluk / Soru", "Mesaj\u0131n\u0131 yaz..."],
                send: "G\u00f6nder",
                footer: "\u0130leti\u015fim Sayfas\u0131"
            },
            en: {
                title: "Contact | DCFLSPORTFEST'26",
                eyebrow: "CONTACT",
                h1: "Reach us, let's plan together.",
                hero: "You can fill in the form for team registration, partnership or general questions.",
                contact: "Contact Details",
                contactDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Location:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Date:</strong> May 12-14, 2026"
                ],
                quick: "Quick Message",
                labels: ["Name / Company Name", "E-mail", "Subject", "Message"],
                placeholders: ["Name / Company Name", "example@mail.com", "Team registration / Sponsorship / Question", "Write your message..."],
                send: "Send",
                footer: "Contact Page"
            },
            pl: {
                title: "Kontakt | DCFLSPORTFEST'26",
                eyebrow: "KONTAKT",
                h1: "Skontaktuj sie z nami, zaplanujmy to razem.",
                hero: "Wypelnij formularz w sprawie rejestracji druzyny, partnerstwa lub pytan.",
                contact: "Dane Kontaktowe",
                contactDetails: [
                    "<strong>E-mail:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Lokalizacja:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Data:</strong> 12-14 maja 2026"
                ],
                quick: "Szybka Wiadomosc",
                labels: ["Imie i nazwisko / Firma", "E-mail", "Temat", "Wiadomosc"],
                placeholders: ["Imie i nazwisko / Firma", "przyklad@mail.com", "Rejestracja druzyny / Sponsoring / Pytanie", "Napisz wiadomosc..."],
                send: "Wyslij",
                footer: "Strona Kontakt"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell .eyebrow", copy.eyebrow);
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText(".contact-info h2", copy.contact);
        if (Array.isArray(copy.contactDetails)) {
            setHTML(".contact-info .section-text:nth-of-type(1)", copy.contactDetails[0]);
            setHTML(".contact-info .section-text:nth-of-type(2)", copy.contactDetails[1]);
            setHTML(".contact-info .section-text:nth-of-type(3)", copy.contactDetails[2]);
        }
        setText(".contact-form-card h2", copy.quick);
        setText("label[for='name']", copy.labels[0]);
        setText("label[for='email']", copy.labels[1]);
        setText("label[for='topic']", copy.labels[2]);
        setText("label[for='message']", copy.labels[3]);
        setAttr("#name", "placeholder", copy.placeholders[0]);
        setAttr("#email", "placeholder", copy.placeholders[1]);
        setAttr("#topic", "placeholder", copy.placeholders[2]);
        setAttr("#message", "placeholder", copy.placeholders[3]);
        setText(".contact-form-card .btn", copy.send);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyPage(lang) {
        var key = pageKey();
        if (key === "index.html") {
            applyIndex(lang);
        } else if (key === "program.html") {
            applyProgram(lang);
        } else if (key === "finans.html") {
            applyFinans(lang);
        } else if (key === "kurumsal.html") {
            applyKurumsal(lang);
        } else if (key === "hizmetler.html") {
            applyFaq(lang);
        } else if (key === "blog.html") {
            applyBlog(lang);
        } else if (key === "arsiv.html") {
            applyArsiv(lang);
        } else if (key === "sporcu-basvuru.html") {
            applySporcuBasvuru(lang);
        } else if (key === "iletisim.html") {
            applyIletisim(lang);
        }
    }

    function placePicker(nav, wrap) {
        var actions = nav.querySelector("[data-nav-links]");
        var toggle = nav.querySelector("[data-nav-toggle]");
        if (!actions || !wrap) {
            return;
        }

        if (window.innerWidth <= 640 && toggle) {
            wrap.setAttribute("data-nav-lang", "");
            if (wrap.parentElement !== nav || wrap.previousElementSibling !== toggle) {
                toggle.insertAdjacentElement("afterend", wrap);
            }
            return;
        }

        wrap.removeAttribute("data-nav-lang");
        if (wrap.parentElement !== actions) {
            actions.appendChild(wrap);
        }
    }

    function addPicker(nav) {
        var actions = nav.querySelector("[data-nav-links]");
        if (!actions) {
            return;
        }

        var existing = nav.querySelector("[data-lang-picker]");
        if (existing) {
            var existingWrap = existing.closest(".lang-switch") || existing.parentElement;
            if (existingWrap) {
                if (existingWrap.parentElement !== actions) {
                    actions.appendChild(existingWrap);
                }
                placePicker(nav, existingWrap);
            }
            return;
        }

        var wrap = document.createElement("div");
        wrap.className = "lang-switch";

        var picker = document.createElement("select");
        picker.className = "lang-picker";
        picker.setAttribute("data-lang-picker", "");

        LANG_OPTIONS.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item.code;
            option.textContent = item.label;
            picker.appendChild(option);
        });

        picker.value = getLang();
        picker.addEventListener("change", function () {
            var nextLang = normalizeLang(picker.value);
            setLang(nextLang);
            applyCommon(nextLang);
            applyPage(nextLang);
        });

        wrap.appendChild(picker);
        actions.appendChild(wrap);
        placePicker(nav, wrap);
    }

    function syncPickerLayout() {
        navs.forEach(function (nav) {
            var wrap = nav.querySelector(".lang-switch");
            if (wrap) {
                placePicker(nav, wrap);
            }
        });
    }

    var initialLang = getLang();
    navs.forEach(addPicker);
    syncPickerLayout();
    window.addEventListener("resize", syncPickerLayout);
    applyCommon(initialLang);
    applyPage(initialLang);

    if (pageKey() === "program.html" && window.DCFLSiteData && typeof window.DCFLSiteData.loadData === "function") {
        window.DCFLSiteData.loadData().then(function () {
            if (typeof renderProgramFixtures === "function") {
                renderProgramFixtures(getLang());
            }
        }).catch(function () {
            // Program page can continue with fallback fixture data.
        });
    }
})();
