import telnyx from "telnyx";

export default async (event, steps) => {
  const client = telnyx(process.env.TELNYX_API_KEY);

  // Parse body safely
  let body = {};
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    body = {};
  }

  const { numbers = [], payload = {} } = body;
  const FROM = process.env.TELNYX_PHONE_NUMBER;
  const CONNECTION_ID = process.env.TELNYX_CONNECTION_ID;

  const name = payload?.name || "Unknown";
  const id = payload?.userId || "unknown";
  const lat = payload?.lat;
  const lng = payload?.lng;
  const mapsLink = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : "";

  const text = `🚨 SOS ALERT 🚨
Name: ${name}, ID: ${id}.
Location: ${lat},${lng}.
${mapsLink}`;

  const results = [];

  for (const to of numbers) {
    const call = await client.calls.create({
      connection_id: CONNECTION_ID,
      to,
      from: FROM,
    });

    await client.calls.speak(call.data.call_control_id, {
      payload: text,
      voice: "alloy",
      language: "en-US",
    });

    results.push({ to, callId: call.data.call_control_id });
  }

  return { ok: true, results };
};
