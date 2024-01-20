import { icons } from './svgIcons.js'

export default class TextController {
  constructor(canvas) {
    this.canvas = canvas
    this.textControllerContainer = document.createElement('div')
    this.textControllerContainer.setAttribute('id', 'controller-container')
    const mainContainerWrapper = document.getElementById(
      'main-container-wrapper'
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
    this.btnFlipHor = this.createButton('flip-horizontal', icons.flipHorizontal)
    this.btnFlipVer = this.createButton('flip-vertical', icons.flipVertical)

    // BUTTON HANDLERS
    this.btnAlign.addEventListener('click', () => this.editText('align'))
    this.btnBold.addEventListener('click', () => this.editText('bold'))
    this.btnItalic.addEventListener('click', () => this.editText('italic'))
    this.btnUnderline.addEventListener('click', () =>
      this.editText('underline')
    )
    this.btnStrike.addEventListener('click', () => this.editText('strike'))
    this.btnFlipHor.addEventListener('click', () => this.editText('flipX'))
    this.btnFlipVer.addEventListener('click', () => this.editText('flipY'))
  }

  createButton(id, icon) {
    const button = document.createElement('button')
    button.setAttribute('class', 'button')
    button.setAttribute('id', `${id}-btn`)
    button.innerHTML = icon
    this.textControllerContainer.append(button)
    return button
  }

  editText(action) {
    const text = this.canvas.getActiveObject()

    switch (action) {
      case 'italic':
        const isItalic = this.getStyle(text, 'fontStyle') === 'italic'
        this.setStyle(text, 'fontStyle', isItalic ? 'normal' : 'italic')
        break

      case 'bold':
        const isBold = this.getStyle(text, 'fontWeight') === 'bold'
        this.setStyle(text, 'fontWeight', isBold ? 'normal' : 'bold')
        break

      case 'underline':
        const isUnderline = this.getStyle(text, 'underline') === true
        this.setStyle(text, 'underline', isUnderline ? false : true)
        break

      case 'strike':
        const isStrike = this.getStyle(text, 'linethrough') === true
        this.setStyle(text, 'linethrough', isStrike ? false : true)
        break

      case 'flipX':
        text.flipX = text.flipX === true ? false : true
        this.canvas.renderAll()
        break

      case 'flipY':
        text.flipY = text.flipY === true ? false : true
        this.canvas.renderAll()
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
        this.canvas.renderAll()
        break
    }
  }

  getStyle(object, styleName) {
    return object[styleName]
  }

  setStyle(object, styleName, value) {
    object.set(styleName, value)
    this.canvas.renderAll()
  }
}
