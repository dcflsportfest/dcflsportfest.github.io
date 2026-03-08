(function () {
    var page = document.querySelector("[data-admin-page]");
    if (!page || !window.DCFLSiteData) {
        return;
    }

    var api = window.DCFLSiteData;
    var bridge = window.DCFLSupabaseBridge || null;
    var liveMount = document.querySelector("[data-admin-live-matches]");
    var branchMount = document.querySelector("[data-admin-branches]");
    var completedInput = document.querySelector("[data-admin-completed-today]");
    var publishToggle = document.querySelector("[data-admin-publish-results]");
    var saveButton = document.querySelector("[data-admin-save]");
    var resetButton = document.querySelector("[data-admin-reset]");
    var defaultsButton = document.querySelector("[data-admin-defaults]");
    var exportButton = document.querySelector("[data-admin-export]");
    var importTrigger = document.querySelector("[data-admin-import-trigger]");
    var importInput = document.querySelector("[data-admin-import-input]");
    var message = document.querySelector("[data-admin-message]");
    var connectionStatus = document.querySelector("[data-admin-connection-status]");
    var connectionNote = document.querySelector("[data-admin-connection-note]");
    var authStatus = document.querySelector("[data-admin-auth-status]");
    var authNote = document.querySelector("[data-admin-auth-note]");
    var loginForm = document.querySelector("[data-admin-login-form]");
    var emailInput = document.querySelector("[data-admin-email]");
    var passwordInput = document.querySelector("[data-admin-password]");
    var loginButton = document.querySelector("[data-admin-login]");
    var logoutButton = document.querySelector("[data-admin-logout]");
    var defaultTemplates = api.getDefaultData().branchTemplates.reduce(function (map, template) {
        map[template.key] = template;
        return map;
    }, {});
    var state = api.getData();

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setMessage(text, tone) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.setAttribute("data-tone", tone || "info");
    }

    function getInputValue(scope, field) {
        var input = scope.querySelector("[data-field=\"" + field + "\"]");
        return input ? input.value.trim() : "";
    }

    function getPlaceholderPair(stageKey, index) {
        if (stageKey === "sf") {
            return ["CF " + String(index * 2 + 1) + " Galibi", "CF " + String(index * 2 + 2) + " Galibi"];
        }
        return ["YF 1 Galibi", "YF 2 Galibi"];
    }

    function getPair(template, stageKey, index) {
        if (stageKey === "qf") {
            return template.qf.pairs[index];
        }
        if (stageKey === "sf") {
            return (template.sf.pairs && template.sf.pairs[index]) || getPlaceholderPair("sf", index);
        }
        return (template.final.pair && template.final.pair.length === 2 && template.final.pair) || getPlaceholderPair("final", 0);
    }

    function renderField(label, field, value, type) {
        return [
            "<label class=\"admin-field\">",
            "    <span>" + label + "</span>",
            "    <input type=\"" + (type || "text") + "\" value=\"" + escapeHTML(value) + "\" data-field=\"" + field + "\">",
            "</label>"
        ].join("");
    }

    function renderLiveCard(match, index) {
        return [
            "<article class=\"admin-card\" data-admin-live-card data-live-index=\"" + index + "\">",
            "    <div class=\"admin-card-head\">",
            "        <h3>Canl\u0131 Kart " + String(index + 1) + "</h3>",
            "    </div>",
            "    <div class=\"admin-grid\">",
            renderField("Bran\u015f", "branch", match.branch),
            renderField("Durum", "status", match.status),
            renderField("Tak\u0131m 1", "home", match.home),
            renderField("Tak\u0131m 1 Skor", "homeScore", match.homeScore),
            renderField("Tak\u0131m 2", "away", match.away),
            renderField("Tak\u0131m 2 Skor", "awayScore", match.awayScore),
            renderField("Alt A\u00e7\u0131klama", "meta", match.meta),
            "</div>",
            "</article>"
        ].join("");
    }

    function renderMatchCard(stageLabel, stageKey, index, time, home, away, homeScore, awayScore) {
        return [
            "<article class=\"admin-match-card\" data-stage-key=\"" + stageKey + "\" data-match-index=\"" + index + "\">",
            "    <div class=\"admin-card-head\">",
            "        <h4>" + stageLabel + "</h4>",
            "    </div>",
            "    <div class=\"admin-grid admin-grid-compact\">",
            renderField("Saat", "time", time),
            renderField("Ev Sahibi", "home", home),
            renderField("Ev Skor", "homeScore", homeScore),
            renderField("Deplasman", "away", away),
            renderField("Dep. Skor", "awayScore", awayScore),
            "</div>",
            "</article>"
        ].join("");
    }

    function renderBranchCard(template, index) {
        var qfCards = template.qf.times.map(function (time, index) {
            var pair = getPair(template, "qf", index);
            var score = template.qf.scores[index] || ["", ""];
            return renderMatchCard("\u00c7eyrek Final " + String(index + 1), "qf", index, time, pair[0], pair[1], score[0], score[1]);
        }).join("");

        var sfCards = template.sf.times.map(function (time, index) {
            var pair = getPair(template, "sf", index);
            var score = template.sf.scores[index] || ["", ""];
            return renderMatchCard("Yar\u0131 Final " + String(index + 1), "sf", index, time, pair[0], pair[1], score[0], score[1]);
        }).join("");

        var finalPair = getPair(template, "final", 0);
        var finalScore = template.final.score || ["", ""];

        return [
            "<article class=\"fixture-panel admin-branch-card" + (index === 0 ? " active" : "") + "\" data-fixture-panel=\"" + template.key + "\" data-branch-key=\"" + template.key + "\">",
            "    <div class=\"admin-card-head\">",
            "        <h3>" + escapeHTML(template.name.tr || template.key) + "</h3>",
            "        <p>" + escapeHTML(template.venue.tr || "") + "</p>",
            "    </div>",
            "    <div class=\"admin-stage-group\">",
            "        <h4>\u00c7eyrek Final</h4>",
            "        <div class=\"admin-match-grid\">" + qfCards + "</div>",
            "    </div>",
            "    <div class=\"admin-stage-group\">",
            "        <h4>Yar\u0131 Final</h4>",
            "        <div class=\"admin-match-grid\">" + sfCards + "</div>",
            "    </div>",
            "    <div class=\"admin-stage-group\">",
            "        <h4>Final</h4>",
            "        <div class=\"admin-match-grid\">",
            renderMatchCard("Final", "final", 0, template.final.time, finalPair[0], finalPair[1], finalScore[0], finalScore[1]),
            "        </div>",
            "    </div>",
            "</article>"
        ].join("");
    }

    function renderBranchTabs(templates) {
        return templates.map(function (template, index) {
            return "<button type=\"button\" class=\"fixture-tab" + (index === 0 ? " active" : "") + "\" data-fixture-tab=\"" + template.key + "\">" + escapeHTML(template.name.tr || template.key) + "</button>";
        }).join("");
    }

    function render() {
        completedInput.value = state.summary && state.summary.completedToday != null ? state.summary.completedToday : "9";
        publishToggle.checked = !!state.publishResults;
        liveMount.innerHTML = state.liveMatches.map(renderLiveCard).join("");
        branchMount.innerHTML = [
            "<div class=\"fixture-tabs admin-branch-tabs\" data-fixture-tabs>",
            renderBranchTabs(state.branchTemplates),
            "</div>",
            "<div class=\"fixture-panels admin-branch-panels\">",
            state.branchTemplates.map(renderBranchCard).join(""),
            "</div>"
        ].join("");

        if (typeof initializeFixtureTabGroups === "function") {
            initializeFixtureTabGroups(branchMount);
        }
    }

    function setRemoteStatus(configured, session) {
        if (connectionStatus) {
            connectionStatus.textContent = configured ? "Supabase Haz\u0131r" : "Yerel Mod";
        }
        if (connectionNote) {
            connectionNote.textContent = configured
                ? "Canl\u0131 veri Supabase \u00fczerinden okunabilir ve yaz\u0131labilir."
                : "supabase-config.js bo\u015f. Panel sadece bu taray\u0131c\u0131da kay\u0131t yapar.";
        }
        if (authStatus) {
            authStatus.textContent = session && session.user ? "A\u00e7\u0131k" : "Kapal\u0131";
        }
        if (authNote) {
            authNote.textContent = session && session.user
                ? (session.user.email || "Admin kullan\u0131c\u0131s\u0131")
                : "Uzak kay\u0131t i\u00e7in admin giri\u015fi gerekli.";
        }
        if (loginButton) {
            loginButton.disabled = !configured;
        }
        if (logoutButton) {
            logoutButton.disabled = !configured || !(session && session.user);
        }
    }

    async function refreshRemoteStatus() {
        var configured = !!(bridge && bridge.isConfigured && bridge.isConfigured());
        var session = configured ? await bridge.getSession() : null;
        setRemoteStatus(configured, session);
        return {
            configured: configured,
            session: session
        };
    }

    function collectLiveMatches() {
        return Array.from(document.querySelectorAll("[data-admin-live-card]")).map(function (card) {
            return {
                branch: getInputValue(card, "branch"),
                status: getInputValue(card, "status"),
                home: getInputValue(card, "home"),
                homeScore: getInputValue(card, "homeScore"),
                away: getInputValue(card, "away"),
                awayScore: getInputValue(card, "awayScore"),
                meta: getInputValue(card, "meta")
            };
        });
    }

    function collectStageMatches(branchCard, stageKey) {
        return Array.from(branchCard.querySelectorAll("[data-stage-key=\"" + stageKey + "\"]")).map(function (card) {
            return {
                time: getInputValue(card, "time"),
                home: getInputValue(card, "home"),
                homeScore: getInputValue(card, "homeScore"),
                away: getInputValue(card, "away"),
                awayScore: getInputValue(card, "awayScore")
            };
        });
    }

    function collectBranchTemplates() {
        return Array.from(document.querySelectorAll("[data-branch-key]")).map(function (branchCard) {
            var key = branchCard.getAttribute("data-branch-key");
            var fallback = clone(defaultTemplates[key]);
            var qfMatches = collectStageMatches(branchCard, "qf");
            var sfMatches = collectStageMatches(branchCard, "sf");
            var finalMatch = collectStageMatches(branchCard, "final")[0];

            fallback.qf.times = qfMatches.map(function (match) { return match.time; });
            fallback.qf.pairs = qfMatches.map(function (match) { return [match.home, match.away]; });
            fallback.qf.scores = qfMatches.map(function (match) { return [match.homeScore, match.awayScore]; });

            fallback.sf.times = sfMatches.map(function (match) { return match.time; });
            fallback.sf.pairs = sfMatches.map(function (match) { return [match.home, match.away]; });
            fallback.sf.scores = sfMatches.map(function (match) { return [match.homeScore, match.awayScore]; });

            fallback.final.time = finalMatch.time;
            fallback.final.pair = [finalMatch.home, finalMatch.away];
            fallback.final.score = [finalMatch.homeScore, finalMatch.awayScore];

            return fallback;
        });
    }

    function collectFormData() {
        return {
            summary: {
                completedToday: completedInput.value.trim()
            },
            publishResults: !!publishToggle.checked,
            liveMatches: collectLiveMatches(),
            branchTemplates: collectBranchTemplates()
        };
    }

    async function loadBestAvailableData() {
        state = await api.loadData();
        render();
    }

    saveButton.addEventListener("click", async function () {
        var nextState = collectFormData();
        try {
            var remoteStatus = await refreshRemoteStatus();
            if (remoteStatus.configured && remoteStatus.session && remoteStatus.session.user) {
                state = await api.saveDataRemote(nextState);
                setMessage("Supabase \u00fczerine kaydedildi. Herkes yeni veriyi g\u00f6rebilir.", "success");
            } else {
                state = api.saveData(nextState);
                setMessage("Yerel kaydedildi. Online yay\u0131n i\u00e7in Supabase giri\u015fi gerekiyor.", "warning");
            }
            render();
        } catch (error) {
            setMessage("Kay\u0131t ba\u015far\u0131s\u0131z: " + (error && error.message ? error.message : "Bilinmeyen hata"), "error");
        }
    });

    resetButton.addEventListener("click", async function () {
        await loadBestAvailableData();
        setMessage("Veri yeniden y\u00fcklendi.", "info");
    });

    defaultsButton.addEventListener("click", function () {
        api.clearData();
        state = api.getDefaultData();
        render();
        setMessage("Varsay\u0131lan veri geri y\u00fcklendi. \u0130stersen sonra yeniden kaydet.", "warning");
    });

    exportButton.addEventListener("click", function () {
        var blob = new Blob([JSON.stringify(collectFormData(), null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "dcfl-admin-data.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setMessage("JSON d\u0131\u015fa aktar\u0131ld\u0131.", "success");
    });

    importTrigger.addEventListener("click", function () {
        importInput.click();
    });

    importInput.addEventListener("change", function (event) {
        var file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }

        var reader = new FileReader();
        reader.onload = function () {
            try {
                var imported = JSON.parse(String(reader.result || "{}"));
                state = api.saveData(imported);
                render();
                setMessage("JSON i\u00e7e aktar\u0131ld\u0131. Kaydet dersen aktif veri olur.", "success");
            } catch (error) {
                setMessage("JSON okunamad\u0131. Dosya format\u0131 hatal\u0131.", "error");
            }
        };
        reader.readAsText(file);
    });

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!bridge || !bridge.isConfigured || !bridge.isConfigured()) {
                setMessage("Supabase ayarlar\u0131 eksik. \u00d6nce supabase-config.js doldurulmal\u0131.", "error");
                return;
            }

            try {
                await bridge.signIn(emailInput.value.trim(), passwordInput.value);
                passwordInput.value = "";
                await refreshRemoteStatus();
                await loadBestAvailableData();
                setMessage("Admin oturumu a\u00e7\u0131ld\u0131.", "success");
            } catch (error) {
                setMessage("Giri\u015f ba\u015far\u0131s\u0131z: " + (error && error.message ? error.message : "Bilinmeyen hata"), "error");
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async function () {
            if (!bridge || !bridge.isConfigured || !bridge.isConfigured()) {
                return;
            }

            try {
                await bridge.signOut();
                await refreshRemoteStatus();
                setMessage("Admin oturumu kapat\u0131ld\u0131.", "info");
            } catch (error) {
                setMessage("\u00c7\u0131k\u0131\u015f ba\u015far\u0131s\u0131z: " + (error && error.message ? error.message : "Bilinmeyen hata"), "error");
            }
        });
    }

    window.addEventListener("dcfl-auth-changed", function () {
        refreshRemoteStatus();
    });

    (async function init() {
        render();
        await refreshRemoteStatus();
        await loadBestAvailableData();
        setMessage("Panel haz\u0131r.", "info");
    })();
})();

