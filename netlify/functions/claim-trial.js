// netlify/functions/claim-trial.js
// Receives free trial form submissions → upserts contact in GHL → sends emails via Resend

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION  = "2021-07-28";
const RESEND_API   = "https://api.resend.com/emails";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON" });
  }

  const { firstName, lastName, email, phone, businessName } = body;

  if (!firstName || !lastName || !email) {
    return respond(400, { error: "firstName, lastName, and email are required" });
  }

  const apiKey      = process.env.GHL_API_KEY;
  const locationId  = process.env.GHL_LOCATION_ID;
  const resendKey   = process.env.RESEND_API_KEY;

  if (!apiKey || !locationId) {
    console.error("Missing GHL env vars");
    return respond(500, { error: "Server configuration error" });
  }

  const ghlHeaders = {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };

  // ─── 1. Upsert contact in GHL ───────────────────────────────────────────────
  let contactId;
  try {
    const contactPayload = {
      locationId,
      firstName,
      lastName,
      email,
      tags: ["hot-lead", "30-day-trial"],
      source: "use1app.com – free trial popup",
    };
    if (phone)        contactPayload.phone       = phone;
    if (businessName) contactPayload.companyName = businessName;

    const upsertRes = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify(contactPayload),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error("GHL upsert failed:", err);
      return respond(502, { error: "Failed to save contact" });
    }

    const contactData = await upsertRes.json();
    contactId = contactData?.contact?.id;
    console.log(`✅ GHL contact saved: ${contactId} | ${email}`);
  } catch (err) {
    console.error("GHL error:", err);
    return respond(500, { error: "Failed to save contact" });
  }

  // ─── 2. Send emails via Resend ──────────────────────────────────────────────
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping email sends");
  } else {
    const resendHeaders = {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    };

    // 2a. Thank-you email → customer
    const customerEmail = {
      from: "1APP <hello@use1app.com>",
      to: [email],
      subject: "You're in — your 30-day free trial is confirmed ✅",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#f7f9fc;font-family:Inter,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(6,38,83,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:#062653;padding:32px 40px;text-align:center;">
                    <span style="font-size:1.8rem;font-weight:900;color:#c99a2e;letter-spacing:-0.5px;">1APP</span>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h1 style="margin:0 0 12px;font-size:1.5rem;font-weight:800;color:#062653;">
                      Hey ${firstName}, you're confirmed! 🎉
                    </h1>
                    <p style="margin:0 0 20px;font-size:1rem;line-height:1.6;color:#647084;">
                      Thanks for claiming your 30-day free trial of 1APP. We've got your information and we'll be in touch within <strong>1 business day</strong> to get you set up.
                    </p>
                    <p style="margin:0 0 20px;font-size:1rem;line-height:1.6;color:#647084;">
                      Here's what happens next:
                    </p>
                    <ul style="margin:0 0 24px;padding-left:20px;color:#647084;line-height:1.8;">
                      <li>We'll reach out to confirm your business details</li>
                      <li>We build and configure your automation system</li>
                      <li>You go live — missed calls answered, leads followed up, reviews rolling in</li>
                    </ul>
                    <p style="margin:0 0 32px;font-size:1rem;line-height:1.6;color:#647084;">
                      In the meantime, if you have any questions just reply to this email.
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#c99a2e;border-radius:8px;">
                          <a href="https://api.leadconnectorhq.com/widget/bookings/1app-free-demo"
                             style="display:inline-block;padding:14px 28px;font-size:0.95rem;font-weight:700;color:#ffffff;text-decoration:none;">
                            Book a Setup Call →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid #dfe5ee;text-align:center;">
                    <p style="margin:0;font-size:0.8rem;color:#9aa5b4;">
                      1APP Technologies Inc. — Peterborough, Ontario, Canada<br/>
                      <a href="https://use1app.com" style="color:#c99a2e;">use1app.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    };

    // 2b. Notification email → Tony
    const notifyEmail = {
      from: "1APP Leads <hello@use1app.com>",
      to: ["adecarlo@use1app.com"],
      subject: `🔥 New trial claim: ${firstName} ${lastName}${businessName ? ` — ${businessName}` : ""}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Inter,Arial,sans-serif;background:#f7f9fc;padding:40px 20px;">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 24px rgba(6,38,83,0.08);">
            <tr><td>
              <h2 style="margin:0 0 20px;color:#062653;">🔥 New 30-Day Trial Claim</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f7f9fc;">
                  <td style="font-weight:700;color:#062653;width:130px;padding:10px 12px;border:1px solid #dfe5ee;">Name</td>
                  <td style="padding:10px 12px;border:1px solid #dfe5ee;color:#142033;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#062653;padding:10px 12px;border:1px solid #dfe5ee;">Email</td>
                  <td style="padding:10px 12px;border:1px solid #dfe5ee;"><a href="mailto:${email}" style="color:#c99a2e;">${email}</a></td>
                </tr>
                <tr style="background:#f7f9fc;">
                  <td style="font-weight:700;color:#062653;padding:10px 12px;border:1px solid #dfe5ee;">Phone</td>
                  <td style="padding:10px 12px;border:1px solid #dfe5ee;color:#142033;">${phone || "—"}</td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#062653;padding:10px 12px;border:1px solid #dfe5ee;">Business</td>
                  <td style="padding:10px 12px;border:1px solid #dfe5ee;color:#142033;">${businessName || "—"}</td>
                </tr>
                <tr style="background:#f7f9fc;">
                  <td style="font-weight:700;color:#062653;padding:10px 12px;border:1px solid #dfe5ee;">GHL Contact</td>
                  <td style="padding:10px 12px;border:1px solid #dfe5ee;"><a href="https://app.gohighlevel.com/contacts/${contactId}" style="color:#c99a2e;">View in GHL →</a></td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:0.85rem;color:#647084;">
                Submitted via use1app.com — 30-day free trial popup
              </p>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    };

    // Fire both emails in parallel
    const [custRes, notifyRes] = await Promise.all([
      fetch(RESEND_API, { method: "POST", headers: resendHeaders, body: JSON.stringify(customerEmail) }),
      fetch(RESEND_API, { method: "POST", headers: resendHeaders, body: JSON.stringify(notifyEmail) }),
    ]);

    if (custRes.ok) {
      console.log(`✅ Thank-you email sent to ${email}`);
    } else {
      const err = await custRes.text();
      console.error("Resend customer email failed:", err);
    }

    if (notifyRes.ok) {
      console.log("✅ Notification email sent to Tony");
    } else {
      const err = await notifyRes.text();
      console.error("Resend notification email failed:", err);
    }
  }

  return respond(200, { success: true, message: "You're in! We'll be in touch within 24 hours." });
};

function respond(statusCode, body) {
  return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}
