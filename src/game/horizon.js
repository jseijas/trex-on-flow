const Drawable = require('./drawable');
const Cloud = require('./cloud');
const GameUtils = require('./game-utils');
const HorizonLine = require('./horizon-line');
const Obstacle = require('./obstacle');

class Horizon extends Drawable {
  constructor(canvas, spritePos, width, height, gapCoefficient, level) {
    super(canvas, spritePos);
    this.config = Horizon.config;
    this.width = width;
    this.height = height;
    this.gapCoefficient = gapCoefficient;
    this.obstacles = [];
    this.obstacleHistory = [];
    this.horizonOffsets = [0, 0];
    this.cloudFrequency = GameUtils.cloudFrequency;
    this.clouds = [];
    this.cloudSpeed = GameUtils.cloudSpeed;
    this.horizonLine = null;
    this.level = level;
    this.init();
  }

  init() {
    this.addCloud();
    this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON);
  }

  update(deltaTime, currentSpeed) {
    this.runningTime += deltaTime;
    this.horizonLine.update(deltaTime, currentSpeed);
    this.updateClouds(deltaTime, currentSpeed);
    this.updateObstacles(deltaTime, currentSpeed);
  }

  validCloudSpace() {
    if (this.clouds.length === 0) {
      return true;
    }
    if (this.clouds.length >= GameUtils.maxClouds || this.cloudFrequency <= Math.random()) {
      return false;
    }
    const lastCloud = this.clouds[this.clouds.length - 1];
    return this.width - lastCloud.xPos > lastCloud.cloudGap;
  }

  updateClouds(deltaTime, speed) {
    this.clouds.forEach((cloud) => cloud.update(this.cloudSpeed / 1000 * deltaTime * speed));
    this.clouds = this.clouds.filter(obj => obj.isVisible());
    if (this.validCloudSpace()) {
      this.addCloud();
    }
  }

  updateObstacles(deltaTime, currentSpeed) {
    const updatedObstacles = this.obstacles.slice(0);

    for (let i = 0; i < this.obstacles.length; i += 1) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime, currentSpeed);
      if (!obstacle.isVisible()) {
        updatedObstacles.shift();
      }
    }
    this.obstacles = updatedObstacles;

    if (this.obstacles.length > 0) {
      const lastObstacle = this.obstacles[this.obstacles.length - 1];

      if (
        lastObstacle &&
        !lastObstacle.followingObstacleCreated &&
        lastObstacle.isVisible() &&
        lastObstacle.xPos + lastObstacle.width + lastObstacle.gap <
          this.width
      ) {
        this.addNewObstacle(currentSpeed);
        lastObstacle.followingObstacleCreated = true;
      }
    } else {
      // Create new obstacles.
      this.addNewObstacle(currentSpeed);
    }
  }

  removeFirstObstacle() {
    this.obstacles.shift();
  }

  canAddObstacle(obstacleType, currentSpeed) {
    if (this.duplicateObstacleCheck(obstacleType.type)) {
      return false;
    }
    if (this.level === 'easy' && obstacleType.minSpeed > 0) {
      return false;
    }
    if (this.level === 'medium' && currentSpeed < obstacleType.minSpeed) {
      return false;
    }
    return true;
  }

  addNewObstacle(currentSpeed) {
    let obstacleType;
    do {
      const obstacleTypeIndex = GameUtils.random(0, Obstacle.types.length - 1);
      obstacleType = Obstacle.types[obstacleTypeIndex];
    } while (!this.canAddObstacle(obstacleType, currentSpeed));
    const obstacleSpritePos = this.spritePos[obstacleType.type];
    this.obstacles.push(
      new Obstacle(
        this.canvas,
        obstacleType,
        obstacleSpritePos,
        this.width,
        this.height,
        this.gapCoefficient,
        currentSpeed,
        obstacleType.width
      )
    );
    this.obstacleHistory.unshift(obstacleType.type);
    if (this.obstacleHistory.length > 1) {
      this.obstacleHistory.splice(GameUtils.runnerMaxObstacleDuplication);
    }
  }

  duplicateObstacleCheck(nextObstacleType) {
    let duplicateCount = 0;
    for (let i = 0; i < this.obstacleHistory.length; i += 1) {
      duplicateCount = this.obstacleHistory[i] === nextObstacleType ? duplicateCount + 1 : 0;
    }
    return duplicateCount >= GameUtils.runnerMaxObstacleDuplication;
  }

  reset() {
    this.obstacles = [];
    this.horizonLine.reset();
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  addCloud() {
    this.clouds.push(
      new Cloud(this.canvas, this.spritePos.CLOUD, this.width)
    );
  }
}

module.exports = Horizon;