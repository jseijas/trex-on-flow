class Drawable {
  constructor(canvas, spritePos) {
    this.canvas = canvas;
    this.canvasCtx = this.canvas.getContext('2d');
    this.spritePos = spritePos;
  }
}

module.exports = Drawable;
