const Drawable = require('./drawable');
const GameUtils = require('./game-utils');

class Cloud extends Drawable {
  constructor(canvas, spritePos, containerWidth) {
    super(canvas, spritePos);
    this.xPos = containerWidth;
    this.yPos = 0;
    this.cloudGap = GameUtils.random(GameUtils.minCloudGap, GameUtils.maxCloudGap);
    this.init();
  }

  init() {
    this.yPos = GameUtils.random(GameUtils.minSkyLevel, GameUtils.maxSkyLevel);
    this.draw();
  }

  draw() {
    this.canvasCtx.save();
    this.canvasCtx.drawImage(GameUtils.imageSprite, this.spritePos.x, this.spritePos.y,
      GameUtils.cloudWidth, GameUtils.cloudHeight, this.xPos, this.yPos,
      GameUtils.cloudWidth, GameUtils.cloudHeight);
    this.canvasCtx.restore();
  }

  update(speed) {
    this.xPos -= Math.ceil(speed);
    if (this.isVisible()) {
      this.draw();
    }
  }

  isVisible() {
    return this.xPos + GameUtils.cloudWidth > 0;
  }
}

module.exports = Cloud;
