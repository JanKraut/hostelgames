// "Share" box on the rules, strategy and quick start pages: QR code, copy and share buttons.
// The link is readable and clickable without this file.

const $ = (id) => document.getElementById(id);

const shareUrl = $("shurl").href;

if (window.qrcode) {
  const qr = qrcode(0, "M");
  qr.addData(shareUrl);
  qr.make();
  $("qr").innerHTML = qr.createSvgTag(5, 2);
}

const copyButton = $("shCopy");
const copyLabel = copyButton.textContent;

function copied() {
  copyButton.textContent = copyButton.dataset.done;
  setTimeout(() => (copyButton.textContent = copyLabel), 1800);
}

function selectUrl() {
  const range = document.createRange();
  range.selectNodeContents($("shurl"));
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

const shareButton = $("shShare");
const policy = document.permissionsPolicy || document.featurePolicy;
const canShare = !!navigator.share && !(policy?.allowsFeature && !policy.allowsFeature("web-share"));

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
