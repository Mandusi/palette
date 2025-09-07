import { sleep } from "./utils.js";

const img1 = document.getElementById("scissors1");
const img2 = document.getElementById("scissors2");
const scissors = document.getElementById("scissors-animation-container");

let showingFirst = true;

export async function startAnimation(x) {
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
