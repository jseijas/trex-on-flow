const Drawable = require('./drawable');
const GameUtils = require('./game-utils');

class DistanceMeter extends Drawable {

  constructor(canvas, spritePos, canvasWidth) {
    super(canvas, spritePos);
    this.x = canvasWidth - GameUtils.distanceMeterDestWidth * (GameUtils.maxDistanceUnits + 1);
    this.y = 5;
    this.maxScore = 0;
    this.highScore = 0;

    this.digits = [];
    this.achievement = false;
    this.defaultString = '';
    this.flashTimer = 0;
    this.flashIterations = 0;

    this.maxScoreUnits = GameUtils.maxDistanceUnits;
    this.init();
  }

  init() {
    for (let i = 0; i < GameUtils.maxDistanceUnits; i += 1) {
      this.defaultString += 0;
      this.draw(i, 0);
    }
    this.maxScore = (10 ** GameUtils.maxDistanceUnits) - 1;
  }

  draw(digitPos, value, highScore) {
    let sourceX = GameUtils.distanceMeterWidth * value;
    let sourceY = 0;

    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;

    this.canvasCtx.save();

    let { x } = this;
    if (highScore) {
      x -= this.maxScoreUnits * 2 * GameUtils.distanceMeterWidth;
    }
    this.canvasCtx.translate(x, this.y);

    this.canvasCtx.drawImage(
      GameUtils.imageSprite,
      sourceX,
      sourceY,
      GameUtils.distanceMeterWidth,
      GameUtils.distanceMeterHeight,
      digitPos * GameUtils.distanceMeterDestWidth,
      this.y,
      GameUtils.distanceMeterWidth,
      GameUtils.distanceMeterHeight
    );

    this.canvasCtx.restore();
  }

  getActualDistance(distance) {
    return distance ? Math.round(distance * 0.025) : 0;
  }

  update(deltaTime, distance) {
    let paint = true;

    if (!this.achievement) {
      distance = this.getActualDistance(distance);
      if (distance > this.maxScore && this.maxScoreUnits === GameUtils.maxDistanceUnits) {
        this.maxScoreUnits += 1;
        this.maxScore = parseInt(`${this.maxScore}9`, 1);
      } else {
        this.distance = 0;
      }

      if (distance > 0) {
        if (distance % GameUtils.achievementDistance === 0) {
          this.achievement = true;
          this.flashTimer = 0;
        }

        // Create a string representation of the distance with leading 0.
        const distanceStr = (this.defaultString + distance).substr(-this.maxScoreUnits);
        this.digits = distanceStr.split('');
      } else {
        this.digits = this.defaultString.split('');
      }
    } else if (this.flashIterations <= GameUtils.flashIterations) {
      this.flashTimer += deltaTime;

      if (this.flashTimer < GameUtils.flashDuration) {
        paint = false;
      } else if (this.flashTimer > GameUtils.flashDuration * 2) {
        this.flashTimer = 0;
        this.flashIterations += 1;
      }
    } else {
      this.achievement = false;
      this.flashIterations = 0;
      this.flashTimer = 0;
    }

    if (paint) {
      for (let i = this.digits.length - 1; i >= 0; i -= 1) {
        this.draw(i, parseInt(this.digits[i], 0));
      }
    }

    this.drawHighScore();
  }

  drawHighScore() {
    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = 0.8;
    for (let i = this.highScore.length - 1; i >= 0; i -= 1) {
      this.draw(i, parseInt(this.highScore[i], 10), true);
    }
    this.canvasCtx.restore();
  }

  setHighScore(distance) {
    distance = this.getActualDistance(distance);
    const highScoreStr = (this.defaultString + distance).substr(-this.maxScoreUnits);
    this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
  }

  reset() {
    this.update(0);
    this.achievement = false;
  }

  calcXPos(canvasWidth) {
    this.x = canvasWidth - GameUtils.distanceMeterDestWidth * (GameUtils.maxDistanceUnits + 1);
  }
}

module.exports = DistanceMeter;
