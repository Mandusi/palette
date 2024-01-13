import ClothEditor from './clotheditor'

const root = document.querySelector('#root')

const product = {
    src: 'https://url.to/the/image.png',
    width: 1000,
    height: 1400,
    canvas: {
        x0: 160,
        x1: 700,
        y0: 200,
        y1: 700,
    },
}

new ClothEditor(root, product)
