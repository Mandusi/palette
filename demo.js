const panelContent = document.getElementById("panelContent");
const textBtn = document.getElementById("textBtn");
const imageBtn = document.getElementById("imageBtn");
const uploadBtn = document.getElementById("uploadBtn");
const textPanel = document.querySelector(".textPanel");
const imagePanel = document.querySelector(".imagePanel");
const uploadPanel = document.querySelector(".uploadPanel");

const fonts = [
  "Alice",
  "Bubblegum Sans",
  "Crimson Pro",
  "Gabarito",
  "Geologica",
  "Kalam",
  "Lora",
  "Luckiest Guy",
  "Rajdhani",
  "Sniglet",
  "Sora",
  "Mulish",
  "Ceviche One",
  "Vollkorn",
  "Merienda",
  "Raleway Dots",
  "Kenia",
  "DM Sans",
  "Caudex",
  "Playfair Display",
];

const images = [
  "./assets/images/1.png",
  "./assets/images/2.png",
  "./assets/images/3.png",
  "./assets/images/4.png",
  "./assets/images/5.png",
  "./assets/images/6.png",
  "./assets/images/7.png",
  "./assets/images/8.png",
  "./assets/images/9.png",
  "./assets/images/10.png",
  "./assets/images/11.png",
  "./assets/images/12.png",
  "./assets/images/13.png",
  "./assets/images/14.png",
  "./assets/images/15.png",
];

let syncedText = ""; // Shared text state

function renderTexts() {
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

    // Sync all inputs on typing
    input.addEventListener("input", (e) => {
      syncedText = e.target.value;
      document.querySelectorAll(".font-item input").forEach((inp) => {
        if (inp !== e.target) inp.value = syncedText;
      });
    });

    div.appendChild(input);

    textPanel.appendChild(div);
  });
}

function renderImages() {
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

function renderUploads() {
  textPanel.style.display = "none";
  imagePanel.style.display = "none";
  uploadPanel.style.display = "block";

  const uploadSection = document.createElement("div");
  uploadSection.classList.add("upload-section");

  // Drag & Drop area
  const dragDropArea = document.createElement("div");
  dragDropArea.id = "dragDropArea";
  dragDropArea.classList.add("drag-drop-area");
  dragDropArea.innerHTML = `<img src="./assets/icons/cloud-arrow-up.svg"></img>
                            <div class="desc">Drag & drop images here or simply click</div>`;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  // Image grid container
  const uploadedGrid = document.createElement("div");
  uploadedGrid.classList.add("image-grid");
  uploadedGrid.style.marginTop = "12px";

  // Append elements
  uploadSection.appendChild(dragDropArea);
  uploadSection.appendChild(fileInput);
  uploadSection.appendChild(uploadedGrid);
  uploadPanel.appendChild(uploadSection);

  // Array to store uploaded images
  const uploadedImages = [];

  function updateGrid() {
    uploadedGrid.innerHTML = "";
    uploadedImages.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      uploadedGrid.appendChild(img);
    });
  }

  // --- Drag & Drop logic ---
  dragDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dragDropArea.style.background = "#f0f0f0";
  });
  dragDropArea.addEventListener("dragleave", (e) => {
    dragDropArea.style.background = "transparent";
  });
  dragDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDropArea.style.background = "transparent";
    handleFiles(e.dataTransfer.files);
  });

  // Button click opens file input
  dragDropArea.addEventListener("click", () => fileInput.click());

  // Manual file selection
  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  // Handle uploaded files
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

// Utils
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Scissors Animation
const img1 = document.getElementById("scissors1");
const img2 = document.getElementById("scissors2");
const scissors = document.getElementById("scissors-animation-container");

let showingFirst = true;
async function startAnimation(x) {
  scissors.style.transform = " rotate(0deg)";
  scissors.style.bottom = "-15px";

  await sleep(600);

  let switches = 0;
  scissors.style.left = `${x}px`;
  const interval = setInterval(() => {
    showingFirst = !showingFirst;
    img1.classList.toggle("active", showingFirst);
    img2.classList.toggle("active", !showingFirst);

    switches++;
    if (switches === 6) {
      clearInterval(interval);

      requestAnimationFrame(() => {
        scissors.style.transform = "rotate(-450deg)";
        scissors.style.bottom = "18px";
      });
    } // Stop after 3 switches
  }, 150); // 0.6s / 3 = 0.2s per switch
}

// Toggle between texts, images and uploads buttons

textBtn.addEventListener("click", () => {
  textBtn.classList.add("active");
  imageBtn.classList.remove("active");
  uploadBtn.classList.remove("active");
  startAnimation(14);
  textPanel.innerHTML = "";
  renderTexts();
});

imageBtn.addEventListener("click", () => {
  imageBtn.classList.add("active");
  textBtn.classList.remove("active");
  uploadBtn.classList.remove("active");
  startAnimation(134);
  imagePanel.innerHTML = "";
  renderImages();
});

uploadBtn.addEventListener("click", () => {
  uploadBtn.classList.add("active");
  imageBtn.classList.remove("active");
  textBtn.classList.remove("active");
  startAnimation(260);
  uploadPanel.innerHTML = "";
  renderUploads();
});

// Initial render
renderTexts();
