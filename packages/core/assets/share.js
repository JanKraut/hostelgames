// "Share" boxes of @hostelgames/core: QR code, copy and share buttons.
// Loaded on every page: the QR button at the top (sitehead.njk) opens a box as a popup.
// Pages with `share: true` also have one at the bottom (share.njk) and load qrcode.js right
// away; on all others qrcode.js is fetched when the popup is first opened.
// The link is readable and clickable without this file.

const policy = document.permissionsPolicy || document.featurePolicy;
const canShare = !!navigator.share && !(policy?.allowsFeature && !policy.allowsFeature("web-share"));

function drawQr(box) {
  const target = box.querySelector(".qr");
  if (!window.qrcode || target.firstChild) return;
  const qr = qrcode(0, "M");
  qr.addData(box.querySelector(".shurl a").href);
  qr.make();
  target.innerHTML = qr.createSvgTag(5, 2);
}

// qrcode.js (published next to this file), loaded once when needed.
let qrLoading;
function loadQr() {
  if (window.qrcode) return Promise.resolve();
  qrLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL("qrcode.js", import.meta.url).href;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  return qrLoading;
}

function setUp(box) {
  const link = box.querySelector(".shurl a");
  const shareUrl = link.href;

  drawQr(box);

  const copyButton = box.querySelector(".shcopy");
  const copyLabel = copyButton.textContent;

  function copied() {
    copyButton.textContent = copyButton.dataset.done;
    setTimeout(() => (copyButton.textContent = copyLabel), 1800);
  }

  function selectUrl() {
    const range = document.createRange();
    range.selectNodeContents(link);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copied();
    } catch {
      selectUrl();
    }
  }

  copyButton.addEventListener("click", copyLink);

  const shareButton = box.querySelector(".shshare");
  if (canShare) {
    shareButton.hidden = false;
    shareButton.addEventListener("click", () => {
      navigator.share({ title: document.title, url: shareUrl }).catch((error) => {
        if (error?.name !== "AbortError") {
          shareButton.hidden = true;
          copyLink();
        }
      });
    });
  }
}

document.querySelectorAll(".sharebox").forEach(setUp);

// ---------- QR popup (button in the top row) ----------

const popup = document.querySelector(".qrpop");
const qrButton = document.querySelector(".qrbtn");

if (popup && qrButton) {
  qrButton.addEventListener("click", () => {
    popup.showModal();
    const box = popup.querySelector(".sharebox");
    loadQr().then(() => drawQr(box), () => {});
  });
  popup.querySelector(".qrclose").addEventListener("click", () => popup.close());
  // A click on the dark area around the box closes it; Escape closes it natively.
  popup.addEventListener("click", (event) => {
    if (event.target === popup) popup.close();
  });
}
