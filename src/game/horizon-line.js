const GameUtils = require('./game-utils');
const Drawable = require('./drawable');

class HorizonLine extends Drawable {
  constructor(canvas, spritePos) {
    super(canvas, spritePos);
    HorizonLine.dimensions = {
      WIDTH: 600,
      HEIGHT: 12,
      YPOS: 127
    }
    this.sourceDimensions = {};
    this.dimensions = HorizonLine.dimensions;
    this.sourceXPos = [this.spritePos.x, this.spritePos.x + GameUtils.canvasWidth];
    this.xPos = [];
    this.yPos = 0;
    this.bumpThreshold = 0.5;

    this.setSourceDimensions();
    this.draw();
  }

  setSourceDimensions() {
    /* eslint-disable-next-line */
    for (const dimension in HorizonLine.dimensions) {
      this.sourceDimensions[dimension] = HorizonLine.dimensions[dimension];
      this.dimensions[dimension] = HorizonLine.dimensions[dimension];
    }

    this.xPos = [0, HorizonLine.dimensions.WIDTH];
    this.yPos = HorizonLine.dimensions.YPOS;
  }

  getRandomType() {
    return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
  }

  draw() {
    [0, 1].forEach((i) => {
      this.canvasCtx.drawImage(
        GameUtils.imageSprite,
        this.sourceXPos[i],
        this.spritePos.y,
        this.sourceDimensions.WIDTH,
        this.sourceDimensions.HEIGHT,
        this.xPos[i],
        this.yPos,
        this.dimensions.WIDTH,
        this.dimensions.HEIGHT
      );
    });
  }

  updateXPos(pos, increment) {
    this.xPos[pos] -= increment;
    this.xPos[pos === 0 ? 1 : 0] = this.xPos[pos] + this.dimensions.WIDTH;

    if (this.xPos[pos] <= -this.dimensions.WIDTH) {
      this.xPos[pos] += this.dimensions.WIDTH * 2;
      this.xPos[pos === 0 ? 1 : 0] = this.xPos[pos] - this.dimensions.WIDTH;
      this.sourceXPos[pos] = this.getRandomType() + this.spritePos.x;
    }
  }

  update(deltaTime, speed) {
    this.updateXPos(this.xPos[0] <= 0 ? 0 : 1, speed * (GameUtils.FPS / 1000) * deltaTime);
    this.draw();
  }

  reset() {
    this.xPos[0] = 0;
    this.xPos[1] = HorizonLine.dimensions.WIDTH;
  }
}

module.exports = HorizonLine;
