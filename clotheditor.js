import TextController from './TextController.js'
import ImgController from './ImgController.js'
import { icons } from './svgIcons.js'

export default class ClothEditor {
  constructor(root, product) {
    this.root = root
    this.product = product

    // MAIN DIV ELEMENT
    this.mainContainerWrapper = document.createElement('div')
    this.mainContainerWrapper.setAttribute('id', 'mir-main-container-wrapper')
    this.root.append(this.mainContainerWrapper)

    this.mainContainer = document.createElement('div')
    this.mainContainer.setAttribute('id', 'mir-main-container')
    this.mainContainerWrapper.append(this.mainContainer)

    // PRODUCT IMAGE ELEMENT
    this.productImg = document.createElement('img')
    this.productImg.setAttribute('src', this.product.src)
    this.productImg.setAttribute('id', 'mir-product-img')
    this.mainContainer.append(this.productImg)

    // CREATE CANVAS ELEMENT
    this.canvasContainer = document.createElement('div')
    this.canvasContainer.setAttribute('id', 'mir-canvas-container-wrapper')
    this.mainContainer.append(this.canvasContainer)
    this.canvasEl = document.createElement('canvas')
    this.canvasContainer.append(this.canvasEl)

    // RATIOS
    this.prodCanvasRatio =
      this.product.height / (this.product.canvas.y1 - this.product.canvas.y0)

    this.canvasHWRatio =
      (this.product.canvas.y1 - this.product.canvas.y0) /
      (this.product.canvas.x1 - this.product.canvas.x0)

    this.positionRatioY = this.product.canvas.y0 / this.product.height
    this.positionRatioX = this.product.canvas.x0 / this.product.width

    this.canvasHeight = Math.round(
      this.productImg.clientHeight / this.prodCanvasRatio
    )
    this.canvasWidth = Math.round(this.canvasHeight / this.canvasHWRatio)

    // INITIALIZE FABRIC CANVAS
    this.canvas = new window.fabric.Canvas(this.canvasEl, {
      selectionBorderColor: '#7929DE',
      color: '#7929DE',
    })

    // CREATE ZOOMSLIDER
    this.zoomSliderContainer = document.createElement('div')
    this.zoomSliderContainer.setAttribute('id', 'mir-zoomslider-container')
    this.zoomSlider = document.createElement('input')
    this.zoomSlider.setAttribute('type', 'range')
    this.zoomSlider.setAttribute('id', 'mir-zoomslider')
    this.zoomSlider.value = 0
    this.zoomSliderPercent = document.createElement('h3')
    this.zoomSliderPercent.innerHTML = '0%'
    this.zoomSliderContainer.append(this.zoomSlider, this.zoomSliderPercent)
    this.mainContainerWrapper.append(this.zoomSliderContainer)

    this.productImg.onload = this.createCanvas.bind(this)
    window.onresize = this.resizeCanvas.bind(this)
    // SELECTION HANDLERS TO DISPLAY THE CONTROLLER FOR SELECTED TYPE
    this.canvas.on('selection:created', this.selectionHandler.bind(this))
    this.canvas.on('selection:updated', this.selectionHandler.bind(this))
    this.canvas.on('selection:cleared', this.removeController.bind(this))

    this.zoomSlider.addEventListener('input', this.zoomSliderHandler.bind(this))
    document.addEventListener('keydown', this.shortcutHandler.bind(this))
  }

  createCanvas() {
    fabric.Object.prototype.set({
      borderColor: '#7929DE',
      transparentCorners: false,
      cornerColor: '#7929DE',
      cornerStyle: 'circle',
      cornerSize: 8,
    })

    this.rotateController()
    this.deleteController()
    this.duplicateController()
    this.canvas.setDimensions({
      height: this.canvasHeight,
      width: this.canvasWidth,
    })

    this.style = document.createElement('style')
    document.body.append(this.style)
    this.style.innerText = `#mir-canvas-container-wrapper {
        height: ${this.canvasHeight}px;
        width: ${this.canvasWidth}px;
        top: ${this.productImg.clientHeight * this.positionRatioY}px;
        left: ${this.productImg.clientWidth * this.positionRatioX}px;
      }`
    this.productImgInitialHeight = this.productImg.clientHeight

    this.createImg()
    this.createText()
  }

  resizeCanvas() {
    const imgHeight = document.getElementById('mir-product-img').clientHeight
    this.canvasHeight = Math.round(imgHeight / this.prodCanvasRatio)
    this.canvasWidth = Math.round(this.canvasHeight / this.canvasHWRatio)

    const scale = this.canvasWidth / this.canvas.getWidth()
    const zoom = this.canvas.getZoom() * scale
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    this.canvas.setDimensions({
      height: this.canvasHeight,
      width: this.canvasWidth,
    })

    this.style.innerText = `#mir-canvas-container-wrapper {
      height: ${this.canvasHeight}px;
      width: ${this.canvasWidth}px;
      top: ${this.productImg.clientHeight * this.positionRatioY}px;
      left: ${this.productImg.clientWidth * this.positionRatioX}px;
  }`
  }

  selectionHandler() {
    this.removeController()
    this.activeObject = this.canvas.getActiveObject()

    if (this.canvas.getActiveObject().type === 'textbox') {
      this.controller = new TextController(this.canvas)
    } else this.controller = new ImgController(this.canvas)
  }

