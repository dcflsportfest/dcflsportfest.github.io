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
    var toggle = document.querySelector("[data-branches-toggle]");
    var panel = document.querySelector("[data-branches-panel]");
    if (!toggle || !panel) {
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

        var tabs = group.querySelectorAll("[data-fixture-tab]");
        if (!tabs.length) {
            return;
        }

        var panelsContainer = group.nextElementSibling;
        if (!panelsContainer) {
            return;
        }

        var panels = panelsContainer.querySelectorAll("[data-fixture-panel]");

        function activate(branch) {
            tabs.forEach(function (tab) {
                var isActive = tab.getAttribute("data-fixture-tab") === branch;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            panels.forEach(function (panel) {
                var isActive = panel.getAttribute("data-fixture-panel") === branch;
                panel.classList.toggle("active", isActive);
                panel.hidden = !isActive;
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
            panel.hidden = !panel.classList.contains("active");
        });

        group.setAttribute("data-fixture-ready", "true");

        var initiallyActive = group.querySelector("[data-fixture-tab].active");
        activate(initiallyActive ? initiallyActive.getAttribute("data-fixture-tab") : tabs[0].getAttribute("data-fixture-tab"));
    });
}

var renderScoreResults = (function () {
    var uiCopy = {
        tr: {
            dayTabsAria: "G\u00fcnlere g\u00f6re sonu\u00e7lar",
            dayCaptions: {
                "12-mayis": "Bran\u015fa g\u00f6re \u00e7eyrek final sonu\u00e7lar\u0131",
                "13-mayis": "Bran\u015fa g\u00f6re yar\u0131 final sonu\u00e7lar\u0131",
                "14-mayis": "Bran\u015fa g\u00f6re final sonu\u00e7lar\u0131"
            },
            resultsTitle: function (branchName) {
                return branchName + " Sonu\u00e7lar\u0131";
            },
            rounds: {
                qf: "\u00c7eyrek Final",
                sf: "Yar\u0131 Final",
                final: "Final"
            }
        },
        en: {
            dayTabsAria: "Results by day",
            dayCaptions: {
                "12-mayis": "Quarter-final results by branch",
                "13-mayis": "Semi-final results by branch",
                "14-mayis": "Final results by branch"
            },
            resultsTitle: function (branchName) {
                return branchName + " Results";
            },
            rounds: {
                qf: "Quarter-final",
                sf: "Semi-final",
                final: "Final"
            }
        },
        pl: {
            dayTabsAria: "Wyniki wedlug dni",
            dayCaptions: {
                "12-mayis": "Wyniki cwiercfinalow wedlug dyscyplin",
                "13-mayis": "Wyniki polfinalow wedlug dyscyplin",
                "14-mayis": "Wyniki finalowe wedlug dyscyplin"
            },
            resultsTitle: function (branchName) {
                return "Wyniki: " + branchName;
            },
            rounds: {
                qf: "Cwiercfinal",
                sf: "Polfinal",
                final: "Final"
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
                pairs: [["DCFL A", "Warsaw Falcons"], ["Sofia Spike", "Balkan Ace"], ["Skopje Smash", "Riga Net"], ["Belgrade Block", "Plovdiv Serve"]],
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
                pairs: [["DCFL Hoops", "Istanbul Stars"], ["Sofia Hoops", "Balkan Academy"], ["Skopje Drive", "Warsaw Blaze"], ["Riga Court", "Belgrade Titans"]],
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
                pairs: [["DCFL Blue", "Warsaw United"], ["Balkan Youth", "Sofia Youth"], ["DCFL Red", "Belgrade Next"], ["Skopje Juniors", "Plovdiv FC"]],
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
                pairs: [["Elif Kaya", "Jana Lis"], ["Aylin Demir", "Maria Z."], ["Kamil W.", "Sofi Petrova"], ["Lina R.", "Deniz A."]],
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
                pairs: [["DCFL Archers", "Riga Target"], ["Sofia Arrows", "Belgrade Youth"], ["Skopje Bow", "Warsaw Aim"], ["Plovdiv Range", "Ankara Focus"]],
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
                pairs: [["DCFL Trail", "Sofia Compass"], ["Belgrade Map", "Warsaw Route"], ["Skopje Track", "Riga North"], ["Plovdiv Path", "Izmir Orienteers"]],
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
                pairs: [["DCFL White", "Warsaw Kings"], ["DCFL Black", "Plovdiv Queens"], ["Sofia Minds", "Riga Masters"], ["Belgrade Strategy", "Skopje Knights"]],
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
                pairs: [["Mert K.", "Jan Nowak"], ["Ali T.", "Kamil P."], ["Sofia G.", "Emre Y."], ["Luka S.", "Ana M."]],
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
                pairs: [["DCFL Sprint", "Varna Track"], ["Thessaloniki Track", "Warsaw Lane"], ["Sofia Dash", "Belgrade Run"], ["Skopje Fast", "Riga Motion"]],
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
                pairs: [["Tak\u0131m Mavi", "Tak\u0131m Gold"], ["Tak\u0131m Forest", "Tak\u0131m Solar"], ["Tak\u0131m Kuzey", "Tak\u0131m Atlas"], ["Tak\u0131m Nova", "Tak\u0131m Lotus"]],
                scores: [["21", "18"], ["19", "23"], ["24", "20"], ["17", "22"]]
            },
            sf: { times: ["16:15", "17:30"], scores: [["26", "21"], ["18", "24"]] },
            final: { time: "11:45", score: ["27", "25"] }
        }
    ];

    function pickText(value, lang) {
        if (value && typeof value === "object") {
            return value[lang] || value.tr || value.en || value.pl || "";
        }
        return value || "";
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

    function getWinnerKey(score, lowWins) {
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

    function createMatch(day, template, stageKey, index, time, home, away, score, lang) {
        var winner = getWinnerKey(score, !!template.lowWins);
        return {
            stage: buildStageLabel(stageKey, index, lang),
            time: time,
            home: home,
            away: away,
            homeScore: score[0],
            awayScore: score[1],
            winner: winner,
            meta: pickText(day.fullDate, lang) + " | " + time + " | " + pickText(template.venue, lang)
        };
    }

    function getWinnerName(match) {
        return match.winner === "home" ? match.home : match.away;
    }

    function buildMatchesForBranch(template, day, lang) {
        var qfMatches = template.qf.pairs.map(function (pair, index) {
            return createMatch(day, template, "qf", index, template.qf.times[index], pair[0], pair[1], template.qf.scores[index], lang);
        });

        if (day.stage === "qf") {
            return qfMatches;
        }

        var sfPairs = [
            [getWinnerName(qfMatches[0]), getWinnerName(qfMatches[1])],
            [getWinnerName(qfMatches[2]), getWinnerName(qfMatches[3])]
        ];
        var sfMatches = sfPairs.map(function (pair, index) {
            return createMatch(day, template, "sf", index, template.sf.times[index], pair[0], pair[1], template.sf.scores[index], lang);
        });

        if (day.stage === "sf") {
            return sfMatches;
        }

        return [
            createMatch(day, template, "final", 0, template.final.time, getWinnerName(sfMatches[0]), getWinnerName(sfMatches[1]), template.final.score, lang)
        ];
    }

    function renderResultMatchCard(match) {
        var homeClass = match.winner === "home" ? " is-leading" : "";
        var awayClass = match.winner === "away" ? " is-leading" : "";

        return [
            "<article class=\"score-card score-card-result\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + match.stage + "</p>",
            "        <span class=\"score-card-badge score-card-badge-final\">" + match.time + "</span>",
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

    function renderDayPanel(day, lang, dayUi, isActive) {
        var branchTabs = branchTemplates.map(function (branch, index) {
            return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-fixture-tab=\"" + branch.key + "\">" + pickText(branch.name, lang) + "</button>";
        }).join("");

        var branchPanels = branchTemplates.map(function (branch, index) {
            var matches = buildMatchesForBranch(branch, day, lang);
            return [
                "<article class=\"fixture-panel score-results-branch-panel" + (index === 0 ? " active" : "") + "\" data-fixture-panel=\"" + branch.key + "\">",
                "    <h3>" + dayUi.resultsTitle(pickText(branch.name, lang)) + "</h3>",
                "    <div class=\"scoreboard-grid score-results-grid\">",
                matches.map(function (match) { return renderResultMatchCard(match); }).join(""),
                "    </div>",
                "</article>"
            ].join("");
        }).join("");

        return [
            "<section class=\"score-results-day-panel" + (isActive ? " active" : "") + "\" id=\"score-results-" + day.key + "\" data-score-day-panel=\"" + day.key + "\"" + (isActive ? "" : " hidden") + ">",
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

    function activateDay(group, dayKey) {
        var tabs = group.querySelectorAll("[data-score-day-tab]");
        var panels = group.querySelectorAll("[data-score-day-panel]");

        tabs.forEach(function (tab) {
            var isActive = tab.getAttribute("data-score-day-tab") === dayKey;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        panels.forEach(function (panel) {
            var isActive = panel.getAttribute("data-score-day-panel") === dayKey;
            panel.classList.toggle("active", isActive);
            panel.hidden = !isActive;
        });
    }

    return function (lang) {
        var currentLang = uiCopy[lang] ? lang : "tr";
        var dayUi = uiCopy[currentLang];
        var shells = document.querySelectorAll("[data-score-results]");
        if (!shells.length) {
            return;
        }

        shells.forEach(function (shell) {
            shell.innerHTML = [
                "<div class=\"fixture-tabs score-results-day-tabs\" role=\"tablist\" aria-label=\"" + dayUi.dayTabsAria + "\">",
                days.map(function (day, index) {
                    return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-score-day-tab=\"" + day.key + "\" aria-selected=\"" + (index === 0 ? "true" : "false") + "\" aria-controls=\"score-results-" + day.key + "\">" + pickText(day.label, currentLang) + "</button>";
                }).join(""),
                "</div>",
                "<div class=\"score-results-day-panels\">",
                days.map(function (day, index) {
                    return renderDayPanel(day, currentLang, dayUi, index === 0);
                }).join(""),
                "</div>"
            ].join("");

            shell.querySelectorAll("[data-score-day-tab]").forEach(function (tab) {
                tab.setAttribute("role", "tab");
                tab.addEventListener("click", function () {
                    activateDay(shell, tab.getAttribute("data-score-day-tab"));
                });
            });

            shell.querySelectorAll("[data-score-day-panel]").forEach(function (panel) {
                panel.setAttribute("role", "tabpanel");
            });

            initializeFixtureTabGroups(shell);
            activateDay(shell, days[0].key);
        });
    };
});

(function () {
    initializeFixtureTabGroups(document);
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
                stats: ["10 Adet Bran\u015f", "Her G\u00fcn 200+ Kat\u0131l\u0131mc\u0131"],
                sponsorCta: "Sponsor Ol",
                countdown: "SportFeste kalan s\u00fcre",
                countdownLabels: ["G\u00fcn", "Saat", "Dakika", "Saniye"],
                ended: "Festival ba\u015flad\u0131!",
                scoreboard: {
                    kicker: "SKOR MERKEZI",
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
                contactTitle: "\u0130leti\u015fim Formu",
                contactDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Tarih:</strong> 12-13-14 Mayis 2026"
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
                stats: ["10 Sports Branches", "200+ Participants Daily"],
                sponsorCta: "Become a Sponsor",
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
                stats: ["10 Dyscyplin", "200+ Uczestnikow Dziennie"],
                sponsorCta: "Zostan Sponsorem",
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
        setText(".stats-branch-trigger h3", copy.stats[0]);
        setText(".stats article:nth-child(2) h3", copy.stats[1]);
        setText(".countdown-title", copy.countdown);
        setText(".countdown-cta", copy.sponsorCta);
        setList(".countdown-label", copy.countdownLabels);
        setAttr("[data-countdown]", "data-ended-text", copy.ended);
        applyScoreboard(copy);
        renderScoreResults(lang);
        setList(".home-branch-list li", copy.branches);
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
                h1: "12-13-14 May\u0131s etkinlik ve fikst\u00fcr ak\u0131\u015f\u0131.",
                hero: "A\u00e7\u0131l\u0131\u015f, g\u00fcnl\u00fck etkinlik plan\u0131 ve bran\u015f bazl\u0131 8 tak\u0131ml\u0131 t\u00fcm turnuva fikst\u00fcrlerini tek sayfada takip edebilirsin.",
                sections: ["OPERASYON AKISI", "FESTIVAL HATLARI", "FIKSTUR DETAYLARI"],
                titles: ["Gunluk Program", "Branslar", "Turnuva Secim Ekrani"],
                tabs: ["Voleybol", "Basketbol", "Futbol", "Masa Tenisi", "Okculuk", "Oryantiring", "Bahce Satranci", "PlayStation", "Atletizm", "Bahce Oyunlari"],
                panels: ["Voleybol Fiksturu", "Basketbol Fiksturu", "Futbol Fiksturu", "Masa Tenisi Fiksturu", "Okculuk Fiksturu", "Oryantiring Fiksturu", "Bahce Satranci Fiksturu", "PlayStation Turnuvasi Fiksturu", "Atletizm Fiksturu", "Bahce Oyunlari Fiksturu"],
                timelineTitles: [
                    "12 Mayis | Ceyrek Finaller ve Acilis",
                    "13 Mayis | Yari Finaller ve Yan Etkinlikler",
                    "14 Mayis | Final ve Odul Toreni"
                ],
                timelineText: [
                    "8 takim ile baslayan turnuva eslesmeleri ve acilis seremonisi ayni gun baslar.",
                    "Ceyrek final galipleri yari finalde bulusur; gun boyunca yan etkinlik akisi devam eder.",
                    "Her bransta sampiyonluk maci oynanir, ardindan kupa seremonisi ve kapanis yapilir."
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
                footer: "Program & Turnuva Sayfasi"
            },
            en: {
                title: "Program & Tournament | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TOURNAMENT",
                h1: "12-13-14 May event and fixture flow.",
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
                h1: "Harmonogram wydarzenia i terminarzy 12-13-14 maja.",
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
        setList(".fixture-tab", copy.tabs);
        setList(".fixture-panel > h3", copy.panels);
        mapText(".fixture-table th", copy.headerMap);
        replaceText(".bracket-round-title", copy.detailMap);
        replaceText(".bracket-match-meta", copy.detailMap);
        replaceText(".bracket-team-name", copy.detailMap);
        replaceText(".fixture-schedule-kicker", copy.detailMap);
        replaceText(".fixture-schedule-time", copy.detailMap);
        replaceText(".fixture-schedule-item strong", copy.detailMap);
        replaceText(".fixture-schedule-item p", copy.detailMap);
        replaceText(".bracket-note", copy.detailMap);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyFinans(lang) {
        var copy = {
            tr: {
                title: "Finans | DCFLSPORTFEST'26",
                eyebrow: "SPONSORLUK DERECELERI",
                h1: "Sponsorluk Paketlerini Karsilastirin",
                hero: "Ayni sponsorlugu ayri bir blokta, maddi sponsorluk paketlerini ise kolay karsilastirmali kart duzeninde inceleyebilirsin.",
                section: "FINANS",
                sectionTitle: "Sponsorluk Paketlerini Karsilastirin",
                group: "MADDI SPONSORLUK PAKETLERI",
                groupTitle: "Maddi Sponsorluk Paketleri",
                contact: "Iletisim",
                contactDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Not:</strong> Sponsorluk detay dosyasi ve teklif gonderimi icin iletisime gecebilirsin."
                ],
                quick: "Hizli Mesaj",
                labels: ["Ad Soyad / Firma Adi", "E-posta", "Konu", "Mesaj"],
                placeholders: ["Ad Soyad / Firma Adi", "ornek@mail.com", "Sponsorluk Paketi / Dosya Talebi", "Mesajini yaz..."],
                send: "Gonder",
                footer: "Finans Sayfasi"
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
                title: "Etkinligin Amaci | DCFLSPORTFEST'26",
                eyebrow: "AMACIMIZ",
                h1: "Etkinligin Amaci",
                hero: [
                    "DCFLSPORTFEST'26, cok boyutlu bir spor ve genclik deneyimi sunmayi amaclayan uluslararasi bir organizasyondur.",
                    "Etkinlikteki temel amaclarimiz:",
                    "Bu sayede DCFLSPORTFEST'26, yalnizca bir etkinlik degil; sureklilik vadeder."
                ],
                heroList: [
                    "Uluslararasi spor kulturunu gencler arasinda yayginlastirmak",
                    "Genc sporculara kendilerini ifade edebilecekleri ve gorunurluk kazanabilecekleri bir platform sunmak",
                    "Markalar ile genc hedef kitle arasinda guclu ve kalici bir bag olusturmak",
                    "Spor, eglence ve deneyimi tek bir festival catisi altinda birlestirmek",
                    "Uluslararasi is birliklerinin ve yeni projelerin onunu acmak"
                ],
                section: "VIZYON VE MISYON",
                sectionTitle: "Temel Yaklasimimiz",
                tileTitles: ["Vizyon", "Misyon"],
                tileParagraphs: [
                    "DCFLSPORTFEST'26'yi; farkli ulkelerden genc sporcularin, kuluplerin ve spor markalarinin her yil bir araya geldigi, uluslararasi olcekte taninan, surdurulebilir ve prestijli bir spor festivali haline getirmeyi hedefliyoruz.",
                    "Uzun vadede DCFLSPORTFEST'26'nin asagidaki niteliklere sahip bir etkinlik olmasini amacliyoruz:",
                    "DCFLSPORTFEST'26'nin misyonu, sporu yalnizca bir yarisma alani olarak degil; iletisim, gelisim ve kulturel etkilesim araci olarak konumlandirmaktir.",
                    "Bu dogrultuda oncelikli hedeflerimiz:"
                ],
                tileList: [
                    "Avrupa, Orta Dogu ve Balkanlar'dan duzenli katilimci ceken.",
                    "Genclik ve spor alaninda referans gosterilen.",
                    "Markalar icin stratejik bir iletisim ve deneyim platformu olan.",
                    "Genclerin spor yoluyla uluslararasi deneyim kazanmasini saglamak.",
                    "Farkli kulturlerden gelen katilimcilar arasinda kalici baglar kurmak.",
                    "Markalara, genc hedef kitle ile dogrudan ve sahici temas kurabilecekleri alanlar sunmak.",
                    "Sporun egitici, birlestirici ve ilham verici gucunu gorunur kilmak."
                ],
                footer: "Amacimiz Sayfasi"
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
                title: "Sikca Sorulanlar | DCFLSPORTFEST'26",
                eyebrow: "SIKCA SORULANLAR",
                h1: "Merak edilen sorularin net cevaplari.",
                hero: "Katilim, kayit, kontenjan ve sponsorluk surecleriyle ilgili en cok sorulan sorulari burada bulabilirsin.",
                section: "SIKCA SORULANLAR",
                title2: "Hizli Cevaplar",
                cardsTitle: ["Kayit nasil yapilir?", "Branslara katilim siniri var mi?", "Sponsor basvurusu nasil olur?"],
                cardsText: [
                    "Iletisim sekmesindeki form uzerinden takim veya bireysel basvuru alinir.",
                    "Her brans icin kontenjan vardir. Erken basvuru onceligi uygulanir.",
                    "Iletisim sekmesinden sponsorluk konusu secilerek teklif gonderilebilir."
                ],
                footer: "Sikca Sorulanlar Sayfasi"
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

    function applyBlog(lang) {
        var copy = {
            tr: {
                title: "Blog | DCFLSPORTFEST'26",
                eyebrow: "BLOG",
                h1: "Sportfest gundeminden notlar.",
                hero: "Etkinlik hazirliklari, brans hikayeleri ve organizasyon guncellemeleri.",
                section: "ONE CIKANLAR",
                title2: "Son Yazilar",
                postMeta: ["03 Mart 2026", "27 Subat 2026", "18 Subat 2026"],
                postTitles: ["Final Gecesi Sahne Plani", "Brans Kontenjan Guncellemesi", "Sponsor Is Birligi Dalgasi"],
                postText: [
                    "Final akisi, odul toreni ve kapanis sovunun yeni sahne duzeni aciklandi.",
                    "Basketbol, voleybol ve atletizm branslarinda ek kontenjanlar acildi.",
                    "Yeni is ortakliklariyla etkinlik alanindaki deneyim alanlari genisliyor."
                ],
                footer: "Blog Sayfasi"
            },
            en: {
                title: "Blog | DCFLSPORTFEST'26",
                eyebrow: "BLOG",
                h1: "Notes from the Sportfest agenda.",
                hero: "Event preparations, branch stories and organization updates.",
                section: "HIGHLIGHTS",
                title2: "Latest Posts",
                postMeta: ["March 3, 2026", "February 27, 2026", "February 18, 2026"],
                postTitles: ["Stage Plan for Final Night", "Branch Quota Update", "Wave of Sponsor Partnerships"],
                postText: [
                    "The new stage layout for the finals flow, award ceremony and closing show has been announced.",
                    "Additional quotas have been opened in basketball, volleyball and athletics.",
                    "New partnerships are expanding the experience zones across the festival venue."
                ],
                footer: "Blog Page"
            },
            pl: {
                title: "Blog | DCFLSPORTFEST'26",
                eyebrow: "BLOG",
                h1: "Notatki z agendy Sportfest.",
                hero: "Przygotowania wydarzenia, historie dyscyplin i aktualizacje organizacyjne.",
                section: "WYROZNIONE",
                title2: "Najnowsze Wpisy",
                postMeta: ["3 marca 2026", "27 lutego 2026", "18 lutego 2026"],
                postTitles: ["Plan sceny na finalowy wieczor", "Aktualizacja limitow dyscyplin", "Fala partnerstw sponsorskich"],
                postText: [
                    "Ogloszono nowy uklad sceny dla finalu, ceremonii nagrod i pokazu zamkniecia.",
                    "Otwarto dodatkowe limity w koszykowce, siatkowce i lekkoatletyce.",
                    "Nowe partnerstwa rozszerzaja strefy doswiadczen na terenie festiwalu."
                ],
                footer: "Strona Blog"
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
                title: "Arsiv | DCFLSPORTFEST'26",
                eyebrow: "ARSIV",
                h1: "Etkinlik Arsivi",
                hero: "Gecmis yillara ait duyurular, gorseller ve one cikan anlar yakinda burada yer alacak.",
                section: "ARSIV",
                title2: "Yakinda Eklenecek Icerikler",
                postMeta: ["Yakinda", "Yakinda", "Yakinda"],
                postTitles: ["Gecmis Etkinlik Fotograflari", "Turnuva Sonuc Arsivi", "Basin ve Duyuru Kayitlari"],
                postText: [
                    "Onceki donem organizasyonlarindan one cikan kareler bu alanda yayinlanacak.",
                    "Brans bazli gecmis yillarin fikstur ve sonuclari arsiv olarak erisime acilacak.",
                    "Gecmis duyurular, afisler ve medya icerikleri tek noktadan goruntulenebilecek."
                ],
                footer: "Arsiv Sayfasi"
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
                title: "Iletisim | DCFLSPORTFEST'26",
                eyebrow: "ILETISIM",
                h1: "Bize ulas, birlikte planlayalim.",
                hero: "Takim kaydi, partnerlik veya genel sorular icin formu doldurabilirsin.",
                contact: "Iletisim Bilgileri",
                contactDetails: [
                    "<strong>E-posta:</strong> dcflsportfest2020@gmail.com",
                    "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul",
                    "<strong>Tarih:</strong> 12-13-14 Mayis 2026"
                ],
                quick: "Hizli Mesaj",
                labels: ["Ad Soyad/ Firma Adi", "E-posta", "Konu", "Mesaj"],
                placeholders: ["Ad Soyad/ Firma Adi", "ornek@mail.com", "Takim kaydi / Sponsorluk / Soru", "Mesajini yaz..."],
                send: "Gonder",
                footer: "Iletisim Sayfasi"
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
})();
