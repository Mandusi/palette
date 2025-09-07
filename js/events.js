import { renderTexts, renderImages, renderUploads } from "./render.js";
import { startAnimation } from "./animation.js";

const panel = document.querySelector(".panel");
const panelContent = document.getElementById("panelContent");
const textBtn = document.getElementById("textBtn");
const imageBtn = document.getElementById("imageBtn");
const uploadBtn = document.getElementById("uploadBtn");

textBtn.addEventListener("click", () => {
  textBtn.classList.add("active");
  imageBtn.classList.remove("active");
  uploadBtn.classList.remove("active");
  startAnimation(14);
  document.querySelector(".textPanel").innerHTML = "";
  renderTexts();
});

imageBtn.addEventListener("click", () => {
  imageBtn.classList.add("active");
  textBtn.classList.remove("active");
  uploadBtn.classList.remove("active");
  startAnimation(134);
  document.querySelector(".imagePanel").innerHTML = "";
  renderImages();
});

uploadBtn.addEventListener("click", () => {
  uploadBtn.classList.add("active");
  imageBtn.classList.remove("active");
  textBtn.classList.remove("active");
  startAnimation(260);
  document.querySelector(".uploadPanel").innerHTML = "";
  renderUploads();
});

document.addEventListener("click", (e) => {
  if (!panel.contains(e.target) && window.innerWidth < 768) {
    panel.classList.remove("open");
    panel.classList.add("closed");
  } else if (panel.contains(e.target) && window.innerWidth < 768) {
    panel.classList.add("open");
    panel.classList.remove("closed");
  }
});
