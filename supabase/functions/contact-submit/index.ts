import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const projectUrl = Deno.env.get("PROJECT_URL") ?? "";
const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "";
const resendToEmail = Deno.env.get("RESEND_TO_EMAIL") ?? "";

function jsonResponse(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8"
        }
    });
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizePayload(body: Record<string, unknown>) {
    return {
        name: String(body.name ?? "").trim(),
        email: String(body.email ?? "").trim(),
        topic: String(body.topic ?? "").trim(),
        message: String(body.message ?? "").trim()
    };
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function insertSubmission(payload: { name: string; email: string; topic: string; message: string }) {
    if (!projectUrl || !serviceRoleKey) {
        throw new Error("Supabase service configuration missing");
    }

    const response = await fetch(`${projectUrl}/rest/v1/contact_submissions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "return=representation"
        },
        body: JSON.stringify([payload])
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const rows = await response.json();
    return Array.isArray(rows) ? rows[0] : rows;
}

async function sendMail(payload: { name: string; email: string; topic: string; message: string }) {
    if (!resendApiKey || !resendFromEmail || !resendToEmail) {
        return { sent: false, reason: "mail-secrets-missing" };
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: resendFromEmail,
            to: [resendToEmail],
            reply_to: payload.email,
            subject: `[DCFL Sportfest] ${payload.topic}`,
            text: [
                `Ad Soyad / Firma: ${payload.name}`,
                `E-posta: ${payload.email}`,
                `Konu: ${payload.topic}`,
                "",
                payload.message
            ].join("\n"),
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0d1d40">
                    <h2>Yeni İletişim Formu Mesajı</h2>
                    <p><strong>Ad Soyad / Firma:</strong> ${escapeHtml(payload.name)}</p>
                    <p><strong>E-posta:</strong> ${escapeHtml(payload.email)}</p>
                    <p><strong>Konu:</strong> ${escapeHtml(payload.topic)}</p>
                    <p><strong>Mesaj:</strong></p>
                    <p>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>
                </div>
            `
        })
    });

    if (!response.ok) {
        return { sent: false, reason: await response.text() };
    }

    return { sent: true, result: await response.json() };
}

serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
        const body = await request.json();
        const payload = normalizePayload(body);

        if (
            payload.name.length < 2 ||
            !isValidEmail(payload.email) ||
            payload.topic.length < 2 ||
            payload.message.length < 6
        ) {
            return jsonResponse({ error: "Invalid contact payload" }, 400);
        }

        const submission = await insertSubmission(payload);
        const mail = await sendMail(payload);

        return jsonResponse({
            ok: true,
            submission,
            mailSent: mail.sent,
            mailStatus: mail
        });
    } catch (error) {
        return jsonResponse({
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
});
