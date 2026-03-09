(function (window) {
    var STORAGE_KEY = "dcfl_admin_site_data_v2";
    var META_STORAGE_KEY = "dcfl_admin_site_meta_v1";
    var EVENT_NAME = "dcfl-site-data-updated";

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function asText(value, fallback) {
        if (value == null || value === "") {
            return fallback;
        }
        return String(value);
    }

    function normalizeTextList(value, fallback) {
        return fallback.map(function (item, index) {
            return asText(Array.isArray(value) ? value[index] : null, item);
        });
    }

    function normalizePairList(value, fallback) {
        return fallback.map(function (pair, index) {
            var nextPair = Array.isArray(value) ? value[index] : null;
            return [
                asText(Array.isArray(nextPair) ? nextPair[0] : null, pair[0]),
                asText(Array.isArray(nextPair) ? nextPair[1] : null, pair[1])
            ];
        });
    }

    function dispatchUpdate(source) {
        window.dispatchEvent(new CustomEvent(EVENT_NAME, {
            detail: {
                source: source || "local",
                updatedAt: cachedMeta.updatedAt || null
            }
        }));
    }

    function readMeta() {
        try {
            var raw = window.localStorage.getItem(META_STORAGE_KEY);
            if (!raw) {
                return {
                    updatedAt: null
                };
            }

            var parsed = JSON.parse(raw);
            return {
                updatedAt: parsed && parsed.updatedAt ? String(parsed.updatedAt) : null
            };
        } catch (error) {
            return {
                updatedAt: null
            };
        }
    }

    function writeMeta(updatedAt) {
        cachedMeta.updatedAt = updatedAt ? String(updatedAt) : null;
        try {
            window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(cachedMeta));
        } catch (error) {
            // Ignore storage failures.
        }
    }

    function createLiveMatchTemplate(index, seed) {
        var safeIndex = Math.max(0, Number(index) || 0);
        var source = seed && typeof seed === "object" ? seed : {};
        var teamStart = safeIndex * 2 + 1;

        return {
            branch: asText(source.branch, "Bran\u015f " + String(safeIndex + 1)),
            status: asText(source.status, "Canl\u0131"),
            home: asText(source.home, "Tak\u0131m " + String(teamStart)),
            homeScore: asText(source.homeScore, "0"),
            away: asText(source.away, "Tak\u0131m " + String(teamStart + 1)),
            awayScore: asText(source.awayScore, "0"),
            meta: asText(source.meta, "Aktif kar\u015f\u0131la\u015fma")
        };
    }

    var defaultData = {
        summary: {
            completedToday: "9",
            resultsCount: "4"
        },
        publishResults: false,
        liveMatches: [
            {
                branch: "Voleybol",
                status: "Canlı",
                home: "Takım 1",
                homeScore: "2",
                away: "Takım 8",
                awayScore: "1",
                meta: "Yarı final | Kapalı Spor Salonu | 2. set"
            },
            {
                branch: "Basketbol",
                status: "Canlı",
                home: "Takım 8",
                homeScore: "54",
                away: "Takım 7",
                awayScore: "61",
                meta: "Grup A | Ana Saha | 3. çeyrek"
            },
            {
                branch: "Futbol",
                status: "67. dakika",
                home: "Takım 1",
                homeScore: "1",
                away: "Takım 7",
                awayScore: "0",
                meta: "Yarı final | Dış Saha | 67. dakika"
            },
            {
                branch: "PlayStation",
                status: "Canlı",
                home: "Takım 1",
                homeScore: "2",
                away: "Takım 8",
                awayScore: "3",
                meta: "Final | E-Spor Alanı | 2. maç"
            }
        ],
        branchTemplates: [
            {
                key: "voleybol",
                name: { tr: "Voleybol", en: "Volleyball", pl: "Siatkowka" },
                venue: { tr: "Kapalı Spor Salonu", en: "Indoor Hall", pl: "Hala sportowa" },
                qf: {
                    times: ["10:00", "11:30", "14:00", "15:30"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["2", "0"], ["2", "1"], ["2", "1"], ["0", "2"]]
                },
                sf: { times: ["11:00", "14:00"], scores: [["2", "1"], ["1", "2"]] },
                final: { time: "16:00", score: ["3", "1"] }
            },
            {
                key: "basketbol",
                name: { tr: "Basketbol", en: "Basketball", pl: "Koszykowka" },
                venue: { tr: "Basketbol Sahası", en: "Basketball Court", pl: "Boisko do koszykowki" },
                qf: {
                    times: ["09:30", "11:30", "13:30", "15:30"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["66", "58"], ["63", "71"], ["74", "69"], ["61", "67"]]
                },
                sf: { times: ["12:00", "16:00"], scores: [["78", "72"], ["70", "76"]] },
                final: { time: "17:00", score: ["81", "77"] }
            },
            {
                key: "futbol",
                name: { tr: "Futbol", en: "Football", pl: "Pilka Nozna" },
                venue: { tr: "Çim Saha", en: "Grass Field", pl: "Boisko trawiaste" },
                qf: {
                    times: ["10:30", "12:30", "14:30", "16:30"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["2", "0"], ["1", "2"], ["3", "1"], ["2", "1"]]
                },
                sf: { times: ["12:30", "15:30"], scores: [["2", "1"], ["1", "0"]] },
                final: { time: "18:00", score: ["2", "1"] }
            },
            {
                key: "masa-tenisi",
                name: { tr: "Masa Tenisi", en: "Table Tennis", pl: "Tenis Stolowy" },
                venue: { tr: "Masa Tenisi Alanı", en: "Table Tennis Zone", pl: "Strefa tenisa stolowego" },
                qf: {
                    times: ["11:00", "12:00", "15:00", "16:00"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["3", "1"], ["3", "2"], ["1", "3"], ["3", "0"]]
                },
                sf: { times: ["13:00", "15:00"], scores: [["3", "1"], ["2", "3"]] },
                final: { time: "11:30", score: ["3", "2"] }
            },
            {
                key: "okculuk",
                name: { tr: "Okçuluk", en: "Archery", pl: "Lucznictwo" },
                venue: { tr: "Okçuluk Parkuru", en: "Archery Range", pl: "Tor luczniczy" },
                qf: {
                    times: ["10:00", "11:00", "13:00", "14:00"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["122", "118"], ["117", "120"], ["119", "121"], ["123", "119"]]
                },
                sf: { times: ["14:30", "16:00"], scores: [["125", "121"], ["120", "124"]] },
                final: { time: "12:30", score: ["128", "126"] }
            },
            {
                key: "oryantiring",
                name: { tr: "Oryantiring", en: "Orienteering", pl: "Bieg na Orientacje" },
                venue: { tr: "Kampüs Alanı", en: "Campus Course", pl: "Trasa kampusowa" },
                lowWins: true,
                qf: {
                    times: ["09:45", "10:30", "12:45", "13:30"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["38:14", "40:02"], ["37:44", "38:31"], ["39:10", "37:52"], ["36:58", "37:21"]]
                },
                sf: { times: ["10:45", "13:45"], scores: [["35:40", "36:12"], ["36:08", "35:49"]] },
                final: { time: "10:15", score: ["34:08", "35:21"] }
            },
            {
                key: "bahce-satranci",
                name: { tr: "Bahçe Satrancı", en: "Garden Chess", pl: "Szachy Ogrodowe" },
                venue: { tr: "Bahçe Satranç Alanı", en: "Garden Chess Zone", pl: "Strefa szachow ogrodowych" },
                qf: {
                    times: ["11:30", "12:30", "16:00", "17:00"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["1", "0"], ["0", "1"], ["1", "0"], ["0", "1"]]
                },
                sf: { times: ["12:00", "15:00"], scores: [["1", "0"], ["1", "0"]] },
                final: { time: "13:30", score: ["1", "0"] }
            },
            {
                key: "playstation",
                name: { tr: "PlayStation", en: "PlayStation", pl: "PlayStation" },
                venue: { tr: "E-Spor Alanı", en: "E-Sports Area", pl: "Strefa e-sportu" },
                qf: {
                    times: ["10:15", "11:15", "14:15", "15:15"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
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
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["11.52", "11.68"], ["11.61", "11.57"], ["11.74", "11.66"], ["11.69", "11.72"]]
                },
                sf: { times: ["14:00", "16:30"], scores: [["11.48", "11.54"], ["11.59", "11.53"]] },
                final: { time: "15:00", score: ["11.38", "11.44"] }
            },
            {
                key: "bahce-oyunlari",
                name: { tr: "Bahçe Oyunları", en: "Garden Games", pl: "Gry Ogrodowe" },
                venue: { tr: "Bahçe Etkinlik Alanı", en: "Garden Activity Zone", pl: "Strefa gier ogrodowych" },
                qf: {
                    times: ["10:45", "11:45", "13:45", "14:45"],
                    pairs: [["Takım 1", "Takım 8"], ["Takım 2", "Takım 7"], ["Takım 3", "Takım 6"], ["Takım 4", "Takım 5"]],
                    scores: [["21", "18"], ["19", "23"], ["24", "20"], ["17", "22"]]
                },
                sf: { times: ["16:15", "17:30"], scores: [["26", "21"], ["18", "24"]] },
                final: { time: "11:45", score: ["27", "25"] }
            }
        ]
    };

    function sanitizeLiveMatch(match, fallback, index) {
        return createLiveMatchTemplate(index, {
            branch: asText(match && match.branch, fallback.branch),
            status: asText(match && match.status, fallback.status),
            home: asText(match && match.home, fallback.home),
            homeScore: asText(match && match.homeScore, fallback.homeScore),
            away: asText(match && match.away, fallback.away),
            awayScore: asText(match && match.awayScore, fallback.awayScore),
            meta: asText(match && match.meta, fallback.meta)
        });
    }

    function sanitizeTemplate(template, fallback) {
        var next = clone(fallback);
        var source = template && typeof template === "object" ? template : {};

        next.qf.times = normalizeTextList(source.qf && source.qf.times, fallback.qf.times);
        next.qf.pairs = normalizePairList(source.qf && source.qf.pairs, fallback.qf.pairs);
        next.qf.scores = normalizePairList(source.qf && source.qf.scores, fallback.qf.scores);

        next.sf.times = normalizeTextList(source.sf && source.sf.times, fallback.sf.times);
        next.sf.scores = normalizePairList(source.sf && source.sf.scores, fallback.sf.scores);
        if (source.sf && Array.isArray(source.sf.pairs)) {
            next.sf.pairs = normalizePairList(source.sf.pairs, source.sf.pairs);
        }

        next.final.time = asText(source.final && source.final.time, fallback.final.time);
        next.final.score = normalizePairList([source.final && source.final.score], [fallback.final.score])[0];
        if (source.final && Array.isArray(source.final.pair)) {
            next.final.pair = normalizePairList([source.final.pair], [source.final.pair])[0];
        }

        return next;
    }

    function sanitizeData(raw) {
        var defaults = clone(defaultData);
        var source = raw && typeof raw === "object" ? raw : {};

        defaults.summary.completedToday = asText(source.summary && source.summary.completedToday, defaults.summary.completedToday);
        defaults.summary.resultsCount = asText(source.summary && source.summary.resultsCount, defaults.summary.resultsCount);
        defaults.publishResults = !!source.publishResults;

        if (Array.isArray(source.liveMatches)) {
            defaults.liveMatches = source.liveMatches.map(function (match, index) {
                var fallback = defaults.liveMatches[index] || createLiveMatchTemplate(index, defaults.liveMatches[index % defaults.liveMatches.length]);
                return sanitizeLiveMatch(match, fallback, index);
            });
        }

        if (Array.isArray(source.branchTemplates) && source.branchTemplates.length) {
            defaults.branchTemplates = defaults.branchTemplates.map(function (fallback) {
                var custom = source.branchTemplates.find(function (item) {
                    return item && item.key === fallback.key;
                });
                return sanitizeTemplate(custom, fallback);
            });
        }

        return defaults;
    }

    function getDefaultData() {
        return clone(defaultData);
    }

    function readLocalData() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return getDefaultData();
            }
            return sanitizeData(JSON.parse(raw));
        } catch (error) {
            return getDefaultData();
        }
    }

    var cachedData = readLocalData();
    var cachedMeta = readMeta();

    function writeLocalData(nextData) {
        var sanitized = sanitizeData(nextData);
        cachedData = sanitized;
        writeMeta(new Date().toISOString());
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch (error) {
            // Ignore storage failures.
        }
        dispatchUpdate("local");
        return sanitized;
    }

    function clearLocalData() {
        cachedData = getDefaultData();
        writeMeta(null);
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            // Ignore storage failures.
        }
        dispatchUpdate("local-clear");
        return clone(cachedData);
    }

    function getBridge() {
        return window.DCFLSupabaseBridge || null;
    }

    function isRemoteConfigured() {
        var bridge = getBridge();
        return !!(bridge && typeof bridge.isConfigured === "function" && bridge.isConfigured());
    }

    async function loadRemoteData() {
        var bridge = getBridge();
        if (!bridge || !bridge.isConfigured()) {
            return null;
        }

        try {
            var remote = await bridge.fetchSiteState();
            if (!remote || !remote.payload) {
                return null;
            }
            cachedData = sanitizeData(remote.payload);
            writeMeta(remote.updated_at || null);
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
            } catch (error) {
                // Ignore storage failures.
            }
            dispatchUpdate("remote");
            return clone(cachedData);
        } catch (error) {
            return null;
        }
    }

    async function loadData() {
        var remote = await loadRemoteData();
        return remote || clone(cachedData);
    }

    async function saveDataRemote(nextData) {
        var sanitized = sanitizeData(nextData);
        var bridge = getBridge();

        if (!bridge || !bridge.isConfigured()) {
            return writeLocalData(sanitized);
        }

        var saved = await bridge.saveSiteState(sanitized);
        cachedData = sanitizeData(saved && saved.payload ? saved.payload : sanitized);
        writeMeta(saved && saved.updated_at ? saved.updated_at : new Date().toISOString());
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
        } catch (error) {
            // Ignore storage failures.
        }
        dispatchUpdate("remote-save");
        return clone(cachedData);
    }

    var api = {
        STORAGE_KEY: STORAGE_KEY,
        EVENT_NAME: EVENT_NAME,
        getDefaultData: getDefaultData,
        getData: function () {
            return clone(cachedData);
        },
        getCachedData: function () {
            return clone(cachedData);
        },
        getLastUpdatedAt: function () {
            return cachedMeta.updatedAt || null;
        },
        getLocalData: function () {
            return readLocalData();
        },
        loadData: loadData,
        loadRemoteData: loadRemoteData,
        saveData: writeLocalData,
        saveDataRemote: saveDataRemote,
        clearData: clearLocalData,
        sanitizeData: sanitizeData,
        isRemoteConfigured: isRemoteConfigured
    };

    api.createLiveMatchTemplate = function (index) {
        return createLiveMatchTemplate(index, defaultData.liveMatches[index % defaultData.liveMatches.length]);
    };

    window.DCFLSiteData = api;
    window.DCFLAdminData = api;
})(window);
