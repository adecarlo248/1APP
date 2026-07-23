// netlify/functions/claim-trial.js
// Receives free trial form submissions → upserts contact in GHL → adds hot-lead tag

const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION  = "2021-07-28";

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: "",
    };
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

  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.error("Missing GHL env vars");
    return respond(500, { error: "Server configuration error" });
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };

  try {
    // 1. Upsert contact
    const contactPayload = {
      locationId,
      firstName,
      lastName,
      email,
      tags: ["hot-lead", "30-day-trial"],
      source: "use1app.com – free trial popup",
    };

    if (phone)        contactPayload.phone        = phone;
    if (businessName) contactPayload.companyName  = businessName;

    const upsertRes = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify(contactPayload),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error("GHL upsert failed:", err);
      return respond(502, { error: "Failed to save contact" });
    }

    const contactData = await upsertRes.json();
    const contactId   = contactData?.contact?.id;

    console.log(`✅ Contact saved: ${contactId} | ${email}`);

    return respond(200, { success: true, message: "You're in! We'll be in touch within 24 hours." });

  } catch (err) {
    console.error("Unexpected error:", err);
    return respond(500, { error: "Unexpected server error" });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}
