import Replicate from "replicate";

export async function handler(event) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return { statusCode: 500, body: JSON.stringify({ error: "Missing REPLICATE_API_TOKEN" }) };
    const replicate = new Replicate({ auth: token });

    const id = (event.queryStringParameters && event.queryStringParameters.id) || null;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

    const prediction = await replicate.predictions.get(id);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: prediction?.id,
        status: prediction?.status,
        output: prediction?.output || null,
        logs: prediction?.logs || "",
        error: prediction?.error || null
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: err?.message || "Status failed" }) };
  }
}
