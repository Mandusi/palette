import { icons } from './svgIcons.js'

export default class TextController {
  constructor(canvas) {
    this.canvas = canvas
    this.mainContainerWrapper = document.getElementById(
      'mir-main-container-wrapper'
    )

    this.textControllerContainer = document.createElement('div')
    this.textControllerContainer.setAttribute('id', 'mir-controller-container')
    this.mainContainerWrapper.append(this.textControllerContainer)
    this.text = this.canvas.getActiveObject()

    // CREATE BUTTONS
    this.createDropDown()
    this.btnBaseline = this.createButton('baseline', icons.baseline)
    this.btnHighlight = this.createButton('highlight', icons.highlight)
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
    this.btnBaseline.addEventListener('click', (e) => {
      e.stopPropagation()
      this.editText('baseline')
    })
    this.btnHighlight.addEventListener('click', (e) => {
      e.stopPropagation()
      this.editText('highlight')
    })
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
    this.selectEl.addEventListener('change', this.fontSizeHandler.bind(this))
  }
  createButton(id, icon) {
    this.button = document.createElement('button')
    this.button.setAttribute('class', 'mir-button')
    this.button.setAttribute('id', `mir-${id}-btn`)
    this.button.innerHTML = icon
    if (id === 'baseline') {
      this.button
        .querySelectorAll('rect')
        .forEach((path) => path.setAttribute('fill', this.text.fill))
    }
    if (id === 'highlight') {
      this.button
        .querySelectorAll('rect')
        .forEach((path) =>
          path.setAttribute('fill', this.text.textBackgroudColor)
        )
    }
    this.textControllerContainer.append(this.button)
    this.activeBtnHandler()
    return this.button
  }

  createDropDown() {
    this.selectEl = document.createElement('select')
    this.selectEl.setAttribute('id', 'mir-font-size')
    const placeHolder = document.createElement('option')
    placeHolder.setAttribute('hidden', true)
    placeHolder.innerHTML = 'Size'
    this.selectEl.append(placeHolder)
    for (let index = 10; index < 73; index++) {
      const optionEl = document.createElement('option')
      optionEl.setAttribute('value', index)
      optionEl.innerHTML = index
      this.selectEl.append(optionEl)
    }
    this.textControllerContainer.append(this.selectEl)
  }

  addColorPicker(btn) {
    const popup = document.getElementById('mir-popup')
    if (popup) return

    this.Popup = document.createElement('div')
    this.Popup.setAttribute('id', 'mir-popup')
    this.mainContainerWrapper.append(this.Popup)

    const controller = document.getElementById('mir-controller-container')
    const left = controller.offsetLeft
    const top = controller.offsetTop
    this.styleColorPicker = document.createElement('style')
    document.body.append(this.styleColorPicker)
    this.styleColorPicker.innerText = `#mir-popup {
        top: ${top + 70}px;
        left: ${left}px;
      }`

    this.colorPicker = new iro.ColorPicker('#mir-popup', {
      color: this.text.fill,
      width: 190,
      borderColor: '#ccc',
      borderRadius: 7,
      padding: 5,
    })

    if (btn === 'baseline') {
      this.colorPicker.on('color:change', () => {
        this.text.set('fill', this.colorPicker.color.hexString)
        this.btnBaseline
          ?.querySelectorAll('rect')
          .forEach((path) =>
            path.setAttribute('fill', this.colorPicker.color.hexString)
          )

        this.canvas.renderAll()
      })
    }

    if (btn === 'highlight') {
      this.colorPicker.on('color:change', () => {
        this.text.set('textBackgroundColor', this.colorPicker.color.hexString)
        this.btnHighlight
          ?.querySelectorAll('rect')
          .forEach((path) =>
            path.setAttribute('fill', this.colorPicker.color.hexString)
          )
        this.canvas.historySaveAction()
        this.canvas.renderAll()
      })
    }

    this.Popup.addEventListener('click', (e) => e.stopPropagation())
    window.addEventListener('resize', this.positionColorPicker.bind(this))
    document.addEventListener('click', this.clearColorPicker.bind(this))
  }
  positionColorPicker() {
    const controller = document.getElementById('mir-controller-container')
    const left = controller.offsetLeft
    const top = controller.offsetTop
    this.styleColorPicker.innerText = `#mir-popup {
      top: ${top + 70}px;
      left: ${left}px;
    }`
  }

  fontSizeHandler(e) {
    this.text.fontSize = e.target.value
    this.canvas.renderAll()
  }

  clearColorPicker() {
    this.canvas.historySaveAction()
    this.Popup.remove()
    this.styleColorPicker.remove()
  }

  editText(action) {
    switch (action) {
      case 'baseline':
        this.addColorPicker('baseline')
        break

      case 'highlight':
        this.addColorPicker('highlight')
        break

      case 'italic':
        const isItalic = this.text.fontStyle === 'italic'
        this.text.set('fontStyle', isItalic ? 'normal' : 'italic')
        break

      case 'bold':
        const isBold = this.text.fontWeight === 'bold'
        this.text.set('fontWeight', isBold ? 'normal' : 'bold')
        break

      case 'underline':
        const isUnderline = this.text.underline === true
        this.text.set('underline', isUnderline ? false : true)
        break

      case 'strike':
        const isStrike = this.text.linethrough === true
        this.text.set('linethrough', isStrike ? false : true)
        break

      case 'flipX':
        this.text.flipX = this.text.flipX === true ? false : true
        break

      case 'flipY':
        this.text.flipY = this.text.flipY === true ? false : true
        break

      case 'layerDown':
        this.canvas.sendToBack(this.text)
        break

      case 'layerUp':
        this.canvas.bringToFront(this.text)
        break

      case 'centerX':
        this.text.centerH()
        break

      case 'centerY':
        this.text.centerV()
        break

      case 'align':
        switch (this.text.textAlign) {
          case 'left':
            this.text.textAlign = 'center'
            this.btnAlign.innerHTML = icons.aligncenter
            break

          case 'center':
            this.text.textAlign = 'right'
            this.btnAlign.innerHTML = icons.alignright
            break

          case 'right':
            this.text.textAlign = 'left'
            this.btnAlign.innerHTML = icons.alignleft
            break
        }
        break
    }
    this.canvas.renderAll()
    this.canvas.historySaveAction()
    this.activeBtnHandler()
  }

  activeBtnHandler() {
    function isActive(btn, activeness) {
      btn
        ?.querySelectorAll('path')
        .forEach((path) =>
          path.setAttribute('stroke', activeness ? '#7929DE' : 'black')
        )
    }

    isActive(this.btnBold, this.text.fontWeight === 'bold')
    isActive(this.btnItalic, this.text.fontStyle === 'italic')
    isActive(this.btnUnderline, this.text.underline === true)
    isActive(this.btnStrike, this.text.linethrough === true)
    isActive(this.btnFlipX, this.text.flipX === true)
    isActive(this.btnFlipY, this.text.flipY === true)
  }
}
