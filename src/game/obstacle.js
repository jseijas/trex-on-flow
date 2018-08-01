const Drawable = require('./drawable');
const GameUtils = require('./game-utils');
const Rectangle = require('./rectangle');


class Obstacle extends Drawable {
  constructor(canvas, type, spritePos, width, height, gapCoefficient, speed, offset) {
    super(canvas, spritePos);
    this.typeConfig = type;
    this.gapCoefficient = gapCoefficient;
    this.size = GameUtils.random(1, GameUtils.maxObstacleLenght);
    this.width = width;
    this.height = height;
    this.xPos = this.width + (offset || 0);
    this.yPos = 0;
    this.width = 0;
    this.collisionBoxes = [];
    this.gap = 0;
    this.speedOffset = 0;
    this.currentFrame = 0;
    this.timer = 0;
    this.init(speed);
  }

  init(speed) {
    this.cloneCollisionBoxes();
    if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      this.size = 1;
    }
    this.width = this.typeConfig.width * this.size;
    if (Array.isArray(this.typeConfig.yPos)) {
      const yPosConfig = this.typeConfig.yPos;
      this.yPos = yPosConfig[GameUtils.random(0, yPosConfig.length - 1)];
    } else {
      this.yPos = this.typeConfig.yPos;
    }

    this.draw();
    if (this.size > 1) {
      this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width
        - this.collisionBoxes[2].width;
      this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
    }
    if (this.typeConfig.speedOffset) {
      this.speedOffset = (Math.random() > 0.5 ? 1 : -1) * this.typeConfig.speedOffset;
    }
    this.gap = this.getGap(this.gapCoefficient, speed);
  }

  draw() {
    const sourceWidth = this.typeConfig.width;
    const sourceHeight = this.typeConfig.height;

    // X position in sprite.
    let sourceX =
      sourceWidth * this.size * (0.5 * (this.size - 1)) + this.spritePos.x;

    // Animation frames.
    if (this.currentFrame > 0) {
      sourceX += sourceWidth * this.currentFrame;
    }

    this.canvasCtx.drawImage(
      GameUtils.imageSprite,
      sourceX,
      this.spritePos.y,
      sourceWidth * this.size,
      sourceHeight,
      this.xPos,
      this.yPos,
      this.typeConfig.width * this.size,
      this.typeConfig.height
    );
  }

  update(deltaTime, speed) {
    if (this.isVisible()) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset;
      }
      this.xPos -= Math.floor(speed * GameUtils.FPS / 1000 * deltaTime);
      if (this.typeConfig.numFrames) {
        this.timer += deltaTime;
        if (this.timer >= this.typeConfig.frameRate) {
          this.currentFrame =
            this.currentFrame === this.typeConfig.numFrames - 1
              ? 0
              : this.currentFrame + 1;
          this.timer = 0;
        }
      }
      this.draw();
    }
  }

  getGap(gapCoefficient, speed) {
    const minGap = Math.round(
      this.width * speed + this.typeConfig.minGap * gapCoefficient
    );
    const maxGap = Math.round(minGap * GameUtils.maxObstacleGapCoefficient);
    return GameUtils.random(minGap, maxGap);
  }

  isVisible() {
    return this.xPos + this.width > 0;
  }

  cloneCollisionBoxes() {
    const { collisionBoxes } = this.typeConfig;
    for (let i = collisionBoxes.length - 1; i >= 0; i -= 1) {
      this.collisionBoxes[i] = new Rectangle(collisionBoxes[i]);
    }
  }
}

Obstacle.types = [
  {
    type: 'CACTUS_SMALL',
    width: 17,
    height: 35,
    yPos: 105,
    multipleSpeed: 4,
    minGap: 120,
    minSpeed: 0,
    collisionBoxes: Rectangle.group([0, 7, 5, 27], [4, 0, 6, 34], [10, 4, 7, 14])
  },
  {
    type: 'CACTUS_LARGE',
    width: 25,
    height: 50,
    yPos: 90,
    multipleSpeed: 7,
    minGap: 120,
    minSpeed: 0,
    collisionBoxes: Rectangle.group([0, 12, 7, 38], [8, 0, 7, 49], [13, 10, 10, 38])
  },
  {
    type: 'PTERODACTYL',
    width: 46,
    height: 40,
    yPos: [100, 75, 50],
    yPosMobile: [100, 50],
    multipleSpeed: 999,
    minSpeed: 8.5,
    minGap: 150,
    collisionBoxes: Rectangle.group([15, 15, 16, 5], [18, 21, 24, 6], [2, 14, 4, 3],
      [6, 10, 4, 7], [10, 8, 6, 9]),
    numFrames: 2,
    frameRate: 1000 / 6,
    speedOffset: 0.8
  }
];


module.exports =  Obstacle;
