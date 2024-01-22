import { icons } from './svgIcons.js'

export default class TextController {
  constructor(canvas) {
    this.canvas = canvas
    this.textControllerContainer = document.createElement('div')
    this.textControllerContainer.setAttribute('id', 'mir-controller-container')
    const mainContainerWrapper = document.getElementById(
      'mir-main-container-wrapper'
    )
    mainContainerWrapper.append(this.textControllerContainer)

    // this.fontSizePicker = document.createDropDown()

    // CREATE BUTTONS
    this.btnBaseline = this.createButton('baseline', icons.baseline)
    this.btnHighlighter = this.createButton('highlighter', icons.highlighter)
    this.btnAlign = this.createButton('align-left', icons.alignleft)
    this.btnBold = this.createButton('bold', icons.bold)
    this.btnItalic = this.createButton('italic', icons.italic)
    this.btnUnderline = this.createButton('underline', icons.underline)
    this.btnStrike = this.createButton('strikethrough', icons.strikethrough)
    this.btnFlipX = this.createButton('flip-horizontal', icons.flipHorizontal)
    this.btnFlipY = this.createButton('flip-vertical', icons.flipVertical)
    this.btnLayerDown = this.createButton('layer-down', icons.layerDown)
    this.btnLayerUp = this.createButton('layer-up', icons.layerUp)
    this.btnCenterY = this.createButton(
      'center-horizontal',
      icons.centerHorizantal
    )
    this.btnCenterX = this.createButton('center-vertical', icons.centerVertical)

    // BUTTON HANDLERS
    this.btnAlign.addEventListener('click', () => this.editText('align'))
    this.btnBold.addEventListener('click', () => this.editText('bold'))
    this.btnItalic.addEventListener('click', () => this.editText('italic'))
    this.btnUnderline.addEventListener('click', () =>
      this.editText('underline')
    )
    this.btnStrike.addEventListener('click', () => this.editText('strike'))
    this.btnFlipX.addEventListener('click', () => this.editText('flipX'))
    this.btnFlipY.addEventListener('click', () => this.editText('flipY'))
    this.btnCenterX.addEventListener('click', () => this.editText('centerX'))
    this.btnCenterY.addEventListener('click', () => this.editText('centerY'))
    this.btnLayerDown.addEventListener('click', () =>
      this.editText('layerDown')
    )
    this.btnLayerUp.addEventListener('click', () => this.editText('layerUp'))

    // this.colorPicker = new window.iro.ColorPicker('#mir-main-container')
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

  editText(action) {
    const text = this.canvas.getActiveObject()

    switch (action) {
      case 'italic':
        const isItalic = text.fontStyle === 'italic'
        text.set('fontStyle', isItalic ? 'normal' : 'italic')
        break

      case 'bold':
        const isBold = text.fontWeight === 'bold'
        text.set('fontWeight', isBold ? 'normal' : 'bold')
        break

      case 'underline':
        const isUnderline = text.underline === true
        text.set('underline', isUnderline ? false : true)
        break

      case 'strike':
        const isStrike = text.linethrough === true
        text.set('linethrough', isStrike ? false : true)
        break

      case 'flipX':
        text.flipX = text.flipX === true ? false : true
        break

      case 'flipY':
        text.flipY = text.flipY === true ? false : true
        break

      case 'layerDown':
        this.canvas.sendToBack(text)
        break

      case 'layerUp':
        this.canvas.bringToFront(text)
        break

      case 'centerX':
        text.centerH()
        break

      case 'centerY':
        text.centerV()
        break

      case 'align':
        switch (text.textAlign) {
          case 'left':
            text.textAlign = 'center'
            this.btnAlign.innerHTML = icons.aligncenter
            break

          case 'center':
            text.textAlign = 'right'
            this.btnAlign.innerHTML = icons.alignright
            break

          case 'right':
            text.textAlign = 'left'
            this.btnAlign.innerHTML = icons.alignleft
            break
        }
        break
    }
    this.canvas.renderAll()
    this.activeBtnHandler()
  }

  activeBtnHandler() {
    const text = this.canvas.getActiveObject()

    function isActive(btn, active) {
      btn
        ?.querySelectorAll('path')
        .forEach((path) =>
          path.setAttribute('stroke', active ? '#7929DE' : 'black')
        )
    }

    isActive(this.btnBold, text.fontWeight === 'bold')
    isActive(this.btnItalic, text.fontStyle === 'italic')
    isActive(this.btnUnderline, text.underline === true)
    isActive(this.btnStrike, text.linethrough === true)
    isActive(this.btnFlipX, text.flipX === true)
    isActive(this.btnFlipY, text.flipY === true)
  }
}
