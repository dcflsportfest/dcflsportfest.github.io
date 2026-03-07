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
                "12-mayis": "Bran\u015fa g\u00f6re sonu\u00e7lar",
                "13-mayis": "Bran\u015fa g\u00f6re sonu\u00e7lar",
                "14-mayis": "Bran\u015fa g\u00f6re final sonu\u00e7lar\u0131"
            },
            resultsTitle: function (branchName) {
                return branchName + " Sonu\u00e7lar\u0131";
            }
        },
        en: {
            dayTabsAria: "Results by day",
            dayCaptions: {
                "12-mayis": "Results by sports branch",
                "13-mayis": "Results by sports branch",
                "14-mayis": "Final results by sports branch"
            },
            resultsTitle: function (branchName) {
                return branchName + " Results";
            }
        },
        pl: {
            dayTabsAria: "Wyniki wed\u0142ug dni",
            dayCaptions: {
                "12-mayis": "Wyniki wed\u0142ug dyscyplin",
                "13-mayis": "Wyniki wed\u0142ug dyscyplin",
                "14-mayis": "Wyniki fina\u0142owe wed\u0142ug dyscyplin"
            },
            resultsTitle: function (branchName) {
                return "Wyniki: " + branchName;
            }
        }
    };

    var days = [
        {
            key: "12-mayis",
            label: { tr: "12 May\u0131s", en: "May 12", pl: "12 maja" },
            fullDate: { tr: "12 May\u0131s 2026", en: "May 12, 2026", pl: "12 maja 2026" },
            branches: [
                { key: "voleybol", name: { tr: "Voleybol", en: "Volleyball", pl: "Siatk\u00f3wka" }, status: { tr: "Grup A", en: "Group A", pl: "Grupa A" }, home: "DCFL A", homeScore: "2", away: "Warsaw Falcons", awayScore: "0", winner: "home", meta: { tr: "A\u00e7\u0131l\u0131\u015f g\u00fcn\u00fc | Kapal\u0131 Spor Salonu | Grup ma\u00e7\u0131", en: "Opening day | Indoor hall | Group match", pl: "Dzie\u0144 otwarcia | Hala sportowa | Mecz grupowy" } },
                { key: "basketbol", name: { tr: "Basketbol", en: "Basketball", pl: "Koszyk\u00f3wka" }, status: { tr: "Grup B", en: "Group B", pl: "Grupa B" }, home: "Istanbul Stars", homeScore: "68", away: "Sofia Hoops", awayScore: "63", winner: "home", meta: { tr: "Ana Saha | Grup etab\u0131 | G\u00fcn sonu skoru", en: "Main court | Group stage | End-of-day score", pl: "Boisko g\u0142\u00f3wne | Etap grupowy | Wynik dnia" } },
                { key: "futbol", name: { tr: "Futbol", en: "Football", pl: "Pi\u0142ka No\u017cna" }, status: { tr: "Grup C", en: "Group C", pl: "Grupa C" }, home: "DCFL Red", homeScore: "3", away: "Balkan Youth", awayScore: "1", winner: "home", meta: { tr: "D\u0131\u015f Saha | Grup ma\u00e7\u0131 | 90 dakika", en: "Outdoor field | Group match | 90 minutes", pl: "Boisko zewn\u0119trzne | Mecz grupowy | 90 minut" } },
                { key: "masa-tenisi", name: { tr: "Masa Tenisi", en: "Table Tennis", pl: "Tenis Sto\u0142owy" }, status: { tr: "\u00c7eyrek Final", en: "Quarter-final", pl: "\u0106wier\u0107fina\u0142" }, home: "Elif Kaya", homeScore: "3", away: "Jana Lis", awayScore: "1", winner: "home", meta: { tr: "Salon B | Kad\u0131nlar tablosu", en: "Hall B | Women's bracket", pl: "Hala B | Tabela kobiet" } },
                { key: "okculuk", name: { tr: "Ok\u00e7uluk", en: "Archery", pl: "\u0141ucznictwo" }, status: { tr: "S\u0131ralama", en: "Ranking", pl: "Ranking" }, home: "DCFL Archers", homeScore: "122", away: "Riga Target", awayScore: "118", winner: "home", meta: { tr: "A\u00e7\u0131k Alan | \u0130lk g\u00fcn s\u0131ralama puan\u0131", en: "Open area | First-day ranking score", pl: "Strefa otwarta | Punkty rankingowe pierwszego dnia" } },
                { key: "oryantiring", name: { tr: "Oryantiring", en: "Orienteering", pl: "Bieg na Orientacj\u0119" }, status: { tr: "Parkur 1", en: "Course 1", pl: "Trasa 1" }, home: "DCFL Trail", homeScore: "38:14", away: "Sofia Compass", awayScore: "40:02", winner: "home", meta: { tr: "Kamp\u00fcs rotas\u0131 | En iyi derece", en: "Campus route | Best time", pl: "Trasa kampusowa | Najlepszy czas" } },
                { key: "bahce-satranci", name: { tr: "Bah\u00e7e Satranc\u0131", en: "Garden Chess", pl: "Szachy Ogrodowe" }, status: { tr: "Eleme Turu", en: "Elimination round", pl: "Runda eliminacyjna" }, home: "DCFL White", homeScore: "1", away: "Plovdiv Kings", awayScore: "0", winner: "home", meta: { tr: "Bah\u00e7e Alan\u0131 | A\u00e7\u0131l\u0131\u015f g\u00fcn\u00fc e\u015fle\u015fmesi", en: "Garden area | Opening-day pairing", pl: "Strefa ogrodowa | Para dnia otwarcia" } },
                { key: "playstation", name: { tr: "PlayStation", en: "PlayStation", pl: "PlayStation" }, status: { tr: "Grup Etab\u0131", en: "Group stage", pl: "Etap grupowy" }, home: "Mert K.", homeScore: "3", away: "Kamil P.", awayScore: "1", winner: "home", meta: { tr: "E-spor Alan\u0131 | \u0130lk ma\u00e7", en: "E-sports area | Opening match", pl: "Strefa e-sportu | Pierwszy mecz" } },
                { key: "atletizm", name: { tr: "Atletizm", en: "Athletics", pl: "Lekkoatletyka" }, status: { tr: "100m Se\u00e7me", en: "100m qualifying", pl: "Eliminacje 100 m" }, home: "DCFL Sprint", homeScore: "11.52", away: "Varna Track", awayScore: "11.68", winner: "home", meta: { tr: "Ana Pist | G\u00fcn\u00fcn en iyi derecesi", en: "Main track | Best time of the day", pl: "Tor g\u0142\u00f3wny | Najlepszy wynik dnia" } },
                { key: "bahce-oyunlari", name: { tr: "Bah\u00e7e Oyunlar\u0131", en: "Garden Games", pl: "Gry Ogrodowe" }, status: { tr: "Tak\u0131m Oyunu", en: "Team game", pl: "Gra dru\u017cynowa" }, home: "Tak\u0131m Mavi", homeScore: "21", away: "Tak\u0131m Gold", awayScore: "18", winner: "home", meta: { tr: "Festival Bah\u00e7esi | A\u00e7\u0131l\u0131\u015f g\u00fcn\u00fc puan\u0131", en: "Festival garden | Opening-day score", pl: "Ogr\u00f3d festiwalowy | Wynik dnia otwarcia" } }
            ]
        },
        {
            key: "13-mayis",
            label: { tr: "13 May\u0131s", en: "May 13", pl: "13 maja" },
            fullDate: { tr: "13 May\u0131s 2026", en: "May 13, 2026", pl: "13 maja 2026" },
            branches: [
                { key: "voleybol", name: { tr: "Voleybol", en: "Volleyball", pl: "Siatk\u00f3wka" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "DCFL A", homeScore: "2", away: "Skopje Smash", awayScore: "1", winner: "home", meta: { tr: "Kapal\u0131 Spor Salonu | 3 set sonunda", en: "Indoor hall | After 3 sets", pl: "Hala sportowa | Po 3 setach" } },
                { key: "basketbol", name: { tr: "Basketbol", en: "Basketball", pl: "Koszyk\u00f3wka" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "DCFL Hoops", homeScore: "72", away: "Balkan Academy", awayScore: "75", winner: "away", meta: { tr: "Ana Saha | Son saniye isabeti", en: "Main court | Last-second basket", pl: "Boisko g\u0142\u00f3wne | Rzut w ostatniej sekundzie" } },
                { key: "futbol", name: { tr: "Futbol", en: "Football", pl: "Pi\u0142ka No\u017cna" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "DCFL Blue", homeScore: "2", away: "Sofia Youth", awayScore: "0", winner: "home", meta: { tr: "D\u0131\u015f Saha | Normal s\u00fcre sonucu", en: "Outdoor field | End of regular time", pl: "Boisko zewn\u0119trzne | Wynik po regulaminowym czasie" } },
                { key: "masa-tenisi", name: { tr: "Masa Tenisi", en: "Table Tennis", pl: "Tenis Sto\u0142owy" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "DCFL Aylin", homeScore: "3", away: "Skopje Smash", awayScore: "1", winner: "home", meta: { tr: "Salon B | Kad\u0131nlar yar\u0131 finali", en: "Hall B | Women's semi-final", pl: "Hala B | P\u00f3\u0142fina\u0142 kobiet" } },
                { key: "okculuk", name: { tr: "Ok\u00e7uluk", en: "Archery", pl: "\u0141ucznictwo" }, status: { tr: "Eleme", en: "Elimination", pl: "Eliminacje" }, home: "DCFL Archers", homeScore: "118", away: "Belgrade Youth", awayScore: "121", winner: "away", meta: { tr: "A\u00e7\u0131k Alan | Klasman turu", en: "Open area | Ranking round", pl: "Strefa otwarta | Runda klasyfikacyjna" } },
                { key: "oryantiring", name: { tr: "Oryantiring", en: "Orienteering", pl: "Bieg na Orientacj\u0119" }, status: { tr: "Parkur 2", en: "Course 2", pl: "Trasa 2" }, home: "DCFL Trail", homeScore: "36:52", away: "Belgrade Map", awayScore: "35:47", winner: "away", meta: { tr: "Kamp\u00fcs d\u0131\u015f parkur | G\u00fcnl\u00fck s\u0131ralama", en: "Outer campus course | Daily ranking", pl: "Zewn\u0119trzna trasa kampusu | Dzienny ranking" } },
                { key: "bahce-satranci", name: { tr: "Bah\u00e7e Satranc\u0131", en: "Garden Chess", pl: "Szachy Ogrodowe" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "DCFL Black", homeScore: "0", away: "Plovdiv Queens", awayScore: "1", winner: "away", meta: { tr: "Bah\u00e7e Alan\u0131 | Strateji turu", en: "Garden area | Strategy round", pl: "Strefa ogrodowa | Runda strategiczna" } },
                { key: "playstation", name: { tr: "PlayStation", en: "PlayStation", pl: "PlayStation" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "Ali T.", homeScore: "1", away: "Jan Nowak", awayScore: "2", winner: "away", meta: { tr: "E-spor Alan\u0131 | Eleme tablosu", en: "E-sports area | Elimination bracket", pl: "Strefa e-sportu | Drabinka eliminacyjna" } },
                { key: "atletizm", name: { tr: "Atletizm", en: "Athletics", pl: "Lekkoatletyka" }, status: { tr: "100m Final", en: "100m final", pl: "Fina\u0142 100 m" }, home: "DCFL Sprint", homeScore: "11.42", away: "Thessaloniki Track", awayScore: "11.58", winner: "home", meta: { tr: "Ana Pist | Final derecesi", en: "Main track | Final time", pl: "Tor g\u0142\u00f3wny | Wynik fina\u0142u" } },
                { key: "bahce-oyunlari", name: { tr: "Bah\u00e7e Oyunlar\u0131", en: "Garden Games", pl: "Gry Ogrodowe" }, status: { tr: "Yar\u0131 Final", en: "Semi-final", pl: "P\u00f3\u0142fina\u0142" }, home: "Tak\u0131m Gold", homeScore: "24", away: "Tak\u0131m Forest", awayScore: "19", winner: "home", meta: { tr: "Festival Bah\u00e7esi | G\u00fcn sonu e\u015fle\u015fmesi", en: "Festival garden | End-of-day pairing", pl: "Ogr\u00f3d festiwalowy | Zestawienie dnia" } }
            ]
        },
        {
            key: "14-mayis",
            label: { tr: "14 May\u0131s", en: "May 14", pl: "14 maja" },
            fullDate: { tr: "14 May\u0131s 2026", en: "May 14, 2026", pl: "14 maja 2026" },
            branches: [
                { key: "voleybol", name: { tr: "Voleybol", en: "Volleyball", pl: "Siatk\u00f3wka" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "DCFL A", homeScore: "3", away: "Balkan Academy", awayScore: "1", winner: "home", meta: { tr: "Kupa ma\u00e7\u0131 | \u015eampiyonluk kar\u015f\u0131la\u015fmas\u0131", en: "Cup match | Championship game", pl: "Mecz o puchar | Spotkanie o mistrzostwo" } },
                { key: "basketbol", name: { tr: "Basketbol", en: "Basketball", pl: "Koszyk\u00f3wka" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "DCFL Hoops", homeScore: "81", away: "Balkan Academy", awayScore: "77", winner: "home", meta: { tr: "Ana Saha | \u015eampiyonluk ma\u00e7\u0131", en: "Main court | Championship game", pl: "Boisko g\u0142\u00f3wne | Mecz o mistrzostwo" } },
                { key: "futbol", name: { tr: "Futbol", en: "Football", pl: "Pi\u0142ka No\u017cna" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "DCFL Blue", homeScore: "1", away: "Belgrade Youth", awayScore: "2", winner: "away", meta: { tr: "D\u0131\u015f Saha | Final skoru", en: "Outdoor field | Final score", pl: "Boisko zewn\u0119trzne | Wynik fina\u0142u" } },
                { key: "masa-tenisi", name: { tr: "Masa Tenisi", en: "Table Tennis", pl: "Tenis Sto\u0142owy" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "DCFL Aylin", homeScore: "3", away: "Maria Z.", awayScore: "2", winner: "home", meta: { tr: "Salon B | \u015eampiyonluk ma\u00e7\u0131", en: "Hall B | Championship match", pl: "Hala B | Mecz o mistrzostwo" } },
                { key: "okculuk", name: { tr: "Ok\u00e7uluk", en: "Archery", pl: "\u0141ucznictwo" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "DCFL Archers", homeScore: "127", away: "Belgrade Youth", awayScore: "124", winner: "home", meta: { tr: "A\u00e7\u0131k Alan | Final at\u0131\u015flar\u0131", en: "Open area | Final shots", pl: "Strefa otwarta | Strza\u0142y fina\u0142owe" } },
                { key: "oryantiring", name: { tr: "Oryantiring", en: "Orienteering", pl: "Bieg na Orientacj\u0119" }, status: { tr: "Final Parkur", en: "Final course", pl: "Trasa fina\u0142owa" }, home: "DCFL Trail", homeScore: "34:08", away: "Sofia Compass", awayScore: "35:21", winner: "home", meta: { tr: "Final rota | En iyi derece", en: "Final route | Best time", pl: "Trasa fina\u0142owa | Najlepszy czas" } },
                { key: "bahce-satranci", name: { tr: "Bah\u00e7e Satranc\u0131", en: "Garden Chess", pl: "Szachy Ogrodowe" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "DCFL White", homeScore: "1", away: "Plovdiv Queens", awayScore: "0", winner: "home", meta: { tr: "Bah\u00e7e Alan\u0131 | \u015eampiyonluk oyunu", en: "Garden area | Championship game", pl: "Strefa ogrodowa | Partia o mistrzostwo" } },
                { key: "playstation", name: { tr: "PlayStation", en: "PlayStation", pl: "PlayStation" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "Mert K.", homeScore: "2", away: "Jan Nowak", awayScore: "3", winner: "away", meta: { tr: "E-spor Alan\u0131 | Final serisi", en: "E-sports area | Final series", pl: "Strefa e-sportu | Seria fina\u0142owa" } },
                { key: "atletizm", name: { tr: "Atletizm", en: "Athletics", pl: "Lekkoatletyka" }, status: { tr: "100m Final", en: "100m final", pl: "Fina\u0142 100 m" }, home: "DCFL Sprint", homeScore: "11.38", away: "Thessaloniki Track", awayScore: "11.44", winner: "home", meta: { tr: "Ana Pist | Madalya yar\u0131\u015f\u0131", en: "Main track | Medal race", pl: "Tor g\u0142\u00f3wny | Wy\u015bcig o medale" } },
                { key: "bahce-oyunlari", name: { tr: "Bah\u00e7e Oyunlar\u0131", en: "Garden Games", pl: "Gry Ogrodowe" }, status: { tr: "Final", en: "Final", pl: "Fina\u0142" }, home: "Tak\u0131m Gold", homeScore: "26", away: "Tak\u0131m Mavi", awayScore: "22", winner: "home", meta: { tr: "Festival Bah\u00e7esi | Final puan\u0131", en: "Festival garden | Final score", pl: "Ogr\u00f3d festiwalowy | Wynik fina\u0142u" } }
            ]
        }
    ];

    function pickText(value, lang) {
        if (value && typeof value === "object") {
            return value[lang] || value.tr || value.en || value.pl || "";
        }
        return value || "";
    }

    function renderBranchCard(branch, lang) {
        var homeClass = branch.winner === "home" ? " is-leading" : "";
        var awayClass = branch.winner === "away" ? " is-leading" : "";

        return [
            "<article class=\"score-card\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + pickText(branch.name, lang) + "</p>",
            "        <span class=\"score-card-badge score-card-badge-final\">" + pickText(branch.status, lang) + "</span>",
            "    </div>",
            "    <div class=\"score-card-teams\">",
            "        <div class=\"score-card-team" + homeClass + "\">",
            "            <strong>" + branch.home + "</strong>",
            "            <span class=\"score-card-score\">" + branch.homeScore + "</span>",
            "        </div>",
            "        <div class=\"score-card-team" + awayClass + "\">",
            "            <strong>" + branch.away + "</strong>",
            "            <span class=\"score-card-score\">" + branch.awayScore + "</span>",
            "        </div>",
            "    </div>",
            "    <p class=\"score-card-meta\">" + pickText(branch.meta, lang) + "</p>",
            "</article>"
        ].join("");
    }

    function renderDayPanel(day, lang, dayUi, isActive) {
        var branchTabs = day.branches.map(function (branch, index) {
            return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-fixture-tab=\"" + branch.key + "\">" + pickText(branch.name, lang) + "</button>";
        }).join("");

        var branchPanels = day.branches.map(function (branch, index) {
            return [
                "<article class=\"fixture-panel score-results-branch-panel" + (index === 0 ? " active" : "") + "\" data-fixture-panel=\"" + branch.key + "\">",
                "    <h3>" + dayUi.resultsTitle(pickText(branch.name, lang)) + "</h3>",
                "    <div class=\"scoreboard-grid score-results-grid\">",
                "        " + renderBranchCard(branch, lang),
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
})();

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
            menu: "Menü",
            pickerAria: "Dil",
            nav: {
                "index.html": "Ana Sayfa",
                "kurumsal.html": "Amacımız",
                "hizmetler.html": "Sıkça Sorulanlar",
                "program.html": "Program & Turnuva",
                "finans.html": "Finans",
                "blog.html": "Blog",
                "arsiv.html": "Arşiv",
                "iletisim.html": "İletişim",
                "turnuva.html": "Program & Turnuva"
            }
        },
        en: {
            menu: "Menu",
            pickerAria: "Language",
            nav: {
                "index.html": "Home",
                "kurumsal.html": "About",
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
                "kurumsal.html": "O nas",
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
                title: "Program & Turnuva | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TURNUVA",
                h1: "12-13-14 Mayıs etkinlik ve fikstür akışı.",
                hero: "Açılış, günlük etkinlik planı ve branş bazlı 8 takımlı tüm turnuva fikstürlerini tek sayfada takip edebilirsin.",
                sections: ["OPERASYON AKIŞI", "FESTIVAL HATLARI", "FIKSTUR DETAYLARI"],
                titles: ["Günlük Program", "Branşlar", "Turnuva Seçim Ekranı"],
                tabs: ["Voleybol", "Basketbol", "Futbol", "Masa Tenisi", "Okçuluk", "Oryantiring", "Bahçe Satrancı", "PlayStation", "Atletizm", "Bahçe Oyunları"],
                panels: ["Voleybol Fikstürü", "Basketbol Fikstürü", "Futbol Fikstürü", "Masa Tenisi Fikstürü", "Okçuluk Fikstürü", "Oryantiring Fikstürü", "Bahçe Satrancı Fikstürü", "PlayStation Turnuvası Fikstürü", "Atletizm Fikstürü", "Bahçe Oyunları Fikstürü"],
                headerMap: { "Tarih": "Tarih", "Saat": "Saat", "Eşleşme": "Eşleşme", "Saha": "Saha", "Tur": "Tur", "Alan": "Alan", "Yarış": "Yarış", "Pist": "Pist", "Etap": "Etap" },
                footer: "Program & Turnuva Sayfası"
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
                sections: ["OPERASYON AKI\u015eI", "FESTIVAL HATLARI", "FIKSTUR DETAYLARI"],
                titles: ["G\u00fcnl\u00fck Program", "Bran\u015flar", "Turnuva Se\u00e7im Ekran\u0131"],
                tabs: ["Voleybol", "Basketbol", "Futbol", "Masa Tenisi", "Ok\u00e7uluk", "Oryantiring", "Bah\u00e7e Satranc\u0131", "PlayStation", "Atletizm", "Bah\u00e7e Oyunlar\u0131"],
                panels: ["Voleybol Fikst\u00fcr\u00fc", "Basketbol Fikst\u00fcr\u00fc", "Futbol Fikst\u00fcr\u00fc", "Masa Tenisi Fikst\u00fcr\u00fc", "Ok\u00e7uluk Fikst\u00fcr\u00fc", "Oryantiring Fikst\u00fcr\u00fc", "Bah\u00e7e Satranc\u0131 Fikst\u00fcr\u00fc", "PlayStation Turnuvas\u0131 Fikst\u00fcr\u00fc", "Atletizm Fikst\u00fcr\u00fc", "Bah\u00e7e Oyunlar\u0131 Fikst\u00fcr\u00fc"],
                headerMap: { "Tarih": "Tarih", "Saat": "Saat", "E\u015fle\u015fme": "E\u015fle\u015fme", "Saha": "Saha", "Tur": "Tur", "Alan": "Alan", "Yar\u0131\u015f": "Yar\u0131\u015f", "Pist": "Pist", "Etap": "Etap" },
                footer: "Program & Turnuva Sayfas\u0131"
            },
            en: {
                title: "Program & Tournament | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM & TOURNAMENT",
                h1: "12-13-14 May event and fixture flow.",
                hero: "Follow opening, daily schedule and all branch-based fixtures on one page.",
                sections: ["OPERATION FLOW", "FESTIVAL LINES", "FIXTURE DETAILS"],
                titles: ["Daily Program", "Sports Branches", "Tournament Selection Screen"],
                tabs: ["Volleyball", "Basketball", "Football", "Table Tennis", "Archery", "Orienteering", "Garden Chess", "PlayStation", "Athletics", "Garden Games"],
                panels: ["Volleyball Fixture", "Basketball Fixture", "Football Fixture", "Table Tennis Fixture", "Archery Fixture", "Orienteering Fixture", "Garden Chess Fixture", "PlayStation Tournament Fixture", "Athletics Fixture", "Garden Games Fixture"],
                headerMap: { "Tarih": "Date", "Saat": "Time", "Eşleşme": "Match", "Saha": "Court", "Tur": "Round", "Alan": "Area", "Yarış": "Race", "Pist": "Track", "Etap": "Stage" },
                footer: "Program & Tournament Page"
            },
            pl: {
                title: "Program i Turniej | DCFLSPORTFEST'26",
                eyebrow: "PROGRAM I TURNIEJ",
                h1: "Harmonogram wydarzenia i terminarzy 12-13-14 maja.",
                hero: "Na jednej stronie sledzisz otwarcie, plan dnia i wszystkie terminarze turniejowe.",
                sections: ["PRZEBIEG OPERACYJNY", "LINIE FESTIWALU", "SZCZEGOLY TERMINARZA"],
                titles: ["Program Dzienny", "Dyscypliny", "Ekran Wyboru Turnieju"],
                tabs: ["Siatkowka", "Koszykowka", "Pilka nozna", "Tenis stolowy", "Lucznictwo", "Bieg na orientacje", "Szachy ogrodowe", "PlayStation", "Lekkoatletyka", "Gry ogrodowe"],
                panels: ["Terminarz siatkowki", "Terminarz koszykowki", "Terminarz pilki noznej", "Terminarz tenisa stolowego", "Terminarz lucznictwa", "Terminarz biegu na orientacje", "Terminarz szachow ogrodowych", "Terminarz turnieju PlayStation", "Terminarz lekkoatletyki", "Terminarz gier ogrodowych"],
                headerMap: { "Tarih": "Data", "Saat": "Godz.", "Eşleşme": "Mecz", "Saha": "Boisko", "Tur": "Runda", "Alan": "Strefa", "Yarış": "Bieg", "Pist": "Tor", "Etap": "Etap" },
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
        setList(".fixture-tab", copy.tabs);
        setList(".fixture-panel > h3", copy.panels);
        mapText(".fixture-table th", copy.headerMap);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyFinans(lang) {
        var copy = {
            tr: {
                title: "Finans | DCFLSPORTFEST'26",
                h1: "Sponsorluk Paketlerini Karşılaştırın",
                hero: "Ayni sponsorluğu ayrı bir blokta, maddi sponsorluk paketlerini ise kolay karşılaştırmalı kart düzeninde inceleyebilirsin.",
                section: "FİNANS",
                sectionTitle: "Sponsorluk Paketlerini Karşılaştırın",
                group: "MADDİ SPONSORLUK PAKETLERİ",
                groupTitle: "Maddi Sponsorluk Paketleri",
                footer: "Finans Sayfası",
                contact: "İletişim",
                quick: "Hızlı Mesaj",
                send: "Gönder"
            },
            en: {
                title: "Finance | DCFLSPORTFEST'26",
                h1: "Compare Sponsorship Packages",
                hero: "Review in-kind sponsorship in a dedicated block and compare financial packages side by side.",
                section: "FINANCE",
                sectionTitle: "Compare Sponsorship Packages",
                group: "FINANCIAL SPONSORSHIP PACKAGES",
                groupTitle: "Financial Sponsorship Packages",
                footer: "Finance Page",
                contact: "Contact",
                quick: "Quick Message",
                send: "Send"
            },
            pl: {
                title: "Finanse | DCFLSPORTFEST'26",
                h1: "Porownaj pakiety sponsorskie",
                hero: "Sponsorstwo rzeczowe sprawdzisz osobno, a pakiety finansowe porownasz obok siebie.",
                section: "FINANSE",
                sectionTitle: "Porownaj pakiety sponsorskie",
                group: "PAKIETY SPONSORINGU FINANSOWEGO",
                groupTitle: "Pakiety Sponsoringu Finansowego",
                footer: "Strona Finanse",
                contact: "Kontakt",
                quick: "Szybka wiadomosc",
                send: "Wyslij"
            }
        }[lang] || {};

        var map = {
            en: {
                "Ayni Sponsorluk": "In-Kind Sponsorship",
                "Bronz Sponsorluk": "Bronze Sponsorship",
                "Gümüş Sponsorluk": "Silver Sponsorship",
                "Altın Sponsorluk": "Gold Sponsorship",
                "Destek niteliğine göre özel görünürlük.": "Custom visibility based on support type.",
                "Temel görünürlük ve resmi teşekkür paketi.": "Core visibility and official appreciation package.",
                "Daha fazla görünürlük ve sahne teşekkürü.": "Higher visibility and stage appreciation.",
                "Maksimum görünürlük ve premium haklar.": "Maximum visibility and premium rights.",
                "Açılışta özel teşekkür": "Special thanks during opening",
                "Açılışta isimle teşekkür": "Name mention during opening",
                "Stant açma hakkı": "Right to open a stand",
                "Firmaya özel teşekkür belgesi": "Custom certificate of appreciation",
                "Firmaya özel teşekkür plaketi": "Custom appreciation plaque",
                "Medyada yapılan toplu teşekkür paylaşımında logosu bulunur.": "Logo placement in collective media thank-you post."
            },
            pl: {
                "Ayni Sponsorluk": "Sponsorstwo rzeczowe",
                "Bronz Sponsorluk": "Sponsorstwo brazowe",
                "Gümüş Sponsorluk": "Sponsorstwo srebrne",
                "Altın Sponsorluk": "Sponsorstwo zlote",
                "Destek niteliğine göre özel görünürlük.": "Widocznosc dopasowana do rodzaju wsparcia.",
                "Temel görünürlük ve resmi teşekkür paketi.": "Podstawowa widocznosc i oficjalny pakiet podziekowan.",
                "Daha fazla görünürlük ve sahne teşekkürü.": "Wieksza widocznosc i podziekowanie na scenie.",
                "Maksimum görünürlük ve premium haklar.": "Maksymalna widocznosc i prawa premium.",
                "Açılışta özel teşekkür": "Specjalne podziekowanie podczas otwarcia",
                "Açılışta isimle teşekkür": "Podziekowanie z nazwa podczas otwarcia",
                "Stant açma hakkı": "Prawo do otwarcia stoiska",
                "Firmaya özel teşekkür belgesi": "Dedykowany certyfikat podziekowania",
                "Firmaya özel teşekkür plaketi": "Dedykowana plakieta podziekowania",
                "Medyada yapılan toplu teşekkür paylaşımında logosu bulunur.": "Logo w zbiorczym wpisie podziekowan w mediach."
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.sectionTitle);
        setText(".finance-group-head .section-kicker", copy.group);
        setText(".finance-group-head h3", copy.groupTitle);
        setText(".contact-info h2", copy.contact);
        setText(".contact-form-card h2", copy.quick);
        setText(".contact-form-card .btn", copy.send);
        setText(".footer p:nth-of-type(2)", copy.footer);

        if (lang === "en") {
            setHTML(".contact-info .section-text:nth-of-type(1)", "<strong>E-mail:</strong> dcflsportfest2020@gmail.com");
            setHTML(".contact-info .section-text:nth-of-type(2)", "<strong>Location:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul");
            setHTML(".contact-info .section-text:nth-of-type(3)", "<strong>Note:</strong> Contact us for sponsorship file and proposal process.");
            setText("label[for='finans-name']", "Name / Company Name");
            setText("label[for='finans-email']", "E-mail");
            setText("label[for='finans-topic']", "Subject");
            setText("label[for='finans-message']", "Message");
            setAttr("#finans-name", "placeholder", "Name / Company Name");
            setAttr("#finans-email", "placeholder", "example@mail.com");
            setAttr("#finans-topic", "placeholder", "Sponsorship Package / File Request");
            setAttr("#finans-message", "placeholder", "Write your message...");
        } else if (lang === "pl") {
            setHTML(".contact-info .section-text:nth-of-type(1)", "<strong>E-mail:</strong> dcflsportfest2020@gmail.com");
            setHTML(".contact-info .section-text:nth-of-type(2)", "<strong>Lokalizacja:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Kucukcekmece / Istanbul");
            setHTML(".contact-info .section-text:nth-of-type(3)", "<strong>Notatka:</strong> Skontaktuj sie z nami, aby otrzymac plik sponsorki i zlozyc oferte.");
            setText("label[for='finans-name']", "Imie i nazwisko / Firma");
            setText("label[for='finans-email']", "E-mail");
            setText("label[for='finans-topic']", "Temat");
            setText("label[for='finans-message']", "Wiadomosc");
            setAttr("#finans-name", "placeholder", "Imie i nazwisko / Firma");
            setAttr("#finans-email", "placeholder", "przyklad@mail.com");
            setAttr("#finans-topic", "placeholder", "Pakiet sponsorski / Prosba o plik");
            setAttr("#finans-message", "placeholder", "Napisz wiadomosc...");
        } else {
            setHTML(".contact-info .section-text:nth-of-type(1)", "<strong>E-posta:</strong> dcflsportfest2020@gmail.com");
            setHTML(".contact-info .section-text:nth-of-type(2)", "<strong>Konum:</strong> Atakent Mah. 4. Cad. Blok No 31/4 Küçükçekmece / İstanbul");
            setHTML(".contact-info .section-text:nth-of-type(3)", "<strong>Not:</strong> Sponsorluk detay dosyası ve teklif gönderimi için iletişime geçebilirsin.");
            setText("label[for='finans-name']", "Ad Soyad / Firma Adı");
            setText("label[for='finans-email']", "E-posta");
            setText("label[for='finans-topic']", "Konu");
            setText("label[for='finans-message']", "Mesaj");
            setAttr("#finans-name", "placeholder", "Ad Soyad / Firma Adı");
            setAttr("#finans-email", "placeholder", "ornek@mail.com");
            setAttr("#finans-topic", "placeholder", "Sponsorluk Paketi / Dosya Talebi");
            setAttr("#finans-message", "placeholder", "Mesajını yaz...");
        }

        mapText(".finance-card h3", map);
        mapText(".finance-sub", map);
        mapText(".feature-name", map);
    }

    function applySimplePage(lang, file, trTitle, enTitle, plTitle, trH1, enH1, plH1, trFooter, enFooter, plFooter) {
        if (pageKey() !== file) {
            return;
        }
        if (lang === "en") {
            document.title = enTitle;
            setText(".page-shell h1", enH1);
            setText(".footer p:nth-of-type(2)", enFooter);
        } else if (lang === "pl") {
            document.title = plTitle;
            setText(".page-shell h1", plH1);
            setText(".footer p:nth-of-type(2)", plFooter);
        } else {
            document.title = trTitle;
            setText(".page-shell h1", trH1);
            setText(".footer p:nth-of-type(2)", trFooter);
        }
    }

    function applyFaq(lang) {
        var copy = {
            tr: {
                title: "Sıkça Sorulanlar | DCFLSPORTFEST'26",
                h1: "Merak edilen soruların net cevapları.",
                hero: "Katılım, kayıt, kontenjan ve sponsorluk süreçleriyle ilgili en çok sorulan soruları burada bulabilirsin.",
                section: "SIKÇA SORULANLAR",
                title2: "Hızlı Cevaplar",
                footer: "Sıkça Sorulanlar Sayfası"
            },
            en: {
                title: "FAQ | DCFLSPORTFEST'26",
                h1: "Clear answers to common questions.",
                hero: "Find the most frequently asked questions about registration, quotas and sponsorship.",
                section: "FAQ",
                title2: "Quick Answers",
                footer: "FAQ Page"
            },
            pl: {
                title: "FAQ | DCFLSPORTFEST'26",
                h1: "Jasne odpowiedzi na najczestsze pytania.",
                hero: "Znajdziesz tu najczestsze pytania o rejestracje, limity i sponsoring.",
                section: "FAQ",
                title2: "Szybkie odpowiedzi",
                footer: "Strona FAQ"
            }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyBlog(lang) {
        var copy = {
            tr: { title: "Blog | DCFLSPORTFEST'26", h1: "Sportfest gündeminden notlar.", hero: "Etkinlik hazırlıkları, branş hikayeleri ve organizasyon güncellemeleri.", section: "ÖNE ÇIKANLAR", title2: "Son Yazılar", footer: "Blog Sayfası" },
            en: { title: "Blog | DCFLSPORTFEST'26", h1: "Notes from the Sportfest agenda.", hero: "Event preparations, branch stories and organization updates.", section: "HIGHLIGHTS", title2: "Latest Posts", footer: "Blog Page" },
            pl: { title: "Blog | DCFLSPORTFEST'26", h1: "Notatki z agendy Sportfest.", hero: "Przygotowania wydarzenia, historie dyscyplin i aktualizacje organizacyjne.", section: "WYROZNIONE", title2: "Najnowsze wpisy", footer: "Strona Blog" }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyArsiv(lang) {
        var copy = {
            tr: { title: "Arşiv | DCFLSPORTFEST'26", h1: "Etkinlik Arşivi", hero: "Geçmiş yıllara ait duyurular, görseller ve öne çıkan anlar yakında burada yer alacak.", section: "ARŞİV", title2: "Yakında Eklenecek İçerikler", footer: "Arşiv Sayfası" },
            en: { title: "Archive | DCFLSPORTFEST'26", h1: "Event Archive", hero: "Announcements, visuals and highlights from previous years will be added here soon.", section: "ARCHIVE", title2: "Upcoming Archive Content", footer: "Archive Page" },
            pl: { title: "Archiwum | DCFLSPORTFEST'26", h1: "Archiwum Wydarzenia", hero: "Wkrotce pojawia sie tu ogloszenia, materialy wizualne i najwazniejsze momenty z poprzednich lat.", section: "ARCHIWUM", title2: "Nadchodzace Materialy", footer: "Strona Archiwum" }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText("main .section-head .section-kicker", copy.section);
        setText("main .section-head h2", copy.title2);
        setText(".footer p:nth-of-type(2)", copy.footer);
    }

    function applyIletisim(lang) {
        var copy = {
            tr: { title: "İletişim | DCFLSPORTFEST'26", h1: "Bize ulaş, birlikte planlayalım.", hero: "Takım kaydı, partnerlik veya genel sorular için formu doldurabilirsin.", contact: "İletişim Bilgileri", quick: "Hızlı Mesaj", labels: ["Ad Soyad/ Firma Adı", "E-posta", "Konu", "Mesaj"], placeholders: ["Ad Soyad/ Firma Adı", "ornek@mail.com", "Takım kaydı / Sponsorluk / Soru", "Mesajını yaz..."], send: "Gönder", footer: "İletişim Sayfası" },
            en: { title: "Contact | DCFLSPORTFEST'26", h1: "Reach us, let's plan together.", hero: "You can fill in the form for team registration, partnership or general questions.", contact: "Contact Details", quick: "Quick Message", labels: ["Name / Company Name", "E-mail", "Subject", "Message"], placeholders: ["Name / Company Name", "example@mail.com", "Team registration / Sponsorship / Question", "Write your message..."], send: "Send", footer: "Contact Page" },
            pl: { title: "Kontakt | DCFLSPORTFEST'26", h1: "Skontaktuj sie z nami, zaplanujmy to razem.", hero: "Wypelnij formularz w sprawie rejestracji druzyny, partnerstwa lub pytan.", contact: "Dane kontaktowe", quick: "Szybka wiadomosc", labels: ["Imie i nazwisko / Firma", "E-mail", "Temat", "Wiadomosc"], placeholders: ["Imie i nazwisko / Firma", "przyklad@mail.com", "Rejestracja druzyny / Sponsoring / Pytanie", "Napisz wiadomosc..."], send: "Wyslij", footer: "Strona Kontakt" }
        }[lang] || {};

        document.title = copy.title || document.title;
        setText(".page-shell h1", copy.h1);
        setText(".page-shell .hero-text", copy.hero);
        setText(".contact-info h2", copy.contact);
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
        } else if (key === "hizmetler.html") {
            applyFaq(lang);
        } else if (key === "blog.html") {
            applyBlog(lang);
        } else if (key === "arsiv.html") {
            applyArsiv(lang);
        } else if (key === "iletisim.html") {
            applyIletisim(lang);
        }

        applySimplePage(lang, "kurumsal.html", "Amacımız | DCFLSPORTFEST'26", "About | DCFLSPORTFEST'26", "O nas | DCFLSPORTFEST'26", "Etkinliğin Amacı", "A festival vision without borders.", "Wizja festiwalu bez granic.", "Amacımız Sayfası", "About Page", "Strona O nas");
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
