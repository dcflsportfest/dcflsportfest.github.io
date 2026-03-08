(function () {
    var page = document.querySelector("[data-admin-page]");
    if (!page || !window.DCFLSiteData) {
        return;
    }

    var api = window.DCFLSiteData;
    var bridge = window.DCFLSupabaseBridge || null;
    var adminMain = document.querySelector("main[data-admin-page]");
    var liveMount = document.querySelector("[data-admin-live-matches]");
    var branchMount = document.querySelector("[data-admin-branches]");
    var activeCountInput = document.querySelector("[data-admin-active-count]");
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
    var adminAccessTitle = document.querySelector("[data-admin-access-title]");
    var adminAccessNote = document.querySelector("[data-admin-access-note]");
    var adminUsersMount = document.querySelector("[data-admin-users]");
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
        if (activeCountInput) {
            activeCountInput.value = String(Array.isArray(state.liveMatches) ? state.liveMatches.length : 0);
        }
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

        applyEditorPermissions();
    }

    function syncLiveMatchCount(nextCount) {
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

    function canEditContent() {
        return !!(accessState.session && accessState.session.user && accessState.isAdmin);
    }

    function applyEditorPermissions() {
        var editable = canEditContent();
        var scope = adminMain || document;

        if (adminMain) {
            adminMain.setAttribute("data-edit-locked", editable ? "false" : "true");
        }

        Array.from(scope.querySelectorAll("[data-field], [data-admin-completed-today], [data-admin-publish-results]")).forEach(function (input) {
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
                    ? "Admin listesi için önce giriş yap."
                    : accessState.isAdmin
                        ? "Bu hesap skor ve sonuç güncelleyebilir. Admin listesi Supabase içinden yönetilir."
                        : "Bu hesap giriş yaptı ama admin listesinde değil. E-postayı Supabase admin_users tablosuna eklemelisin.";
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

        if (!accessState.users.length) {
            adminUsersMount.innerHTML = [
                "<article class=\"admin-user-row admin-user-row-empty\">",
                "    <div class=\"admin-user-meta\">",
                "        <strong>Admin listesi boş</strong>",
                "        <p>İlk giriş yapan hesap otomatik olarak ilk admin olabilir. Gerekirse sayfayı yenileyip tekrar giriş yap.</p>",
                "    </div>",
                "</article>"
            ].join("");
            return;
        }

        adminUsersMount.innerHTML = "<div class=\"admin-user-list\">" + accessState.users.map(function (item) {
            var email = normalizeEmail(item.email);
            var isCurrent = email === sessionEmail;

            return [
                "<article class=\"admin-user-row\">",
                "    <div class=\"admin-user-meta\">",
                "        <strong>" + escapeHTML(email) + "</strong>",
                "        <p>" + (isCurrent ? "Bu oturum şu an bu hesapla açık." : "Yetkili admin hesabı.") + "</p>",
                "    </div>",
                "    <div class=\"admin-user-actions\">",
                "        <span class=\"admin-user-badge\">Admin</span>",
                isCurrent ? "        <span class=\"admin-user-badge\">Aktif</span>" : "",
                "    </div>",
                "</article>"
            ].join("");
        }).join("") + "</div>";
    }

    function setRemoteStatus(configured, session, isAdmin) {
        if (connectionStatus) {
            connectionStatus.textContent = configured ? "Supabase Haz\u0131r" : "Yerel Mod";
        }
        if (connectionNote) {
            connectionNote.textContent = configured
                ? "Canl\u0131 veri Supabase \u00fczerinden okunabilir ve yaz\u0131labilir. Admin listesi e-posta bazl\u0131 y\u00f6netilir."
                : "supabase-config.js bo\u015f. Panel sadece bu taray\u0131c\u0131da kay\u0131t yapar.";
        }
        if (authStatus) {
            authStatus.textContent = session && session.user
                ? (isAdmin ? "A\u00e7\u0131k / Admin" : "A\u00e7\u0131k / Yetkisiz")
                : "Kapal\u0131";
        }
        if (authNote) {
            authNote.textContent = !session || !session.user
                ? "Uzak kay\u0131t i\u00e7in admin giri\u015fi gerekli."
                : isAdmin
                    ? (session.user.email || "Admin kullan\u0131c\u0131s\u0131")
                    : "Bu hesap oturum a\u00e7t\u0131, ancak admin listesinde de\u011fil.";
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
        var users = [];
        var isAdmin = false;

        if (configured && session && session.user && bridge && bridge.fetchAdminUsers) {
            try {
                users = await bridge.fetchAdminUsers();
            } catch (error) {
                users = [];
            }
        }

        isAdmin = !!(session && session.user && users.some(function (item) {
            return normalizeEmail(item.email) === normalizeEmail(session.user.email);
        }));

        accessState = {
            configured: configured,
            session: session,
            isAdmin: isAdmin,
            users: users
        };

        setRemoteStatus(configured, session, isAdmin);
        renderAdminAccess();
        return {
            configured: configured,
            session: session,
            isAdmin: isAdmin,
            users: users
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

    if (activeCountInput) {
        activeCountInput.addEventListener("change", function () {
            if (!canEditContent()) {
                setMessage("Canlı kart sayısını değiştirmek için önce yetkili admin olarak giriş yap.", "warning");
                activeCountInput.value = String(Array.isArray(state.liveMatches) ? state.liveMatches.length : 0);
                return;
            }

            syncLiveMatchCount(activeCountInput.value);
        });
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
        applyEditorPermissions();
        await refreshRemoteStatus();
        await loadBestAvailableData();
        setMessage("Panel haz\u0131r.", "info");
    })();
})();

