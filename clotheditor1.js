import TextController from "./TextController.js";
import ImgController from "./ImgController.js";
import { icons } from "./svgIcons.js";

export default class ClothEditor {
  constructor(root, product) {
    this.root = root;
    this.product = product;
    this.zoomValue = 0;
    this.activeObject = null;

    // ROOT STRUCTURE
    this.mainContainerWrapper = this.createEl(
      "div",
      "mir-main-container-wrapper",
      this.root
    );
    this.mainContainer = this.createEl(
      "div",
      "mir-main-container",
      this.mainContainerWrapper
    );

    // PRODUCT IMAGE
    this.productImg = this.createEl(
      "img",
      "mir-product-img",
      this.mainContainer
    );
    this.productImg.src = this.product.src;

    // CANVAS
    this.canvasContainer = this.createEl(
      "div",
      "mir-canvas-container-wrapper",
      this.mainContainer
    );
    this.canvasEl = this.createEl("canvas", null, this.canvasContainer);
    this.canvas = new window.fabric.Canvas(this.canvasEl);

    // ZOOM SLIDER
    this.zoomSliderContainer = this.createEl(
      "div",
      "mir-zoomslider-container",
      this.mainContainerWrapper
    );
    this.zoomSlider = this.createEl(
      "input",
      "mir-zoomslider",
      this.zoomSliderContainer
    );
    this.zoomSlider.type = "range";
    this.zoomSlider.value = 0;
    this.zoomSliderPercent = this.createEl(
      "h3",
      null,
      this.zoomSliderContainer
    );
    this.zoomSliderPercent.textContent = "0%";

    // PREVIEW BUTTON
    this.previewBtn = this.createBtn(
      "preview-btn",
      `${icons.preview} Preview`,
      this.mainContainerWrapper
    );

    // EVENTS
    this.productImg.onload = this.createCanvas.bind(this);
    window.addEventListener(
      "resize",
      this.debounce(this.resizeCanvas.bind(this), 150)
    );

    // Selection handlers
    this.canvas.on("selection:created", this.selectionHandler.bind(this));
    this.canvas.on("selection:updated", this.selectionHandler.bind(this));
    this.canvas.on("selection:cleared", this.removeController.bind(this));

    // UI events
    this.zoomSlider.addEventListener(
      "input",
      this.zoomSliderHandler.bind(this)
    );
    document.addEventListener(
      "keydown",
      this.throttle(this.shortcutHandler.bind(this), 30)
    );

    // TEST BUTTONS (optional)
    document
      .getElementById("add-text")
      ?.addEventListener("click", this.createText.bind(this));
    document
      .getElementById("add-img")
      ?.addEventListener("click", this.createImg.bind(this));
    this.previewBtn.addEventListener("click", this.exportDesign.bind(this));
  }

  /** ===================== UTILS ===================== */
  createEl(tag, id, parent) {
    const el = document.createElement(tag);
    if (id) el.setAttribute("id", id);
    if (parent) parent.append(el);
    return el;
  }

  createBtn(id, html, parent) {
    const btn = document.createElement("button");
    btn.setAttribute("id", id);
    btn.setAttribute("class", "mir-button");
    btn.innerHTML = html;
    parent.append(btn);
    return btn;
  }

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  throttle(fn, limit) {
    let waiting = false;
    return (...args) => {
      if (!waiting) {
        fn.apply(this, args);
        waiting = true;
        setTimeout(() => (waiting = false), limit);
      }
    };
  }

  getScale() {
    // Display scale relative to original product pixel size
    const displayW =
      this.productImg.clientWidth || this.productImg.naturalWidth;
    const displayH =
      this.productImg.clientHeight || this.productImg.naturalHeight;
    return {
      scaleX: displayW / this.product.width,
      scaleY: displayH / this.product.height,
    };
  }

  calcCanvasSize() {
    const { scaleX, scaleY } = this.getScale();
    const canvasW = Math.round(
      (this.product.canvas.x1 - this.product.canvas.x0) * scaleX
    );
    const canvasH = Math.round(
      (this.product.canvas.y1 - this.product.canvas.y0) * scaleY
    );
    return { canvasW, canvasH };
  }

  /** ============== INITIAL CANVAS SETUP ============== */
  createCanvas() {
    // Fabric defaults
    fabric.Object.prototype.set({
      borderColor: "#7929DE",
      transparentCorners: false,
      cornerColor: "#7929DE",
      cornerStyle: "circle",
      cornerSize: 8,
    });

    // Compute initial size *after* image has loaded
    const { canvasW, canvasH } = this.calcCanvasSize();
    this.canvas.setDimensions({ height: canvasH, width: canvasW });
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    // Controllers & history
    this.initControllers();
    this.historyInit();
    this.canvas.historyInit();

    this.canvas.selectionBorderColor = "#7929DE";
    this.canvas.selectionColor = "#7b29de1e";

    // Position the overlay container using a dynamic <style>
    this.style = document.createElement("style");
    document.body.append(this.style);
    this.updateCanvasStyle();

    // Keep reference for zooming
    this.productImgInitialHeight = this.productImg.clientHeight;
  }

