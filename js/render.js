import { fonts, images, syncedText, setSyncedText } from "./constants.js";

const textPanel = document.querySelector(".textPanel");
const imagePanel = document.querySelector(".imagePanel");
const uploadPanel = document.querySelector(".uploadPanel");

export function renderTexts() {
  imagePanel.style.display = "none";
  uploadPanel.style.display = "none";
  textPanel.style.display = "block";

  fonts.forEach((font) => {
    const div = document.createElement("div");
    div.classList.add("font-item");

    const input = document.createElement("input");
    input.value = syncedText;
    input.style.fontFamily = font;
    input.placeholder = `Type here (${font})`;

    input.addEventListener("input", (e) => {
      setSyncedText(e.target.value);
      document.querySelectorAll(".font-item input").forEach((inp) => {
        if (inp !== e.target) inp.value = syncedText;
      });
    });

    div.appendChild(input);
    textPanel.appendChild(div);
  });
}

export function renderImages() {
  textPanel.style.display = "none";
  uploadPanel.style.display = "none";
  imagePanel.style.display = "block";

  const grid = document.createElement("div");
  grid.classList.add("image-grid");

  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    grid.appendChild(img);
  });

  imagePanel.appendChild(grid);
}

export function renderUploads() {
  textPanel.style.display = "none";
  imagePanel.style.display = "none";
  uploadPanel.style.display = "block";

  const uploadSection = document.createElement("div");
  uploadSection.classList.add("upload-section");

  const dragDropArea = document.createElement("div");
  dragDropArea.id = "dragDropArea";
  dragDropArea.classList.add("drag-drop-area");
  dragDropArea.innerHTML = `<img src="./assets/icons/cloud-arrow-up.svg">
                            <div class="desc">Drag & drop images here or simply click</div>`;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  const uploadedGrid = document.createElement("div");
  uploadedGrid.classList.add("image-grid");
  uploadedGrid.style.marginTop = "12px";

  uploadSection.appendChild(dragDropArea);
  uploadSection.appendChild(fileInput);
  uploadSection.appendChild(uploadedGrid);
  uploadPanel.appendChild(uploadSection);

  const uploadedImages = [];
  function updateGrid() {
    uploadedGrid.innerHTML = "";
    uploadedImages.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      uploadedGrid.appendChild(img);
    });
  }

  dragDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dragDropArea.style.background = "#f0f0f0";
  });

  dragDropArea.addEventListener("dragleave", () => {
    dragDropArea.style.background = "transparent";
  });

  dragDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDropArea.style.background = "transparent";
    handleFiles(e.dataTransfer.files);
  });

  dragDropArea.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedImages.push(e.target.result);
          updateGrid();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
