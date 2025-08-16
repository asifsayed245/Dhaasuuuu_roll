const statusEl = document.getElementById("status");
const gallery = document.getElementById("gallery");
const promptEl = document.getElementById("prompt");
const goBtn = document.getElementById("go");
const chips = Array.from(document.querySelectorAll(".chip"));
let selected = { w: 1024, h: 1024 };
const selEl = document.getElementById("sel");
chips.forEach((btn) => {
  btn.addEventListener("click", () => {
    chips.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selected.w = Number(btn.dataset.w);
    selected.h = Number(btn.dataset.h);
    selEl.textContent = selected.w + "×" + selected.h;
  });
});
chips[0].classList.add("active");

const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbClose = document.getElementById("lightbox-close");
const lbDownload = document.getElementById("lightbox-download");
function openLightbox(src) { lbImg.src = src; lb.classList.remove("hidden"); }
function closeLightbox() { lb.classList.add("hidden"); lbImg.src = ""; }
lbClose.addEventListener("click", closeLightbox);
lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.classList.contains("hidden")) closeLightbox(); });

async function downloadImage(url, filename = "image.png") {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  const a = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  a.href = objectUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(objectUrl);
}

async function pollStatus(id) {
  statusEl.textContent = "Status: starting...";
  while (true) {
    const res = await fetch(`/api/status?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    statusEl.textContent = `Status: ${data.status}`;
    if (data.error) throw new Error(data.error);
    if (data.status === "succeeded" || data.status === "failed" || data.status === "canceled") { return data; }
    await new Promise(r => setTimeout(r, 1200));
  }
}

goBtn.addEventListener("click", async () => {
  const payload = { prompt: promptEl.value, width: selected.w, height: selected.h };
  gallery.innerHTML = ""; statusEl.textContent = "Creating prediction...";
  try {
    const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Create failed (${res.status})`);
    const { id } = await res.json(); if (!id) throw new Error("No prediction id returned");
    const done = await pollStatus(id);
    const urls = Array.isArray(done.output) ? done.output : (done.output ? [done.output] : []);
    if (!urls.length) { statusEl.textContent += " — No outputs"; return; }
    urls.forEach((src, i) => {
      const wrap = document.createElement("div"); wrap.className = "item";
      const img = document.createElement("img"); img.src = src; img.alt = `Output ${i+1}`; img.addEventListener("click", () => openLightbox(src));
      const row = document.createElement("div"); row.className = "row";
      const openA = document.createElement("a"); openA.href = src; openA.target = "_blank"; openA.rel = "noreferrer"; openA.textContent = "Open";
      const dlBtn = document.createElement("button"); dlBtn.textContent = "Download"; dlBtn.addEventListener("click", () => downloadImage(src, `output_${i+1}.png`));
      row.append(openA, dlBtn); wrap.append(img, row); gallery.appendChild(wrap);
    });
    lbDownload.onclick = () => { if (lbImg.src) downloadImage(lbImg.src, "output.png"); };
  } catch (err) {
    statusEl.textContent = "Error: " + (err?.message || err);
  }
});
