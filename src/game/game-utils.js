class GameUtils {
  static init() {
    GameUtils.canvasWidth = 600;
    GameUtils.canvasHeight = 150;
    GameUtils.runnerBottomPad = 10;
    GameUtils.runnerMaxObstacleDuplication = 2;
    GameUtils.imageSprite = null;
    GameUtils.FPS = 60;
    GameUtils.cloudWidth = 46;
    GameUtils.cloudHeight = 14;
    GameUtils.minSkyLevel = 30;
    GameUtils.maxSkyLevel = 71;
    GameUtils.minCloudGap = 100;
    GameUtils.maxCloudGap = 400;
    GameUtils.maxClouds = 6;
    GameUtils.cloudSpeed = 0.2;
    GameUtils.cloudFrequency = 0.5;
    GameUtils.maxObstacleGapCoefficient = 1.5;
    GameUtils.maxObstacleLenght = 3;
    GameUtils.acceleration = 0.001;
    GameUtils.gapCoefficient = 0.6;
    GameUtils.gravity = 0.6;
    GameUtils.maxSpeed = 13;
    GameUtils.minJumpHeight = 30;
    GameUtils.speed = 6;
    GameUtils.speedDropCoefficient = 3;
    GameUtils.maxDistanceUnits = 5;
    GameUtils.achievementDistance = 100;
    GameUtils.flashDuration = 250;
    GameUtils.flashIterations = 3;
    GameUtils.dropVelocity = -5;
    GameUtils.initialJumpVelocity = -10;
    GameUtils.maxJumpHeight = 30;
    GameUtils.trexHeight = 47;
    GameUtils.trexWidth = 44;
    GameUtils.trexWidthDuck = 59;
    GameUtils.distanceMeterWidth = 10;
    GameUtils.distanceMeterHeight = 13;
    GameUtils.distanceMeterDestWidth = 11;
  }

  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getTimeStamp() {
    return performance.now();
  }

  static loadImageSprite() {
    return new Promise((resolve) => {
      const imageSprite = document.createElement('img');
      // eslint-disable-next-line global-require
      imageSprite.src = require('./images/offline-sprite-trump.png');
      imageSprite.addEventListener('load', () => {
        GameUtils.imageSprite = imageSprite;
        resolve();
      });
    });
  }

  static pad(n, l) {
    let result = `${n}`;
    while (result.length < l) {
      result = `0${result}`;
    }
    return result;
  }
}

GameUtils.init();

module.exports = GameUtils;
