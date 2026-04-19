(function () {
    var page = document.querySelector("[data-admin-page]");
    if (!page || !window.DCFLSiteData) {
        return;
    }

    var api = window.DCFLSiteData;
    var bridge = window.DCFLSupabaseBridge || null;
    var adminMain = document.querySelector("main[data-admin-page]");
    var liveMount = document.querySelector("[data-admin-live-matches]");
    var fixtureMount = document.querySelector("[data-admin-fixtures]");
    var resultsMount = document.querySelector("[data-admin-results]");
    var activeCountInput = document.querySelector("[data-admin-active-count]");
    var completedInput = document.querySelector("[data-admin-completed-today]");
    var resultsCountInput = document.querySelector("[data-admin-results-count]");
    var publishToggle = document.querySelector("[data-admin-publish-results]");
    var publishFixturesToggle = document.querySelector("[data-admin-publish-fixtures]");
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
    var adminAccessTitle = document.querySelector("[data-admin-access-title]");
    var adminAccessNote = document.querySelector("[data-admin-access-note]");
    var adminUsersMount = document.querySelector("[data-admin-users]");
    var submissionsMount = document.querySelector("[data-admin-submissions]");
    var contentTabButtons = Array.from(document.querySelectorAll("[data-admin-content-tab]"));
    var contentPanels = Array.from(document.querySelectorAll("[data-admin-content-panel]"));
    var liveAddButton = document.querySelector("[data-admin-live-add]");
    var resultAddButton = document.querySelector("[data-admin-result-add]");
    var defaultTemplates = api.getDefaultData().branchTemplates.reduce(function (map, template) {
        map[template.key] = template;
        return map;
    }, {});
    var state = api.getData();
    var accessState = {
        configured: false,
        session: null,
        isAdmin: false,
        users: []
    };
    var LOGIN_GUARD_KEY = "dcfl_admin_login_guard_v1";
    var MAX_LOGIN_ATTEMPTS = 5;
    var LOGIN_WINDOW_MS = 10 * 60 * 1000;
    var LOGIN_LOCK_MS = 15 * 60 * 1000;
    var INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
    var inactivityTimer = null;

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

    function normalizeEmail(value) {
        return String(value || "").trim().toLowerCase();
    }

    function readLoginGuard() {
        try {
            return JSON.parse(localStorage.getItem(LOGIN_GUARD_KEY) || "{}");
        } catch (_error) {
            return {};
        }
    }

    function writeLoginGuard(value) {
        try {
            localStorage.setItem(LOGIN_GUARD_KEY, JSON.stringify(value));
        } catch (_error) {
            // ignore storage errors
        }
    }

    function normalizeLoginGuard(raw) {
        var now = Date.now();
        var attempts = Array.isArray(raw.attempts) ? raw.attempts.filter(function (value) {
            return Number.isFinite(value) && now - value < LOGIN_WINDOW_MS;
        }) : [];
        var lockedUntil = Number.isFinite(raw.lockedUntil) ? raw.lockedUntil : 0;
        return {
            attempts: attempts,
            lockedUntil: lockedUntil > now ? lockedUntil : 0
        };
    }

    function getLockRemainingMs() {
        clearLoginGuard();
        return 0;
    }

    function clearLoginGuard() {
        writeLoginGuard({ attempts: [], lockedUntil: 0 });
    }

    function registerFailedLogin() {
        var guard = {
            attempts: [],
            lockedUntil: 0
        };
        writeLoginGuard(guard);
        return guard;
    }

    function formatRemainingTime(ms) {
        var minutes = Math.ceil(ms / 60000);
        return minutes <= 1 ? "1 dakika" : String(minutes) + " dakika";
    }

    function maskEmail(email) {
        var normalized = normalizeEmail(email);
        var parts = normalized.split("@");
        if (parts.length !== 2) {
            return normalized;
        }

        var local = parts[0];
        var domain = parts[1];
        if (local.length <= 2) {
            return local.charAt(0) + "*@" + domain;
        }
        return local.slice(0, 2) + "*****@" + domain;
    }

    async function forceLogout(reason) {
        if (!bridge || !bridge.isConfigured || !bridge.isConfigured()) {
            return;
        }
        try {
            await bridge.signOut();
        } catch (_error) {
            // ignore sign-out errors during forced logout
        }
        inactivityTimer = null;
        await refreshRemoteStatus();
        await refreshContactSubmissions();
        setMessage(reason || "Admin oturumu kapatıldı.", "info");
    }

    function armInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
        if (!(accessState.configured && accessState.session && accessState.isAdmin)) {
            return;
        }
        inactivityTimer = setTimeout(function () {
            forceLogout("Güvenlik için oturum süresi doldu. Yeniden giriş yap.");
        }, INACTIVITY_TIMEOUT_MS);
    }

    function bindInactivityHandlers() {
        ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (eventName) {
            window.addEventListener(eventName, function () {
                if (accessState.configured && accessState.session && accessState.isAdmin) {
                    armInactivityTimer();
                }
            }, { passive: true });
        });
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

    function renderReadOnlyField(label, field, value) {
        return [
            "<label class=\"admin-field admin-field-readonly\">",
            "    <span>" + label + "</span>",
            "    <input type=\"text\" value=\"" + escapeHTML(value) + "\" data-field=\"" + field + "\" readonly>",
            "</label>"
        ].join("");
    }

    function getScoreLeader(homeScore, awayScore) {
        var home = Number(String(homeScore).replace(",", "."));
        var away = Number(String(awayScore).replace(",", "."));
        if (!Number.isFinite(home) || !Number.isFinite(away) || home === away) {
            return "";
        }
        return home > away ? "home" : "away";
    }

    function normalizeBooleanList(value, length) {
        return Array.from({ length: length }, function (_item, index) {
            return Array.isArray(value) ? !!value[index] : false;
        });
    }

    function renderLivePreviewCard(match) {
        var winner = getScoreLeader(match.homeScore, match.awayScore);
        var homeClass = winner === "home" ? " is-leading" : "";
        var awayClass = winner === "away" ? " is-leading" : "";

        return [
            "<article class=\"score-card admin-preview-score-card\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + escapeHTML(match.branch || "Canl\u0131 Kart") + "</p>",
            "        <span class=\"score-card-badge score-card-badge-live\">" + escapeHTML(match.status || "Canl\u0131") + "</span>",
            "    </div>",
            "    <div class=\"score-card-teams\">",
            "        <div class=\"score-card-team" + homeClass + "\">",
            "            <strong>" + escapeHTML(match.home || "-") + "</strong>",
            "            <span class=\"score-card-score\">" + escapeHTML(match.homeScore || "0") + "</span>",
            "        </div>",
            "        <div class=\"score-card-team" + awayClass + "\">",
            "            <strong>" + escapeHTML(match.away || "-") + "</strong>",
            "            <span class=\"score-card-score\">" + escapeHTML(match.awayScore || "0") + "</span>",
            "        </div>",
            "    </div>",
            "    <p class=\"score-card-meta\">" + escapeHTML(match.meta || "") + "</p>",
            "</article>"
        ].join("");
    }

    function renderLiveCard(match, index) {
        return [
            "<article class=\"admin-card admin-live-editor-card\" data-admin-live-card data-live-index=\"" + index + "\">",
            "    <div class=\"admin-card-head admin-card-head-actions\">",
            "        <div>",
            "            <h3>Canl\u0131 Kart " + String(index + 1) + "</h3>",
            "            <p>Ana sayfa \u00f6nizlemesi</p>",
            "        </div>",
            "        <button type=\"button\" class=\"btn btn-ghost admin-card-action\" data-admin-live-remove>Sil</button>",
            "    </div>",
            "    <div class=\"admin-live-editor-layout\">",
            "        <div class=\"admin-live-preview\" data-admin-live-preview>",
            renderLivePreviewCard(match),
            "        </div>",
            "        <div class=\"admin-grid admin-grid-compact admin-live-editor-fields\">",
            renderField("Bran\u015f", "branch", match.branch),
            renderField("Durum", "status", match.status),
            renderField("1. Tak\u0131m", "home", match.home),
            renderField("1. Skor", "homeScore", match.homeScore),
            renderField("2. Tak\u0131m", "away", match.away),
            renderField("2. Skor", "awayScore", match.awayScore),
            renderField("Alt metin", "meta", match.meta),
            "        </div>",
            "    </div>",
            "</article>"
        ].join("");
    }

    function renderFixturePreviewCard(stageLabel, time, home, away, hidden) {
        return [
            "<article class=\"score-card admin-preview-score-card admin-preview-score-card-fixture" + (hidden ? " is-hidden" : "") + "\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + escapeHTML(stageLabel) + "</p>",
            "        <span class=\"score-card-badge score-card-badge-pending\">" + (hidden ? "Gizli" : "Fikstür") + "</span>",
            "    </div>",
            "    <div class=\"score-card-teams\">",
            "        <div class=\"score-card-team\">",
            "            <strong>" + escapeHTML(home || "-") + "</strong>",
            "            <span class=\"score-card-score\">-</span>",
            "        </div>",
            "        <div class=\"score-card-team\">",
            "            <strong>" + escapeHTML(away || "-") + "</strong>",
            "            <span class=\"score-card-score\">-</span>",
            "        </div>",
            "    </div>",
            "    <p class=\"score-card-meta\">" + escapeHTML(time || "Saat bekleniyor") + "</p>",
            "</article>"
        ].join("");
    }

    function renderFixtureMatchCard(stageLabel, stageKey, index, time, home, away, hidden) {
        return [
            "<article class=\"admin-match-card\" data-stage-key=\"" + stageKey + "\" data-match-index=\"" + index + "\">",
            "    <div class=\"admin-card-head admin-card-head-actions\">",
            "        <div>",
            "            <h4>" + stageLabel + "</h4>",
            "            <p>Fikstür önizlemesi</p>",
            "        </div>",
            "        <button type=\"button\" class=\"btn btn-ghost admin-card-action\" data-admin-fixture-toggle>" + (hidden ? "Geri Getir" : "Sil") + "</button>",
            "    </div>",
            "    <div class=\"admin-live-editor-layout admin-fixture-editor-layout\">",
            "        <div class=\"admin-result-preview\" data-admin-fixture-preview>",
            renderFixturePreviewCard(stageLabel, time, home, away, hidden),
            "        </div>",
            "        <div class=\"admin-grid admin-grid-compact admin-result-editor-fields\">",
            renderField("Saat", "time", time),
            renderField("Ev Sahibi", "home", home),
            renderField("Deplasman", "away", away),
            "        </div>",
            "    </div>",
            "</article>"
        ].join("");
    }

    function renderResultPreviewCard(match) {
        var winner = getScoreLeader(match.homeScore, match.awayScore);
        var homeClass = winner === "home" ? " is-leading" : "";
        var awayClass = winner === "away" ? " is-leading" : "";
        var hasScore = match.homeScore !== "" || match.awayScore !== "";

        return [
            "<article class=\"score-card score-card-result admin-preview-score-card\">",
            "    <div class=\"score-card-head\">",
            "        <p class=\"score-card-branch\">" + escapeHTML(match.branch || "Sonu\u00e7 Kart\u0131") + "</p>",
            "        <span class=\"score-card-badge " + (hasScore ? "score-card-badge-final" : "score-card-badge-pending") + "\">" + escapeHTML(match.status || (hasScore ? "Tamamland\u0131" : "Bekliyor")) + "</span>",
            "    </div>",
            "    <div class=\"score-card-teams\">",
            "        <div class=\"score-card-team" + homeClass + "\">",
            "            <strong>" + escapeHTML(match.home || "-") + "</strong>",
            "            <span class=\"score-card-score\">" + escapeHTML(match.homeScore || "0") + "</span>",
            "        </div>",
            "        <div class=\"score-card-team" + awayClass + "\">",
            "            <strong>" + escapeHTML(match.away || "-") + "</strong>",
            "            <span class=\"score-card-score\">" + escapeHTML(match.awayScore || "0") + "</span>",
            "        </div>",
            "    </div>",
            "    <p class=\"score-card-meta\">" + escapeHTML(match.meta || "Ana sayfa sonu\u00e7 \u00f6nizlemesi") + "</p>",
            "</article>"
        ].join("");
    }

    function renderResultMatchCard(match, index) {
        return [
            "<article class=\"admin-card admin-live-editor-card admin-match-card-results\" data-admin-result-card data-result-index=\"" + index + "\">",
            "    <div class=\"admin-card-head admin-card-head-actions\">",
            "        <div>",
            "            <h3>Sonu\u00e7 Kart\u0131 " + String(index + 1) + "</h3>",
            "            <p>Sonuç önizlemesi</p>",
            "        </div>",
            "        <button type=\"button\" class=\"btn btn-ghost admin-card-action\" data-admin-result-remove>Sil</button>",
            "    </div>",
            "    <div class=\"admin-live-editor-layout admin-results-editor-layout\">",
            "        <div class=\"admin-result-preview\" data-admin-result-preview>",
            renderResultPreviewCard(match),
            "        </div>",
            "        <div class=\"admin-grid admin-grid-compact admin-result-editor-fields\">",
            renderField("Bran\u015f", "branch", match.branch),
            renderField("Durum", "status", match.status),
            renderField("1. Tak\u0131m", "home", match.home),
            renderField("1. Skor", "homeScore", match.homeScore),
            renderField("2. Tak\u0131m", "away", match.away),
            renderField("2. Skor", "awayScore", match.awayScore),
            renderField("Alt metin", "meta", match.meta),
            "        </div>",
            "    </div>",
            "</article>"
        ].join("");
    }

    function renderFixtureBranchCard(template, index) {
        var qfHidden = normalizeBooleanList(template.qf && (template.qf.fixtureHidden || template.qf.hidden), template.qf.times.length);
        var qfCards = template.qf.times.map(function (time, fixtureIndex) {
            var pair = getPair(template, "qf", fixtureIndex);
            return renderFixtureMatchCard("\u00c7eyrek Final " + String(fixtureIndex + 1), "qf", fixtureIndex, time, pair[0], pair[1], qfHidden[fixtureIndex]);
        }).join("");

        var sfHidden = normalizeBooleanList(template.sf && (template.sf.fixtureHidden || template.sf.hidden), template.sf.times.length);
        var sfCards = template.sf.times.map(function (time, fixtureIndex) {
            var pair = getPair(template, "sf", fixtureIndex);
            return renderFixtureMatchCard("Yar\u0131 Final " + String(fixtureIndex + 1), "sf", fixtureIndex, time, pair[0], pair[1], sfHidden[fixtureIndex]);
        }).join("");

        var finalPair = getPair(template, "final", 0);

        return [
            "<article class=\"fixture-panel admin-branch-card" + (index === 0 ? " active" : "") + "\" data-fixture-panel=\"" + template.key + "\" data-fixture-branch-key=\"" + template.key + "\">",
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
            renderFixtureMatchCard("Final", "final", 0, template.final.time, finalPair[0], finalPair[1], !!(template.final && (template.final.fixtureHidden || template.final.hidden))),
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
        if (activeCountInput) {
            activeCountInput.value = String(Array.isArray(state.liveMatches) ? state.liveMatches.length : 0);
        }
        completedInput.value = state.summary && state.summary.completedToday != null ? state.summary.completedToday : "9";
        if (resultsCountInput) {
            resultsCountInput.value = String(Array.isArray(state.resultMatches) ? state.resultMatches.length : 0);
        }
        publishToggle.checked = !!state.publishResults;
        if (publishFixturesToggle) {
            publishFixturesToggle.checked = !!state.publishFixtures;
        }
        liveMount.innerHTML = state.liveMatches.map(renderLiveCard).join("");
        fixtureMount.innerHTML = [
            "<div class=\"fixture-tabs admin-branch-tabs\" data-fixture-tabs>",
            renderBranchTabs(state.branchTemplates),
            "</div>",
            "<div class=\"fixture-panels admin-branch-panels\">",
            state.branchTemplates.map(renderFixtureBranchCard).join(""),
            "</div>"
        ].join("");
        resultsMount.innerHTML = (state.resultMatches || []).map(renderResultMatchCard).join("");

        if (typeof initializeFixtureTabGroups === "function") {
            initializeFixtureTabGroups(fixtureMount);
        }

        applyEditorPermissions();
    }

    function updateLivePreview(card) {
        var preview = card.querySelector("[data-admin-live-preview]");
        if (!preview) {
            return;
        }

        preview.innerHTML = renderLivePreviewCard({
            branch: getInputValue(card, "branch"),
            status: getInputValue(card, "status"),
            home: getInputValue(card, "home"),
            homeScore: getInputValue(card, "homeScore"),
            away: getInputValue(card, "away"),
            awayScore: getInputValue(card, "awayScore"),
            meta: getInputValue(card, "meta")
        });
    }

    function updateFixturePreview(card) {
        var preview = card.querySelector("[data-admin-fixture-preview]");
        if (!preview) {
            return;
        }

        var title = card.querySelector(".admin-card-head h4");
        preview.innerHTML = renderFixturePreviewCard(
            title ? title.textContent.trim() : "Fikstür",
            getInputValue(card, "time"),
            getInputValue(card, "home"),
            getInputValue(card, "away"),
            card.classList.contains("is-hidden")
        );
    }

    function updateResultPreview(card) {
        var preview = card.querySelector("[data-admin-result-preview]");
        if (!preview) {
            return;
        }

        preview.innerHTML = renderResultPreviewCard({
            branch: getInputValue(card, "branch"),
            status: getInputValue(card, "status"),
            home: getInputValue(card, "home"),
            homeScore: getInputValue(card, "homeScore"),
            away: getInputValue(card, "away"),
            awayScore: getInputValue(card, "awayScore"),
            meta: getInputValue(card, "meta")
        });
    }

    function syncDraftStateFromForm() {
        if (!liveMount || !fixtureMount || !resultsMount) {
            return;
        }

        state = collectFormData();
    }

    function addLiveCard() {
        if (!canEditContent()) {
            setMessage("Yeni canlı kart eklemek için önce yetkili admin olarak giriş yap.", "warning");
            return;
        }

        syncDraftStateFromForm();
        state.liveMatches.push(api.createLiveMatchTemplate(state.liveMatches.length));
        render();
        setMessage("Yeni canlı kart eklendi.", "success");
    }

    function removeLiveCard(index) {
        if (!canEditContent()) {
            setMessage("Canlı kart silmek için önce yetkili admin olarak giriş yap.", "warning");
            return;
        }

        syncDraftStateFromForm();
        state.liveMatches.splice(index, 1);
        render();
        setMessage("Canlı kart silindi.", "info");
    }

    function addResultCard() {
        if (!canEditContent()) {
            setMessage("Yeni sonuç kartı eklemek için önce yetkili admin olarak giriş yap.", "warning");
            return;
        }

        syncDraftStateFromForm();
        state.resultMatches.push(api.createResultMatchTemplate(state.resultMatches.length));
        render();
        setMessage("Yeni sonuç kartı eklendi.", "success");
    }

    function removeResultCard(index) {
        if (!canEditContent()) {
            setMessage("Sonuç kartı silmek için önce yetkili admin olarak giriş yap.", "warning");
            return;
        }

        syncDraftStateFromForm();
        state.resultMatches.splice(index, 1);
        render();
        setMessage("Sonuç kartı silindi.", "info");
    }

    function toggleFixtureCardVisibility(branchKey, stageKey, index) {
        if (!canEditContent()) {
            setMessage("Fikstür kartı düzenlemek için önce yetkili admin olarak giriş yap.", "warning");
            return;
        }

        var template = (state.branchTemplates || []).find(function (item) {
            return item && item.key === branchKey;
        });

        if (!template) {
            return;
        }

        syncDraftStateFromForm();
        template = (state.branchTemplates || []).find(function (item) {
            return item && item.key === branchKey;
        });

        if (!template) {
            return;
        }

        if (stageKey === "final") {
            template.final.fixtureHidden = !template.final.fixtureHidden;
            render();
            setMessage(template.final.fixtureHidden ? "Fikstür kartı gizlendi." : "Fikstür kartı geri getirildi.", "info");
            return;
        }

        template[stageKey].fixtureHidden = normalizeBooleanList(template[stageKey].fixtureHidden, template[stageKey].times.length);
        template[stageKey].fixtureHidden[index] = !template[stageKey].fixtureHidden[index];
        render();
        setMessage(template[stageKey].fixtureHidden[index] ? "Fikstür kartı gizlendi." : "Fikstür kartı geri getirildi.", "info");
    }

    function setActiveContentTab(key) {
        contentTabButtons.forEach(function (button) {
            var isActive = button.getAttribute("data-admin-content-tab") === key;
            button.classList.toggle("active", isActive);
        });

        contentPanels.forEach(function (panel) {
            var isActive = panel.getAttribute("data-admin-content-panel") === key;
            panel.hidden = !isActive;
            panel.classList.toggle("active", isActive);
        });
    }

    function syncLiveMatchCount(nextCount) {
        if (liveMount && liveMount.children.length) {
            syncDraftStateFromForm();
        }

        var safeCount = Math.max(0, Math.floor(Number(nextCount) || 0));
        var current = Array.isArray(state.liveMatches) ? state.liveMatches.slice() : [];

        if (safeCount === current.length) {
            return;
        }

        if (safeCount < current.length) {
            state.liveMatches = current.slice(0, safeCount);
            render();
            return;
        }

        while (current.length < safeCount) {
            current.push(api.createLiveMatchTemplate(current.length));
        }

        state.liveMatches = current;
        render();
    }

    function syncResultMatchCount(nextCount) {
        if (resultsMount && resultsMount.children.length) {
            syncDraftStateFromForm();
        }

        var safeCount = Math.max(0, Math.floor(Number(nextCount) || 0));
        var current = Array.isArray(state.resultMatches) ? state.resultMatches.slice() : [];

        if (safeCount === current.length) {
            return;
        }

        if (safeCount < current.length) {
            state.resultMatches = current.slice(0, safeCount);
            render();
            return;
        }

        while (current.length < safeCount) {
            current.push(api.createResultMatchTemplate(current.length));
        }

        state.resultMatches = current;
        render();
    }

    function canEditContent() {
        return !!(accessState.session && accessState.session.user && accessState.isAdmin);
    }

    function applyEditorPermissions() {
        var editable = canEditContent();
        var scope = adminMain || document;

        if (adminMain) {
            adminMain.setAttribute("data-edit-locked", editable ? "false" : "true");
        }

        Array.from(scope.querySelectorAll("[data-field], [data-admin-completed-today], [data-admin-results-count], [data-admin-publish-results], [data-admin-publish-fixtures], [data-admin-live-add], [data-admin-live-remove], [data-admin-result-add], [data-admin-result-remove], [data-admin-fixture-toggle]")).forEach(function (input) {
            input.disabled = !editable;
        });

        if (activeCountInput) {
            activeCountInput.disabled = !editable;
        }

        if (saveButton) {
            saveButton.disabled = !editable;
        }
        if (defaultsButton) {
            defaultsButton.disabled = !editable;
        }
        if (importTrigger) {
            importTrigger.disabled = !editable;
        }
        if (importInput) {
            importInput.disabled = !editable;
        }
    }

    function renderAdminAccess() {
        if (!adminUsersMount) {
            return;
        }

        var session = accessState.session;
        var sessionEmail = normalizeEmail(session && session.user ? session.user.email : "");

        if (adminAccessTitle) {
            adminAccessTitle.textContent = !accessState.configured
                ? "Yerel mod"
                : !session
                    ? "Giriş gerekli"
                    : accessState.isAdmin
                        ? "Yetkili admin"
                        : "Yetki bekleniyor";
        }

        if (adminAccessNote) {
            adminAccessNote.textContent = !accessState.configured
                ? "Supabase kapalıysa admin listesi yüklenmez."
                : !session
                    ? "Yetki durumunu görmek için giriş yap."
                    : accessState.isAdmin
                        ? "Bu hesap içerik güncelleyebilir."
                        : "Bu hesap giriş yaptı ancak admin listesinde değil.";
        }

        applyEditorPermissions();

        if (!accessState.configured) {
            adminUsersMount.innerHTML = [
                "<article class=\"admin-user-row admin-user-row-empty\">",
                "    <div class=\"admin-user-meta\">",
                "        <strong>Supabase devre dışı</strong>",
                "        <p>Bu bölüm yalnızca online admin modunda çalışır.</p>",
                "    </div>",
                "</article>"
            ].join("");
            return;
        }

        if (!session) {
            adminUsersMount.innerHTML = [
                "<article class=\"admin-user-row admin-user-row-empty\">",
                "    <div class=\"admin-user-meta\">",
                "        <strong>Giriş yap</strong>",
                "        <p>Admin listesini görüntülemek ve düzenlemek için oturum açmalısın.</p>",
                "    </div>",
                "</article>"
            ].join("");
            return;
        }

        if (accessState.isAdmin) {
            adminUsersMount.innerHTML = [
                "<article class=\"admin-user-row\">",
                "    <div class=\"admin-user-meta\">",
                "        <strong>" + escapeHTML(sessionEmail || "-") + "</strong>",
                "        <p>Bu hesap yetkili admin. Diğer admin hesapları güvenlik nedeniyle burada listelenmez.</p>",
                "    </div>",
                "    <div class=\"admin-user-actions\">",
                "        <span class=\"admin-user-badge\">Admin</span>",
                "        <span class=\"admin-user-badge\">Aktif</span>",
                "    </div>",
                "</article>"
            ].join("");
            return;
        }

        adminUsersMount.innerHTML = [
            "<article class=\"admin-user-row admin-user-row-empty\">",
            "    <div class=\"admin-user-meta\">",
            "        <strong>Yetki bekleniyor</strong>",
            "        <p>Bu hesap giriş yaptı, ancak admin yetkisi tanımlı değil.</p>",
            "    </div>",
            "</article>"
        ].join("");
    }

    function formatSubmissionTime(value) {
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Europe/Istanbul"
        }).format(date);
    }

    function renderContactSubmissions(items) {
        if (!submissionsMount) {
            return;
        }

        if (!accessState.configured) {
            submissionsMount.innerHTML = [
                "<article class=\"admin-submission-card admin-submission-card-empty\">",
                "    <strong>Supabase devre dışı</strong>",
                "    <p>İletişim mesajları yalnızca online modda toplanır.</p>",
                "</article>"
            ].join("");
            return;
        }

        if (!accessState.session || !accessState.isAdmin) {
            submissionsMount.innerHTML = [
                "<article class=\"admin-submission-card admin-submission-card-empty\">",
                "    <strong>Yetkili giriş gerekli</strong>",
                "    <p>İletişim mesajlarını görmek için admin olarak oturum açmalısın.</p>",
                "</article>"
            ].join("");
            return;
        }

        if (!Array.isArray(items) || !items.length) {
            submissionsMount.innerHTML = [
                "<article class=\"admin-submission-card admin-submission-card-empty\">",
                "    <strong>Henüz mesaj yok</strong>",
                "    <p>Yeni form gönderimleri burada listelenecek.</p>",
                "</article>"
            ].join("");
            return;
        }

        submissionsMount.innerHTML = items.map(function (item) {
            return [
                "<article class=\"admin-submission-card\">",
                "    <div class=\"admin-card-head\">",
                "        <h3>" + escapeHTML(item.name || "-") + "</h3>",
                "        <p>" + escapeHTML(formatSubmissionTime(item.created_at)) + "</p>",
                "    </div>",
                "    <div class=\"admin-submission-meta\">",
                "        <p><strong>E-posta:</strong> " + escapeHTML(item.email || "-") + "</p>",
                "        <p><strong>Konu:</strong> " + escapeHTML(item.topic || "-") + "</p>",
                "    </div>",
                "    <div class=\"admin-submission-message\">" + escapeHTML(item.message || "-").replace(/\\n/g, "<br>") + "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    function setRemoteStatus(configured, session, isAdmin) {
        var remaining = getLockRemainingMs();
        if (connectionStatus) {
            connectionStatus.textContent = configured ? "Supabase Haz\u0131r" : "Yerel Mod";
        }
        if (connectionNote) {
            connectionNote.textContent = configured
                ? "Canl\u0131 veri Supabase \u00fczerinden y\u00f6netiliyor."
                : "Supabase kapal\u0131. Panel yaln\u0131zca yerel modda \u00e7al\u0131\u015f\u0131r.";
        }
        if (authStatus) {
            authStatus.textContent = session && session.user
                ? (isAdmin ? "A\u00e7\u0131k / Admin" : "A\u00e7\u0131k / Yetkisiz")
                : "Kapal\u0131";
        }
        if (authNote) {
            authNote.textContent = !session || !session.user
                ? "Kaydetmek i\u00e7in admin giri\u015fi gerekli."
                : isAdmin
                    ? (session.user.email || "Admin kullan\u0131c\u0131s\u0131")
                    : "Bu hesap giri\u015f yapt\u0131 ancak admin yetkisi yok.";
        }
        if (loginButton) {
            loginButton.disabled = !configured || remaining > 0;
        }
        if (logoutButton) {
            logoutButton.disabled = !configured || !(session && session.user);
        }
    }

    async function refreshRemoteStatus() {
        var configured = !!(bridge && bridge.isConfigured && bridge.isConfigured());
        var session = configured ? await bridge.getSession() : null;
        var users = [];
        var isAdmin = false;

        if (configured && session && session.user && bridge && bridge.isCurrentUserAdmin) {
            try {
                isAdmin = await bridge.isCurrentUserAdmin();
            } catch (error) {
                isAdmin = false;
            }
        }

        accessState = {
            configured: configured,
            session: session,
            isAdmin: isAdmin,
            users: users
        };

        setRemoteStatus(configured, session, isAdmin);
        renderAdminAccess();
        armInactivityTimer();
        return {
            configured: configured,
            session: session,
            isAdmin: isAdmin,
            users: users
        };
    }

    async function refreshContactSubmissions() {
        if (!submissionsMount) {
            return [];
        }

        if (!(accessState.configured && accessState.session && accessState.isAdmin && bridge && bridge.fetchContactSubmissions)) {
            renderContactSubmissions([]);
            return [];
        }

        try {
            var submissions = await bridge.fetchContactSubmissions();
            renderContactSubmissions(submissions);
            return submissions;
        } catch (error) {
            submissionsMount.innerHTML = [
                "<article class=\"admin-submission-card admin-submission-card-empty\">",
                "    <strong>Mesajlar yüklenemedi</strong>",
                "    <p>" + escapeHTML(error && error.message ? error.message : "Bilinmeyen hata") + "</p>",
                "</article>"
            ].join("");
            return [];
        }
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

    function collectResultMatches() {
        return Array.from(document.querySelectorAll("[data-admin-result-card]")).map(function (card) {
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
        return Array.from(document.querySelectorAll("[data-fixture-branch-key]")).map(function (branchCard) {
            var key = branchCard.getAttribute("data-fixture-branch-key");
            var fallback = clone(defaultTemplates[key]);
            var currentTemplate = (state.branchTemplates || []).find(function (item) {
                return item && item.key === key;
            }) || fallback;
            var qfMatches = collectStageMatches(branchCard, "qf");
            var sfMatches = collectStageMatches(branchCard, "sf");
            var finalMatch = collectStageMatches(branchCard, "final")[0];

            fallback.qf.times = qfMatches.map(function (match) { return match.time; });
            fallback.qf.pairs = qfMatches.map(function (match) { return [match.home, match.away]; });
            fallback.qf.scores = clone(currentTemplate.qf && currentTemplate.qf.scores ? currentTemplate.qf.scores : fallback.qf.scores);

            fallback.sf.times = sfMatches.map(function (match) { return match.time; });
            fallback.sf.pairs = sfMatches.map(function (match) { return [match.home, match.away]; });
            fallback.sf.scores = clone(currentTemplate.sf && currentTemplate.sf.scores ? currentTemplate.sf.scores : fallback.sf.scores);

            fallback.final.time = finalMatch.time;
            fallback.final.pair = [finalMatch.home, finalMatch.away];
            fallback.final.score = clone(currentTemplate.final && currentTemplate.final.score ? currentTemplate.final.score : fallback.final.score);
            fallback.qf.fixtureHidden = normalizeBooleanList(currentTemplate.qf && (currentTemplate.qf.fixtureHidden || currentTemplate.qf.hidden), fallback.qf.times.length);
            fallback.qf.resultHidden = normalizeBooleanList(currentTemplate.qf && (currentTemplate.qf.resultHidden || currentTemplate.qf.hidden), fallback.qf.times.length);
            fallback.sf.fixtureHidden = normalizeBooleanList(currentTemplate.sf && (currentTemplate.sf.fixtureHidden || currentTemplate.sf.hidden), fallback.sf.times.length);
            fallback.sf.resultHidden = normalizeBooleanList(currentTemplate.sf && (currentTemplate.sf.resultHidden || currentTemplate.sf.hidden), fallback.sf.times.length);
            fallback.final.fixtureHidden = !!(currentTemplate.final && (currentTemplate.final.fixtureHidden || currentTemplate.final.hidden));
            fallback.final.resultHidden = !!(currentTemplate.final && (currentTemplate.final.resultHidden || currentTemplate.final.hidden));

            return fallback;
        });
    }

    function collectFormData() {
        var resultMatches = collectResultMatches();
        return {
            summary: {
                completedToday: completedInput.value.trim(),
                resultsCount: String(resultMatches.length)
            },
            publishResults: !!publishToggle.checked,
            publishFixtures: !!(publishFixturesToggle && publishFixturesToggle.checked),
            liveMatches: collectLiveMatches(),
            resultMatches: resultMatches,
            branchTemplates: collectBranchTemplates()
        };
    }

    if (activeCountInput) {
        activeCountInput.addEventListener("input", function () {
            if (!canEditContent()) {
                return;
            }

            syncLiveMatchCount(activeCountInput.value);
        });

        activeCountInput.addEventListener("change", function () {
            if (!canEditContent()) {
                setMessage("Canlı kart sayısını değiştirmek için önce yetkili admin olarak giriş yap.", "warning");
                activeCountInput.value = String(Array.isArray(state.liveMatches) ? state.liveMatches.length : 0);
                return;
            }

            syncLiveMatchCount(activeCountInput.value);
        });
    }

    if (resultsCountInput) {
        resultsCountInput.addEventListener("input", function () {
            if (!canEditContent()) {
                return;
            }

            syncResultMatchCount(resultsCountInput.value);
        });

        resultsCountInput.addEventListener("change", function () {
            if (!canEditContent()) {
                setMessage("Sonuç kartı sayısını değiştirmek için önce yetkili admin olarak giriş yap.", "warning");
                resultsCountInput.value = String(Array.isArray(state.resultMatches) ? state.resultMatches.length : 0);
                return;
            }

            syncResultMatchCount(resultsCountInput.value);
        });
    }

    if (liveAddButton) {
        liveAddButton.addEventListener("click", addLiveCard);
    }

    if (resultAddButton) {
        resultAddButton.addEventListener("click", addResultCard);
    }

    if (liveMount) {
        liveMount.addEventListener("input", function (event) {
            var card = event.target.closest("[data-admin-live-card]");
            if (card) {
                updateLivePreview(card);
            }
        });

        liveMount.addEventListener("click", function (event) {
            var removeButton = event.target.closest("[data-admin-live-remove]");
            if (!removeButton) {
                return;
            }

            var card = removeButton.closest("[data-admin-live-card]");
            if (!card) {
                return;
            }

            removeLiveCard(Number(card.getAttribute("data-live-index")) || 0);
        });
    }

    if (fixtureMount) {
        fixtureMount.addEventListener("input", function (event) {
            var card = event.target.closest(".admin-match-card");
            if (card) {
                updateFixturePreview(card);
            }
        });

        fixtureMount.addEventListener("click", function (event) {
            var toggleButton = event.target.closest("[data-admin-fixture-toggle]");
            if (!toggleButton) {
                return;
            }

            var card = toggleButton.closest(".admin-match-card");
            var branchCard = toggleButton.closest("[data-fixture-branch-key]");
            if (!card || !branchCard) {
                return;
            }

            toggleFixtureCardVisibility(
                branchCard.getAttribute("data-fixture-branch-key"),
                card.getAttribute("data-stage-key"),
                Number(card.getAttribute("data-match-index")) || 0
            );
        });
    }

    if (resultsMount) {
        resultsMount.addEventListener("input", function (event) {
            var card = event.target.closest("[data-admin-result-card]");
            if (card) {
                updateResultPreview(card);
            }
        });

        resultsMount.addEventListener("click", function (event) {
            var removeButton = event.target.closest("[data-admin-result-remove]");
            if (!removeButton) {
                return;
            }

            var card = removeButton.closest("[data-admin-result-card]");
            if (!card) {
                return;
            }

            removeResultCard(Number(card.getAttribute("data-result-index")) || 0);
        });
    }

    contentTabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            setActiveContentTab(button.getAttribute("data-admin-content-tab"));
        });
    });

    async function loadBestAvailableData() {
        state = await api.loadData();
        render();
    }

    saveButton.addEventListener("click", async function () {
        var nextState = collectFormData();
        try {
            var remoteStatus = await refreshRemoteStatus();
            if (remoteStatus.configured && remoteStatus.session && remoteStatus.session.user) {
                if (!remoteStatus.isAdmin) {
                    throw new Error("Bu hesap admin listesinde olmadığı için online kaydetme yetkisine sahip değil");
                }
                state = await api.saveDataRemote(nextState);
                setMessage("Supabase \u00fczerine kaydedildi. Herkes yeni veriyi g\u00f6rebilir.", "success");
            } else if (remoteStatus.configured) {
                throw new Error("D\u00fczenleme i\u00e7in \u00f6nce yetkili admin olarak giri\u015f yapmal\u0131s\u0131n");
            } else {
                throw new Error("Supabase ba\u011flant\u0131s\u0131 olmadan admin panel kilitli kal\u0131r. \u00d6nce ba\u011flant\u0131y\u0131 d\u00fczelt ve admin giri\u015fi yap.");
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
        if (!canEditContent()) {
            setMessage("Varsay\u0131lana d\u00f6nmek i\u00e7in \u00f6nce yetkili admin olarak giri\u015f yap.", "warning");
            return;
        }
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
        if (!canEditContent()) {
            setMessage("JSON i\u00e7e aktarmak i\u00e7in \u00f6nce yetkili admin olarak giri\u015f yap.", "warning");
            return;
        }
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

            var remaining = getLockRemainingMs();
            if (remaining > 0) {
                setMessage("Çok fazla başarısız deneme oldu. " + formatRemainingTime(remaining) + " sonra tekrar dene.", "error");
                await refreshRemoteStatus();
                return;
            }

            try {
                await bridge.signIn(emailInput.value.trim(), passwordInput.value);
                clearLoginGuard();
                passwordInput.value = "";
                await refreshRemoteStatus();
                await loadBestAvailableData();
                await refreshContactSubmissions();
                setMessage("Admin oturumu a\u00e7\u0131ld\u0131.", "success");
            } catch (error) {
                var guard = registerFailedLogin();
                var lockRemaining = guard.lockedUntil ? Math.max(0, guard.lockedUntil - Date.now()) : 0;
                await refreshRemoteStatus();
                if (lockRemaining > 0) {
                    setMessage("Çok fazla başarısız deneme oldu. " + formatRemainingTime(lockRemaining) + " boyunca giriş kilitlendi.", "error");
                    return;
                }
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
                await refreshContactSubmissions();
                setMessage("Admin oturumu kapat\u0131ld\u0131.", "info");
            } catch (error) {
                setMessage("\u00c7\u0131k\u0131\u015f ba\u015far\u0131s\u0131z: " + (error && error.message ? error.message : "Bilinmeyen hata"), "error");
            }
        });
    }

    window.addEventListener("dcfl-auth-changed", function () {
        refreshRemoteStatus();
        refreshContactSubmissions();
    });

    (async function init() {
        bindInactivityHandlers();
        render();
        applyEditorPermissions();
        setActiveContentTab("live");
        await refreshRemoteStatus();
        await loadBestAvailableData();
        await refreshContactSubmissions();
        setMessage("Panel haz\u0131r.", "info");
    })();
})();



