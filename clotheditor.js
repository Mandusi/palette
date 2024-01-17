export default class ClothEditor {
  constructor(root, product) {
    this.root = root
    this.product = product

    // MAIN DIV ELEMENT
    this.mainContainer = document.createElement('div')
    this.mainContainer.setAttribute('id', 'main-container')
    this.mainContainerWrapper = document.createElement('div')
    this.mainContainerWrapper.setAttribute('id', 'main-container-wrapper')
    this.root.append(this.mainContainerWrapper)
    this.mainContainerWrapper.append(this.mainContainer)

    // PRODUCT IMAGE ELEMENT
    this.productImg = document.createElement('img')
    this.productImg.setAttribute('src', this.product.src)
    this.productImg.setAttribute('id', 'product-img')
    this.mainContainer.append(this.productImg)

    // RATIOS
    this.prodCanvasRatio =
      this.product.height / (this.product.canvas.y1 - this.product.canvas.y0)

    this.canvasHWRatio =
      (this.product.canvas.y1 - this.product.canvas.y0) /
      (this.product.canvas.x1 - this.product.canvas.x0)

    this.positionRatioY = this.product.canvas.y0 / this.product.height
    this.positionRatioX = this.product.canvas.x0 / this.product.width

    // CREATE CANVAS ELEMENT
    this.canvasContainer = document.createElement('div')
    this.canvasContainer.setAttribute('id', 'canvas-container-wrapper')
    this.canvasEl = document.createElement('canvas')
    this.canvasContainer.append(this.canvasEl)
    this.mainContainer.append(this.canvasContainer)

    this.canvasHeight = this.productImg.clientHeight / this.prodCanvasRatio
    this.canvasWidth = this.canvasHeight / this.canvasHWRatio

    // INITIALIZE FABRIC CANVAS
    this.productImg.onload = this.createCanvas.bind(this)
    window.onresize = this.resizeCanvas.bind(this)
  }

  createCanvas() {
    this.canvas = new window.fabric.Canvas(this.canvasEl)
    this.canvas.setDimensions({
      height: this.canvasHeight,
      width: this.canvasWidth,
    })

    this.style = document.createElement('style')
    document.body.append(this.style)
    this.style.innerText = `#canvas-container-wrapper {
        height: ${this.canvasHeight}px;
        width: ${this.canvasWidth}px;
        top: ${this.productImg.clientHeight * this.positionRatioY}px;
        left: ${this.productImg.clientWidth * this.positionRatioX}px;
      }`

    const text = new window.fabric.Text('text')
    this.canvas.add(text)
  }
  resizeCanvas() {
    const imgHeight = document.getElementById('product-img').clientHeight
    this.canvasHeight = imgHeight / this.prodCanvasRatio
    this.canvasWidth = this.canvasHeight / this.canvasHWRatio

    const scale = this.canvasWidth / this.canvas.getWidth()
    const zoom = this.canvas.getZoom() * scale
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    this.canvas.setDimensions({
      height: this.canvasHeight,
      width: this.canvasWidth,
    })

    this.style.innerText = `#canvas-container-wrapper {
      height: ${this.canvasHeight}px;
      width: ${this.canvasWidth}px;
      top: ${this.productImg.clientHeight * this.positionRatioY}px;
      left: ${this.productImg.clientWidth * this.positionRatio}px;
  }`
  }
}
