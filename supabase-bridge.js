(function (window) {
    var config = window.DCFL_SUPABASE_CONFIG || {};
    var publicKey = config.publishableKey || config.anonKey || "";
    var isConfigured = !!(config.url && publicKey);
    var clientPromise = null;
    var authListenerAttached = false;
    var adminTable = config.adminTable || "admin_users";

    function normalizeEmail(value) {
        return String(value || "").trim().toLowerCase();
    }

    function dispatchAuthChange(session) {
        window.dispatchEvent(new CustomEvent("dcfl-auth-changed", {
            detail: {
                session: session || null
            }
        }));
    }

    async function getClient() {
        if (!isConfigured) {
            return null;
        }

        if (!clientPromise) {
            clientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
                .then(function (module) {
                    var client = module.createClient(config.url, publicKey, {
                        auth: {
                            persistSession: true,
                            autoRefreshToken: true,
                            detectSessionInUrl: true
                        }
                    });

                    if (!authListenerAttached) {
                        authListenerAttached = true;
                        client.auth.onAuthStateChange(function (_event, session) {
                            dispatchAuthChange(session);
                        });
                    }

                    return client;
                });
        }

        return clientPromise;
    }

    async function getSession() {
        var client = await getClient();
        if (!client) {
            return null;
        }

        var sessionResult = await client.auth.getSession();
        return sessionResult && sessionResult.data ? sessionResult.data.session : null;
    }

    async function signIn(email, password) {
        var client = await getClient();
        if (!client) {
            throw new Error("Supabase config missing");
        }

        var result = await client.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (result.error) {
            throw result.error;
        }

        dispatchAuthChange(result.data ? result.data.session : null);
        return result.data;
    }

    async function signOut() {
        var client = await getClient();
        if (!client) {
            return;
        }

        var result = await client.auth.signOut();
        if (result.error) {
            throw result.error;
        }

        dispatchAuthChange(null);
    }

    async function fetchSiteState() {
        var client = await getClient();
        if (!client) {
            return null;
        }

        var result = await client
            .from(config.table || "site_state")
            .select("key, payload, updated_at")
            .eq("key", config.rowKey || "main")
            .maybeSingle();

        if (result.error) {
            throw result.error;
        }

        return result.data || null;
    }

    async function saveSiteState(payload) {
        var client = await getClient();
        if (!client) {
            throw new Error("Supabase config missing");
        }

        var session = await getSession();
        if (!session || !session.user) {
            throw new Error("Admin oturumu acik degil");
        }

        var result = await client
            .from(config.table || "site_state")
            .upsert({
                key: config.rowKey || "main",
                owner_id: session.user.id,
                payload: payload,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "key"
            })
            .select("key, payload, updated_at")
            .single();

        if (result.error) {
            throw result.error;
        }

        return result.data;
    }

    async function fetchAdminUsers() {
        var client = await getClient();
        if (!client) {
            return [];
        }

        var result = await client
            .from(adminTable)
            .select("email, created_at")
            .order("created_at", { ascending: true });

        if (result.error) {
            throw result.error;
        }

        return Array.isArray(result.data) ? result.data : [];
    }

    window.DCFLSupabaseBridge = {
        isConfigured: function () {
            return isConfigured;
        },
        getConfig: function () {
            return config;
        },
        getClient: getClient,
        getSession: getSession,
        signIn: signIn,
        signOut: signOut,
        fetchAdminUsers: fetchAdminUsers,
        fetchSiteState: fetchSiteState,
        saveSiteState: saveSiteState
    };
})(window);
