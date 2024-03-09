import { icons } from './svgIcons.js'

export default class ImgController {
  constructor(canvas) {
    this.canvas = canvas

    this.textControllerContainer = document.createElement('div')
    this.textControllerContainer.setAttribute('id', 'mir-controller-container')
    const mainContainerWrapper = document.getElementById(
      'mir-main-container-wrapper'
    )
    mainContainerWrapper.append(this.textControllerContainer)

    this.btnFlipX = this.createButton('flip-horizontal', icons.flipHorizontal)
    this.btnFlipY = this.createButton('flip-vertical', icons.flipVertical)
    this.btnLayerDown = this.createButton('layer-down', icons.layerDown)
    this.btnLayerUp = this.createButton('layer-up', icons.layerUp)
    this.btnCenterY = this.createButton(
      'center-horizontal',
      icons.centerHorizantal
    )
    this.btnCenterX = this.createButton('center-vertical', icons.centerVertical)

    this.btnFlipX.addEventListener('click', () => this.btnHandler('flipX'))
    this.btnFlipY.addEventListener('click', () => this.btnHandler('flipY'))
    this.btnCenterX.addEventListener('click', () => this.btnHandler('centerX'))
    this.btnCenterY.addEventListener('click', () => this.btnHandler('centerY'))
    this.btnLayerDown.addEventListener('click', () =>
      this.btnHandler('layerDown')
    )
    this.btnLayerUp.addEventListener('click', () => this.btnHandler('layerUp'))
  }
  createButton(id, icon) {
    this.button = document.createElement('button')
    this.button.setAttribute('class', 'mir-button')
    this.button.setAttribute('id', `mir-${id}-btn`)
    this.button.innerHTML = icon
    this.textControllerContainer.append(this.button)
    this.activeBtnHandler()
    return this.button
  }

  activeBtnHandler() {
    const object = this.canvas.getActiveObject()

    function isActive(btn, active) {
      btn
        ?.querySelectorAll('path')
        .forEach((path) =>
          path.setAttribute('stroke', active ? '#7929DE' : 'black')
        )
    }

    isActive(this.btnFlipX, object.flipX === true)
    isActive(this.btnFlipY, object.flipY === true)
  }

  btnHandler(action) {
    const object = this.canvas.getActiveObject()

    switch (action) {
      case 'flipX':
        object.flipX = object.flipX === true ? false : true
        break

      case 'flipY':
        object.flipY = object.flipY === true ? false : true
        break

      case 'layerDown':
        this.canvas.sendToBack(object)
        break

      case 'layerUp':
        this.canvas.bringToFront(object)
        break

      case 'centerX':
        object.centerH()
        break

      case 'centerY':
        object.centerV()
        break
    }
    this.canvas.historySaveAction()
    this.canvas.renderAll()
    this.activeBtnHandler()
  }
}
