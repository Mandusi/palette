import ClothEditor from "./clotheditor1.js";

const root = document.querySelector("#root");

const product = {
  src: "./assets/icons/shirt-1.png",
  width: 844,
  height: 957,
  canvas: {
    x0: 210,
    y0: 250,
    x1: 620,
    y1: 865,
  },
};
const product1 = {
  src: "./assets/icons/shirt-2.png",
  width: 860,
  height: 1078,
  canvas: {
    x0: 223,
    y0: 151,
    x1: 630,
    y1: 868,
  },
};
const product2 = {
  src: "./assets/icons/bag-1.jpg",
  width: 691,
  height: 691,
  canvas: {
    x0: 250,
    y0: 380,
    x1: 470,
    y1: 620,
  },
};

new ClothEditor(root, product);
