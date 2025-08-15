const form = document.getElementById("gen-form");
const statusEl = document.getElementById("status");
const gallery = document.getElementById("gallery");
const logs = document.getElementById("logs");

async function pollStatus(id) {
  statusEl.textContent = "Status: starting…";
  while (true) {
    const res = await fetch(`/api/status?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    statusEl.textContent = `Status: ${data.status}`;
    if (data.error) {
      throw new Error(data.error);
    }
    if (data.status === "succeeded" || data.status === "failed" || data.status === "canceled") {
      if (data.logs) { logs.hidden = false; logs.textContent = data.logs; }
      return data;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Creating prediction…";
  gallery.innerHTML = "";
  logs.hidden = true;
  logs.textContent = "";

  const payload = {
    prompt: document.getElementById("prompt").value,
    negativePrompt: document.getElementById("negative").value || undefined,
    seed: Number(document.getElementById("seed").value) || undefined,
    steps: Number(document.getElementById("steps").value) || undefined,
    cfg: Number(document.getElementById("cfg").value) || undefined,
    width: Number(document.getElementById("width").value) || undefined,
    height: Number(document.getElementById("height").value) || undefined
  };

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Create failed (${res.status})`);
    const { id } = await res.json();
    if (!id) throw new Error("No prediction id returned");

    const done = await pollStatus(id);
    const urls = Array.isArray(done.output) ? done.output : (done.output ? [done.output] : []);
    if (urls.length === 0) {
      statusEl.textContent += " — No output URLs";
    } else {
      urls.forEach(u => {
        const img = document.createElement("img");
        img.src = u; img.alt = "Output";
        gallery.appendChild(img);
      });
    }
  } catch (err) {
    statusEl.textContent = "Error: " + (err?.message || err);
  }
});
