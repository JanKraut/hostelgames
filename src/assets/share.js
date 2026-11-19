// "Share" boxes on the rules, strategy and quick start pages: QR code, copy and share buttons.
// There are two: at the bottom of the page and in the QR popup opened from the top bar.
// The link is readable and clickable without this file.

const policy = document.permissionsPolicy || document.featurePolicy;
const canShare = !!navigator.share && !(policy?.allowsFeature && !policy.allowsFeature("web-share"));

function setUp(box) {
  const link = box.querySelector(".shurl a");
  const shareUrl = link.href;

  if (window.qrcode) {
    const qr = qrcode(0, "M");
    qr.addData(shareUrl);
    qr.make();
    box.querySelector(".qr").innerHTML = qr.createSvgTag(5, 2);
  }

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

// ---------- QR popup (button next to the light / dark switch) ----------

const popup = document.querySelector(".qrpop");
const qrButton = document.querySelector(".qrbtn");

if (popup && qrButton) {
  qrButton.addEventListener("click", () => popup.showModal());
  popup.querySelector(".qrclose").addEventListener("click", () => popup.close());
  // A click on the dark area around the box closes it; Escape closes it natively.
  popup.addEventListener("click", (event) => {
    if (event.target === popup) popup.close();
  });
}