  updateCanvasStyle() {
    const { scaleX, scaleY } = this.getScale();
    const { canvasW, canvasH } = this.calcCanvasSize();
    const top = Math.round(this.product.canvas.y0 * scaleY);
    const left = Math.round(this.product.canvas.x0 * scaleX);

    this.style.innerText = `#mir-canvas-container-wrapper {
      position: absolute;
      height: ${canvasH}px;
      width: ${canvasW}px;
      top: ${top}px;
      left: ${left}px;
    }`;
  }

  resizeCanvas() {
    const { canvasW, canvasH } = this.calcCanvasSize();

    // Scale zoom to keep objects visually aligned to new canvas size
    const prevW = this.canvas.getWidth() || 1;
    const scale = canvasW / prevW;
    const newZoom = this.canvas.getZoom() * scale;

    this.canvas.setViewportTransform([newZoom, 0, 0, newZoom, 0, 0]);
    this.canvas.setDimensions({ height: canvasH, width: canvasW });
    this.updateCanvasStyle();
  }

  /** =================== CONTROLLERS =================== */
  initControllers() {
    this.createControl("mtr", icons.rotate, {
      x: 0,
      y: -0.5,
      offsetX: -3,
      offsetY: -25,
      cursorStyle: "grab",
      cornerSize: 20,
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: "rotate",
    });

    this.createControl("deleteControl", icons.delete, {
      x: 0,
      y: 0.5,
      offsetX: 10,
      offsetY: 20,
      cursorStyle: "pointer",
      cornerSize: 30,
      mouseUpHandler: this.deleteHandler.bind(this),
    });

    this.createControl("duplicateControl", icons.duplicate, {
      x: 0,
      y: 0.5,
      offsetX: -10,
      offsetY: 20,
      cursorStyle: "pointer",
      cornerSize: 30,
      mouseUpHandler: this.duplicateHandler.bind(this),
    });
  }

  createControl(name, icon, props) {
    const imgIcon = document.createElement("img");
    imgIcon.src = `data:image/svg+xml;utf8,${icon}`;
    const control = new fabric.Control({
      ...props,
      withConnection: false,
      render: (ctx, left, top, styleOverride, fabricObject) => {
        const size = fabricObject.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(imgIcon, -size, -size, size * 2, size * 2);
        ctx.restore();
      },
    });
    fabric.Object.prototype.controls[name] = control;
    fabric.Textbox.prototype.controls[name] = control;
  }

  /** ================ SELECTION HANDLERS ================ */
  selectionHandler() {
    this.removeController();
    this.activeObject = this.canvas.getActiveObject();
    if (!this.activeObject) return;

    this.controller =
      this.activeObject.type === "text"
        ? new TextController(this.canvas)
        : new ImgController(this.canvas);
  }

  removeController() {
    document.getElementById("mir-controller-container")?.remove();
    document
      .querySelectorAll(".mir-btn-container")
      .forEach((node) => node.remove());
  }

  /** ===================== SHORTCUTS ===================== */
  shortcutHandler(e) {
    // Common editor shortcuts
    if (
      e.ctrlKey &&
      (e.code === "KeyZ" ||
        e.code === "KeyY" ||
        e.code === "KeyC" ||
        e.code === "KeyV")
    ) {
      e.preventDefault();
    }

    if (e.ctrlKey && e.code === "KeyC") this.copy();
    if (e.ctrlKey && e.code === "KeyV") this.paste();
    if (e.ctrlKey && e.code === "KeyZ") this.canvas.undo();
    if (e.ctrlKey && e.code === "KeyY") this.canvas.redo();

    if (this.activeObject) {
      if (e.code === "ArrowUp") this.activeObject.top--;
      if (e.code === "ArrowDown") this.activeObject.top++;
      if (e.code === "ArrowLeft") this.activeObject.left--;
      if (e.code === "ArrowRight") this.activeObject.left++;
    }

    if (e.code === "Delete") this.deleteHandler();
    this.canvas.renderAll();
  }

  /** ======================== ZOOM ======================== */
  zoomSliderHandler(e) {
    this.zoomValue = Number(e.target.value ?? 0);
    this.zoomSlider.value = this.zoomValue;
    this.zoomSliderPercent.textContent = `${this.zoomValue}%`;

    const baseHeight =
      this.productImgInitialHeight ||
      this.productImg.clientHeight ||
      this.productImg.naturalHeight;
    this.productImg.style.height = `${
      baseHeight * (1 + this.zoomValue / 100)
    }px`;

    this.mainContainer.style.transform = `translateY(-${
      this.zoomValue * (this.canvasContainer.offsetTop / 100)
    }px)`;

    this.resizeCanvas();
  }