  removeController() {
    const controllerEl = document.getElementById('mir-controller-container')
    if (controllerEl) this.mainContainerWrapper.removeChild(controllerEl)

    const objectBtns = document.querySelectorAll('.mir-btn-container')
    objectBtns.forEach((node) => node.remove())
  }

  zoomSliderHandler(e) {
    this.zoomValue = e.target.value

    this.zoomSliderPercent.innerHTML = this.zoomValue + '%'

    this.productImg.height =
      this.mainContainer.clientHeight +
      (this.zoomValue * (this.productImg.height - this.canvas.height)) / 100

    this.mainContainer.style.transform = `translateY(-${
      this.zoomValue * (this.canvasContainer.offsetTop / 100)
    }px)`

    this.resizeCanvas()
    this.setBtnPositions()
  }

  createButton(id, icon) {
    const button = document.createElement('button')
    button.setAttribute('id', `mir-${id}-button`)
    button.setAttribute('class', 'mir-button')
    button.innerHTML = icon
  }

  deleteHandler() {
    this.canvas.remove(...this.canvas.getActiveObjects())
    this.canvas.discardActiveObject()
  }

  duplicateHandler() {
    this.copy()
    this.paste()
  }

  copy() {
    this.canvas.getActiveObject().clone((cloned) => {
      this.canvas._clipboard = cloned
    })
  }

  paste() {
    this.canvas._clipboard.clone((clonedObj) => {
      this.canvas.discardActiveObject()
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      })
      if (clonedObj.type === 'activeSelection') {
        clonedObj.canvas = this.canvas
        clonedObj.forEachObject((obj) => {
          this.canvas.add(obj)
        })

        clonedObj.setCoords()
      } else {
        this.canvas.add(clonedObj)
      }
      this.canvas._clipboard.top += 10
      this.canvas._clipboard.left += 10
      this.canvas.setActiveObject(clonedObj)
      this.canvas.requestRenderAll()
    })
  }

  shortcutHandler(e) {
    // if (e.code === 'ArrowUp') {
    //   this.activeObject.top++
    //   this.canvas.renderAll()
    // } else if (e.code === 'ArrowDown') console.log('down')

    switch (e.code) {
      case 'ArrowUp':
        this.activeObject.top--
        break
      case 'ArrowDown':
        this.activeObject.top++
        break
      case 'ArrowLeft':
        this.activeObject.left--
        break
      case 'ArrowRight':
        this.activeObject.left++
        break
        case '':
          this.activeObject.top++
          break
    }
    this.canvas.renderAll()
  }

  rotateController() {
    // ROTATE BUTTON
    const rotateIcon = `data:image/svg+xml;utf8,${icons.rotate}`
    const imgIcon = document.createElement('img')
    imgIcon.src = rotateIcon

    fabric.Object.prototype.controls.mtr = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 0,
      offsetY: -20,
      cursorStyle: 'crosshair',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      render: renderIcon,
      fill: '#fff',
      withConnection: false,
    })

    // Defining how the rendering action will be
    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = fabricObject.cornerSize
      ctx.save()
      ctx.translate(left, top)
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
      ctx.drawImage(imgIcon, -size, -size, size * 2, size * 2)
      ctx.restore()
    }
  }

  deleteController() {
    const rotateIcon = `data:image/svg+xml;utf8,${icons.delete}`
    const imgIcon = document.createElement('img')
    imgIcon.src = rotateIcon

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0,
      y: 0.5,
      offsetX: 10,
      offsetY: 20,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteHandler.bind(this),
      render: renderIcon,
      cornerSize: 30,
      withConnection: false,
    })

    // Defining how the rendering action will be
    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = fabricObject.cornerSize
      ctx.save()
      ctx.translate(left, top)
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
      ctx.drawImage(imgIcon, -size, -size, size * 2, size * 2)
      ctx.restore()
    }
  }

  duplicateController() {
    const rotateIcon = `data:image/svg+xml;utf8,${icons.duplicate}`
    const imgIcon = document.createElement('img')
    imgIcon.src = rotateIcon

    fabric.Object.prototype.controls.duplicateControl = new fabric.Control({
      x: 0,
      y: 0.5,
      offsetX: -10,
      offsetY: 20,
      cursorStyle: 'pointer',
      mouseUpHandler: this.duplicateHandler.bind(this),
      render: renderIcon,
      cornerSize: 30,
      withConnection: false,
    })

    // Defining how the rendering action will be
    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = fabricObject.cornerSize
      ctx.save()
      ctx.translate(left, top)
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
      ctx.drawImage(imgIcon, -size, -size, size * 2, size * 2)
      ctx.restore()
    }
  }

  //CREATE IMG OBJECT
  createImg() {
    const img = new window.fabric.Image.fromURL(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2048px-Instagram_logo_2022.svg.png',
      function (img) {
        img.scaleToHeight(100)
        // img.setControlsVisibility({ mtr: false })
        this.canvas.centerObject(img)
        this.canvas.add(img)
      }.bind(this)
    )
  }

  // CREATE TEXT OBJECT
  createText() {
    const text = new window.fabric.Text('selmam <3')
    this.canvas.add(text)
  }
}
