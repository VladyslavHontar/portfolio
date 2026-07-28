// Shared image lightbox for every page.
//
// Uses a native <dialog>, so Escape-to-close, the backdrop and focus trapping
// come from the browser instead of being hand-rolled. Clicks are handled by one
// delegated listener on the document, so images added to a page later work
// without registering anything.
(() => {
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  const full = document.createElement("img");
  dialog.append(full);
  document.body.append(dialog);

  document.addEventListener("click", (e) => {
    const zoomable = e.target.closest(".blur-load img, [data-zoom]");
    if (zoomable) {
      // currentSrc resolves <picture>/srcset to whatever the browser actually loaded
      full.src = zoomable.currentSrc || zoomable.src;
      full.alt = zoomable.alt || "";
      dialog.showModal();
      return;
    }
    // a click on the dialog itself is a click on the backdrop
    if (e.target === dialog || e.target === full) dialog.close();
  });

  // Fade thumbnails in once they have decoded.
  document.querySelectorAll(".blur-load").forEach((wrapper) => {
    const img = wrapper.querySelector("img");
    if (!img) return;
    if (img.complete) wrapper.classList.add("loaded");
    else img.addEventListener("load", () => wrapper.classList.add("loaded"));
  });
})();