  /** =================== OBJECT ACTIONS =================== */
  deleteHandler() {
    const objs = this.canvas.getActiveObjects();
    if (!objs?.length) return;
    this.canvas.remove(...objs);
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  duplicateHandler() {
    const objs = this.canvas.getActiveObjects();
    if (!objs?.length) return;
    objs.forEach((obj) => {
      obj.clone((cloned) => {
        cloned.set({ left: obj.left + 20, top: obj.top + 20 });
        this.canvas.add(cloned);
      });
    });
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  copy() {
    const obj = this.canvas.getActiveObject();
    obj?.clone((cloned) => {
      this.canvas._clipboard = cloned;
    });
  }

  paste() {
    this.canvas._clipboard?.clone((clonedObj) => {
      this.canvas.discardActiveObject();
      clonedObj.set({
        left: (clonedObj.left || 0) + 10,
        top: (clonedObj.top || 0) + 10,
        evented: true,
      });

      if (clonedObj.type === "activeSelection") {
        clonedObj.canvas = this.canvas;
        clonedObj.forEachObject((obj) => this.canvas.add(obj));
        clonedObj.setCoords();
      } else {
        this.canvas.add(clonedObj);
      }

      this.canvas._clipboard.top = (this.canvas._clipboard.top || 0) + 10;
      this.canvas._clipboard.left = (this.canvas._clipboard.left || 0) + 10;
      this.canvas.setActiveObject(clonedObj);
      this.canvas.requestRenderAll();
    });
  }

  /** ======================= HISTORY ======================= */
  historyInit() {
    const MAX_UNDO = 50;

    fabric.Canvas.prototype.historyNext = function () {
      return JSON.stringify(this.toDatalessJSON());
    };

    fabric.Canvas.prototype.historyInit = function () {
      this.historyUndo = [];
      this.historyRedo = [];
      this.historyNextState = this.historyNext();
      this.on({
        "object:added": this.historySaveAction,
        "object:removed": this.historySaveAction,
        "object:modified": this.historySaveAction,
      });
    };

    fabric.Canvas.prototype.historySaveAction = function () {
      if (this.historyProcessing) return;
      this.historyUndo.push(this.historyNextState);
      if (this.historyUndo.length > MAX_UNDO) this.historyUndo.shift();
      this.historyNextState = this.historyNext();
      // New action invalidates redo stack
      this.historyRedo = [];
    };

    fabric.Canvas.prototype.undo = function () {
      if (!this.historyUndo?.length) return;
      this.historyProcessing = true;
      const prev = this.historyUndo.pop();
      // Save current for redo
      this.historyRedo.push(this.historyNextState);
      this.historyNextState = prev;
      this.loadFromJSON(prev, () => {
        this.renderAll();
        this.historyProcessing = false;
      });
    };

    fabric.Canvas.prototype.redo = function () {
      if (!this.historyRedo?.length) return;
      this.historyProcessing = true;
      const next = this.historyRedo.pop();
      // Save current for undo
      this.historyUndo.push(this.historyNextState);
      this.historyNextState = next;
      this.loadFromJSON(next, () => {
        this.renderAll();
        this.historyProcessing = false;
      });
    };
  }

  /** ======================== EXPORT ======================== */
  async exportDesign() {
    // Ensure libs exist
    if (typeof html2canvas !== "function") {
      console.error("html2canvas is required for exportDesign()");
      return;
    }

    // Clear selection & borders
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    const prevBorder = this.canvasContainer.style.border;
    this.canvasContainer.style.border = "none";

    // Zoom out to 0 for full frame capture
    const prevZoomVal = this.zoomValue;
    this.zoomSliderHandler({ target: { value: 0 } });
    await new Promise((res) => requestAnimationFrame(res));

    const print = await html2canvas(this.mainContainer);

    // Restore UI
    this.canvasContainer.style.border = prevBorder || "2px dashed #ccc";
    this.zoomSliderHandler({ target: { value: prevZoomVal } });

    // Download
    const link = document.createElement("a");
    link.download = "mirket.png";
    link.href = print.toDataURL("image/png");
    link.click();

    // Restore selection if any
    if (this.activeObject) this.canvas.setActiveObject(this.activeObject);
    this.canvas.renderAll();
  }

  /** ==================== CREATE OBJECTS ==================== */
  createImg() {
    // NOTE: fabric.Image.fromURL is a static helper — do not use `new`
    window.fabric.Image.fromURL(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2048px-Instagram_logo_2022.svg.png",
      (img) => {
        img.scaleToHeight(100);
        this.canvas.centerObject(img);
        this.canvas.add(img);
      }
    );
  }

  createText() {
    const text = new window.fabric.Text("text");
    this.canvas.add(text);
  }
}
