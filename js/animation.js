import { sleep } from "./utils.js";

// Scissors Animation
const img1 = document.getElementById("scissors1");
const img2 = document.getElementById("scissors2");
const scissors = document.getElementById("scissors-animation-container");

let showingFirst = true;

export async function startScissorsAnimation(x) {
  scissors.style.transform = "rotate(0deg)";
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
    }
  }, 150);
}

// Prompter Animation
const promptWrapper = document.querySelector(".prompt-wrapper");
const githubBtn = document.querySelector("#githubBtn");

const promptTexts = [
  "Welcome to Palette — because plain T-shirts are soooo 2010. 😎",
  "Write anything you want… unless it’s your ex’s name.",
  "Drag & drop images like a pro — transparent PNGs, no drama.",
  "Pick from 20+ awesome styles — or pretend you designed them yourself.",
  "Export your masterpiece instantly… no loading screens, we promise!",
  "Go wild, have fun, and unleash your inner fashion icon.",
  "Wanna stalk—uh, *check out* my other projects? 👉 Hit that GitHub button on the right!",
];

let currentIndex = 0;
let prompts = [];

// Dynamically create <p> tags
function createPrompts() {
  promptTexts.forEach((text, i) => {
    const p = document.createElement("p");
    p.textContent = text;
    if (i === 0) p.classList.add("active");
    promptWrapper.appendChild(p);
    prompts.push(p);
  });
}

function cyclePrompts() {
  const currentPrompt = prompts[currentIndex];
  currentPrompt.classList.remove("active");
  currentPrompt.classList.add("exit");

  setTimeout(() => {
    currentPrompt.classList.remove("exit");
  }, 800);

  // Move to next prompt
  currentIndex = (currentIndex + 1) % prompts.length;
  const nextPrompt = prompts[currentIndex];
  nextPrompt.classList.add("active");

  // GitHub button pulsing logic
  if (currentIndex === promptTexts.length - 1) {
    githubBtn.classList.add("github-pulse");
  } else {
    // Wait for the pulse animation to finish before removing
    setTimeout(() => {
      githubBtn.classList.remove("github-pulse");
    }, 1800);
  }
}

// Initialize prompts
createPrompts();
setInterval(cyclePrompts, 4000);
