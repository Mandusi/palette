import TextController from "./TextController.js";
import ImgController from "./ImgController.js";
import { icons } from "./svgIcons.js";

export default class ClothEditor {
  constructor(root, product) {
    this.root = root;
    this.product = product;

    // MAIN DIV ELEMENT
    this.mainContainerWrapper = document.createElement("div");
    this.mainContainerWrapper.setAttribute("id", "mir-main-container-wrapper");
    this.root.append(this.mainContainerWrapper);

    this.mainContainer = document.createElement("div");
    this.mainContainer.setAttribute("id", "mir-main-container");
    this.mainContainerWrapper.append(this.mainContainer);

    // PRODUCT IMAGE ELEMENT
    this.productImg = document.createElement("img");
    this.productImg.setAttribute("src", this.product.src);
    this.productImg.setAttribute("id", "mir-product-img");
    this.mainContainer.append(this.productImg);

    // CANVAS ELEMENT
    this.canvasContainer = document.createElement("div");
    this.canvasContainer.setAttribute("id", "mir-canvas-container-wrapper");
    this.mainContainer.append(this.canvasContainer);
    this.canvasEl = document.createElement("canvas");
    this.canvasContainer.append(this.canvasEl);
    this.canvas = new window.fabric.Canvas(this.canvasEl);

    // ZOOMSLIDER
    this.zoomSliderContainer = document.createElement("div");
    this.zoomSliderContainer.setAttribute("id", "mir-zoomslider-container");
    this.zoomSlider = document.createElement("input");
    this.zoomSlider.setAttribute("type", "range");
    this.zoomSlider.setAttribute("id", "mir-zoomslider");
    this.zoomSlider.value = 0;
    this.zoomSliderPercent = document.createElement("h3");
    this.zoomSliderPercent.innerHTML = "0%";
    this.zoomSliderContainer.append(this.zoomSlider, this.zoomSliderPercent);
    this.mainContainerWrapper.append(this.zoomSliderContainer);

    // PREVIEW ELEMENT
    this.previewBtn = document.createElement("button");
    this.previewBtn.setAttribute("id", "preview-btn");
    this.previewBtn.setAttribute("class", "mir-button");
    this.previewBtn.innerHTML = `${icons.preview} Preview`;
    this.mainContainerWrapper.append(this.previewBtn);

    // RATIOS
    this.prodCanvasRatio =
      this.product.height / (this.product.canvas.y1 - this.product.canvas.y0);

    this.canvasHWRatio =
      (this.product.canvas.y1 - this.product.canvas.y0) /
      (this.product.canvas.x1 - this.product.canvas.x0);

    this.positionRatioY = this.product.canvas.y0 / this.product.height;
    this.positionRatioX = this.product.canvas.x0 / this.product.width;

    this.canvasHeight = Math.round(
      this.productImg.clientHeight / this.prodCanvasRatio
    );
    this.canvasWidth = Math.round(this.canvasHeight / this.canvasHWRatio);

    // LISTENERS
    this.productImg.onload = this.createCanvas.bind(this);
    window.onresize = this.resizeCanvas.bind(this);
    // SELECTION HANDLERS TO DISPLAY THE CONTROLLER FOR SELECTED TYPE
    this.canvas.on("selection:created", this.selectionHandler.bind(this));
    this.canvas.on("selection:updated", this.selectionHandler.bind(this));
    this.canvas.on("selection:cleared", this.removeController.bind(this));

    this.zoomSlider.addEventListener(
      "input",
      this.zoomSliderHandler.bind(this)
    );
    document.addEventListener("keydown", this.shortcutHandler.bind(this));

    //TEST
    const textBtn = document.getElementById("add-text");
    textBtn.addEventListener("click", this.createText.bind(this));
    const imgBtn = document.getElementById("add-img");
    imgBtn.addEventListener("click", this.createImg.bind(this));
    this.previewBtn.addEventListener("click", this.exportDesign.bind(this));
  }

