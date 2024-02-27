import TextController from './TextController.js'
import ImgController from './ImgController.js'

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
    this.productImg.onload = this.createCanvas.bind(this)
    window.onresize = this.resizeCanvas.bind(this)

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
    // SELECTION HANDLERS TO DISPLAY THE CONTROLLER FOR SELECTED TYPE
    this.canvas.on('selection:created', this.selectionHandler.bind(this))
    this.canvas.on('selection:updated', this.selectionHandler.bind(this))
    this.canvas.on('selection:cleared', this.removeController.bind(this))

    this.zoomSlider.addEventListener('input', this.zoomSliderHandler.bind(this))
  }

  createCanvas() {
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

    // CREATE TEXT OBJECT
    const text = new window.fabric.Textbox('selmam <3')
    text.set({
      fill: 'rgb(230,49,59)',
      borderColor: '#7929DE',
      transparentCorners: false,
      cornerColor: '#7929DE',
      cornerStyle: 'circle',
      cornerSize: 10,
    })
    this.canvas.add(text)

    //CREATE IMG OBJECT
    const img = new window.fabric.Image.fromURL(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2048px-Instagram_logo_2022.svg.png',
      function (img) {
        img.scaleToHeight(50)
        this.canvas.centerObject(img)
        this.canvas.add(img)
        img.cornerColor = '#DDD'
      }.bind(this)
    )
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
    if (this.canvas.getActiveObject().type === 'textbox') {
      this.controller = new TextController(this.canvas)
    } else this.controller = new ImgController(this.canvas)
  }
  n

  removeController() {
    const controllerEl = document.getElementById('mir-controller-container')
    if (controllerEl) this.mainContainerWrapper.removeChild(controllerEl)
  }

  zoomSliderHandler(e) {
    const value = e.target.value

    this.zoomSliderPercent.innerHTML = value + '%'

    this.productImg.height =
      this.mainContainer.clientHeight +
      (value * (this.productImg.height - this.canvas.height)) / 100

    this.mainContainer.style.transform = `translateY(-${
      value * (this.canvasContainer.offsetTop / 100)
    }px)`

    this.resizeCanvas()
  }
}
