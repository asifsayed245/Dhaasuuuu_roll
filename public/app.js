const form = document.getElementById("gen-form");
const statusEl = document.getElementById("status");
const gallery = document.getElementById("gallery");
const logs = document.getElementById("logs");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Sending to Netlify Function…";
  gallery.innerHTML = "";
  logs.hidden = true;
  logs.textContent = "";

  const prompt = document.getElementById("prompt").value;
  const negativePrompt = document.getElementById("negative").value || undefined;
  const seed = document.getElementById("seed").value || undefined;
  const steps = document.getElementById("steps").value || undefined;
  const cfg = document.getElementById("cfg").value || undefined;
  const width = document.getElementById("width").value || undefined;
  const height = document.getElementById("height").value || undefined;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        negativePrompt,
        seed: seed ? Number(seed) : undefined,
        steps: steps ? Number(steps) : undefined,
        cfg: cfg ? Number(cfg) : undefined,
        width: width ? Number(width) : undefined,
        height: height ? Number(height) : undefined
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Request failed");
    }

    const data = await res.json();
    statusEl.textContent = `Status: ${data.status || "unknown"} — ID: ${data.id || "-"}`;

    const out = data.output;
    const urls = Array.isArray(out) ? out : (typeof out === "string" ? [out] : []);
    if (urls.length === 0) {
      statusEl.textContent += " — No image URLs returned.";
    } else {
      urls.forEach(u => {
        const img = document.createElement("img");
        img.src = u;
        img.alt = "Generated output";
        gallery.appendChild(img);
      });
    }

    if (data.logs) {
      logs.hidden = false;
      logs.textContent = data.logs;
    }
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
  }
});