  createCanvas() {
    fabric.Object.prototype.set({
      borderColor: "#7929DE",
      transparentCorners: false,
      cornerColor: "#7929DE",
      cornerStyle: "circle",
      cornerSize: 8,
    });

    this.canvas.setDimensions({
      height: this.canvasHeight,
      width: this.canvasWidth,
    });

    this.rotateController();
    this.deleteController();
    this.duplicateController();
    this.historyInit();
    this.canvas.historyInit();

    this.canvas.selectionBorderColor = "#7929DE";
    this.canvas.selectionColor = "#7b29de1e";
    this.style = document.createElement("style");
    document.body.append(this.style);
    this.style.innerText = `#mir-canvas-container-wrapper {
        height: ${this.canvasHeight}px;
        width: ${this.canvasWidth}px;
        top: ${this.productImg.clientHeight * this.positionRatioY}px;
        left: ${this.productImg.clientWidth * this.positionRatioX}px;
      }`;
    this.productImgInitialHeight = this.productImg.clientHeight;
  }

  resizeCanvas() {
    const imgHeight = document.getElementById("mir-product-img").clientHeight;
    this.canvasHeight = Math.round(imgHeight / this.prodCanvasRatio);
    this.canvasWidth = Math.round(this.canvasHeight / this.canvasHWRatio);

    const scale = this.canvasWidth / this.canvas.getWidth();
    const zoom = this.canvas.getZoom() * scale;
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    this.canvas.setDimensions({
      height: this.canvasHeight,
      width: this.canvasWidth,
    });

    this.style.innerText = `#mir-canvas-container-wrapper {
      height: ${this.canvasHeight}px;
      width: ${this.canvasWidth}px;
      top: ${this.productImg.clientHeight * this.positionRatioY}px;
      left: ${this.productImg.clientWidth * this.positionRatioX}px;
  }`;
  }

  selectionHandler() {
    this.removeController();
    this.activeObject = this.canvas.getActiveObject();
    if (this.canvas.getActiveObject().type === "text") {
      this.controller = new TextController(this.canvas);
    } else this.controller = new ImgController(this.canvas);
    console.log(this.activeObject);
  }

  removeController() {
    const controllerEl = document.getElementById("mir-controller-container");
    if (controllerEl) this.mainContainerWrapper.removeChild(controllerEl);

    const objectBtns = document.querySelectorAll(".mir-btn-container");
    objectBtns.forEach((node) => node.remove());
  }

  zoomSliderHandler(e) {
    this.zoomValue = e.target.value ?? 0;

    this.zoomSliderPercent.innerHTML = this.zoomValue + "%";

    this.productImg.height =
      this.mainContainer.clientHeight +
      (this.zoomValue * (this.productImg.height - this.canvas.height)) / 100;

    this.mainContainer.style.transform = `translateY(-${
      this.zoomValue * (this.canvasContainer.offsetTop / 100)
    }px)`;

    this.resizeCanvas();
  }

  createButton(id, icon) {
    const button = document.createElement("button");
    button.setAttribute("id", `mir-${id}-button`);
    button.setAttribute("class", "mir-button");
    button.innerHTML = icon;
  }

  deleteHandler() {
    this.canvas.remove(...this.canvas.getActiveObjects());
    this.canvas.discardActiveObject();
  }

  duplicateHandler() {
    this.copy();
    this.paste();
  }

  copy() {
    this.canvas.getActiveObject().clone((cloned) => {
      this.canvas._clipboard = cloned;
    });
  }

