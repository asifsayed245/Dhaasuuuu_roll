const form = document.getElementById("gen-form");
const statusEl = document.getElementById("status");
const gallery = document.getElementById("gallery");
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbDl = document.getElementById("lightbox-download");
const lbClose = document.getElementById("lightbox-close");

function openLightbox(src) {
  lbImg.src = src;
  lbDl.href = src;
  lb.classList.remove("hidden");
  lb.focus();
}
function closeLightbox() {
  lb.classList.add("hidden");
  lbImg.src = "";
}
lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
lbClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.classList.contains("hidden")) closeLightbox(); });

async function pollStatus(id) {
  statusEl.textContent = "Status: starting…";
  while (true) {
    const res = await fetch(`/api/status?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    statusEl.textContent = `Status: ${data.status}`;
    if (data.error) throw new Error(data.error);
    if (data.status === "succeeded" || data.status === "failed" || data.status === "canceled") {
      return data;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Creating prediction…";
  gallery.innerHTML = "";

  const payload = {
    prompt: document.getElementById("prompt").value,
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
    if (!urls.length) { statusEl.textContent += " — No outputs"; return; }

    urls.forEach((src, i) => {
      const wrap = document.createElement("div");
      wrap.className = "item";
      const img = document.createElement("img");
      img.src = src; img.alt = `Output ${i+1}`; img.addEventListener("click", () => openLightbox(src));
      const actions = document.createElement("div");
      actions.className = "item-actions";
      const openA = document.createElement("a"); openA.href = src; openA.target = "_blank"; openA.rel = "noreferrer"; openA.textContent = "Open full size";
      const dlA = document.createElement("a"); dlA.href = src; dlA.download = `output_${i+1}.png`; dlA.textContent = "Download";
      actions.append(openA, dlA);
      wrap.append(img, actions);
      gallery.appendChild(wrap);
    });
  } catch (err) {
    statusEl.textContent = "Error: " + (err?.message || err);
  }
});