  paste() {
    this.canvas._clipboard.clone((clonedObj) => {
      this.canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        clonedObj.canvas = this.canvas;
        clonedObj.forEachObject((obj) => {
          this.canvas.add(obj);
        });

        clonedObj.setCoords();
      } else {
        this.canvas.add(clonedObj);
      }
      this.canvas._clipboard.top += 10;
      this.canvas._clipboard.left += 10;
      this.canvas.setActiveObject(clonedObj);
      this.canvas.requestRenderAll();
    });
  }

  shortcutHandler(e) {
    if (e.ctrlKey && e.code === "KeyC") this.copy();
    if (e.ctrlKey && e.code === "KeyV") this.paste();
    if (e.ctrlKey && e.code === "KeyZ") this.canvas.undo();
    if (e.code === "ArrowUp") this.activeObject.top--;
    if (e.code === "ArrowDown") this.activeObject.top++;
    if (e.code === "ArrowLeft") this.activeObject.left--;
    if (e.code === "ArrowRight") this.activeObject.left++;
    if (e.code === "Delete") this.deleteHandler();

    this.canvas.renderAll();
  }

  rotateController() {
    const rotateIcon = `data:image/svg+xml;utf8,${icons.rotate}`;
    const imgIcon = document.createElement("img");
    imgIcon.src =
      "data:image/png;base64,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";
    const props = {
      x: 0,
      y: -0.5,
      offsetX: -3,
      offsetY: -25,
      cursorStyle: "grab",
      cornerSize: 20,
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: "rotate",
      render: renderIcon,
      fill: "#fff",
      withConnection: false,
    };
    fabric.Object.prototype.controls.mtr = new fabric.Control(props);

    fabric.Textbox.prototype.controls.mtr = new fabric.Control(props);

    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = fabricObject.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(imgIcon, -size, -size, size * 3, size * 3);
      ctx.restore();
    }
  }

  deleteController() {
    const rotateIcon = `data:image/svg+xml;utf8,${icons.delete}`;
    const imgIcon = document.createElement("img");
    imgIcon.src = rotateIcon;
    const props = {
      x: 0,
      y: 0.5,
      offsetX: 10,
      offsetY: 20,
      cursorStyle: "pointer",
      mouseUpHandler: this.deleteHandler.bind(this),
      render: renderIcon,
      cornerSize: 30,
      withConnection: false,
    };
    fabric.Object.prototype.controls.deleteControl = new fabric.Control(props);

    fabric.Textbox.prototype.controls.deleteControl = new fabric.Control(props);

    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = fabricObject.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(imgIcon, -size, -size, size * 2, size * 2);
      ctx.restore();
    }
  }

  duplicateController() {
    const rotateIcon = `data:image/svg+xml;utf8,${icons.duplicate}`;
    const imgIcon = document.createElement("img");
    imgIcon.src = rotateIcon;
    const props = {
      x: 0,
      y: 0.5,
      offsetX: -10,
      offsetY: 20,
      cursorStyle: "pointer",
      mouseUpHandler: this.duplicateHandler.bind(this),
      render: renderIcon,
      cornerSize: 30,
      withConnection: false,
    };
    fabric.Object.prototype.controls.duplicateControl = new fabric.Control(
      props
    );

    fabric.Textbox.prototype.controls.duplicateControl = new fabric.Control(
      props
    );

    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = fabricObject.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(imgIcon, -size, -size, size * 2, size * 2);
      ctx.restore();
    }
  }

  historyInit() {
    fabric.Canvas.prototype.historyNext = function () {
      return JSON.stringify(this.toDatalessJSON());
    };

    fabric.Canvas.prototype.historyInit = function () {
      this.historyUndo = [];
      this.historyNextState = this.historyNext();
      this.on({
        "object:added": this.historySaveAction,
        "object:removed": this.historySaveAction,
        "object:modified": this.historySaveAction,
      });
    };

    fabric.Canvas.prototype.historySaveAction = function () {
      if (this.historyProcessing) return;
      const json = this.historyNextState;
      this.historyUndo.push(json);
      if (this.historyUndo.length > 40) this.historyUndo.shift();
      this.historyNextState = this.historyNext();
    };

    fabric.Canvas.prototype.undo = function () {
      this.historyProcessing = true;
      const history = this.historyUndo.pop();
      if (history) {
        this.loadFromJSON(history, () => {
          this.renderAll();
          this.historyProcessing = false;
        });
      } else {
        this.historyProcessing = false;
      }
    };
  }

  async exportDesign() {
    // clear borders and controll before screenshot
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    this.canvasContainer.style.border = "none";

    // set zoom to 0 to get all the image
    const zoom = this.zoomValue;
    this.zoomSliderHandler({ target: { value: 0 } });
    await new Promise((res) => setTimeout(res, 1000));
    const print = await html2canvas(this.mainContainer);
    this.canvasContainer.style.border = "2px dashed #ccc";
    this.zoomSliderHandler({ target: { value: zoom } });
    const link = document.createElement("a");
    link.download = "mirket.png";
    link.href = print.toDataURL("image/png");
    link.click();
    this.canvas.setActiveObject(this.activeObject);
    this.canvas.renderAll();
  }

  //CREATE IMG OBJECT
  createImg() {
    const img = new window.fabric.Image.fromURL(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2048px-Instagram_logo_2022.svg.png",
      function (img) {
        img.scaleToHeight(100);
        // img.setControlsVisibility({ mtr: false })
        this.canvas.centerObject(img);
        this.canvas.add(img);
      }.bind(this)
    );
  }

  // CREATE TEXT OBJECT
  createText() {
    const text = new window.fabric.Text("text");
    this.canvas.add(text);
  }
}
