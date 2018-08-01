const GameUtils = require('./game-utils');
const DistanceMeter = require('./distance-meter');
const Horizon = require('./horizon');
const Trex = require('./trex');
const TrexGroup = require('./trex-group');

function createCanvas(container, width, height) {
  const canvas = document.createElement('canvas');
  canvas.className = 'game-canvas';
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);
  return canvas;
}

class Runner {
  constructor(outerContainerId, options) {
    this.generation = 0;
    this.isFirstTime = false;
    this.outerContainerEl = document.querySelector(outerContainerId);
    this.generationEl = this.outerContainerEl.querySelector('.generation');
    this.config = Object.assign({}, options);
    this.width = GameUtils.canvasWidth;
    this.height = GameUtils.canvasHeight;
    this.distanceRan = 0;
    this.highestScore = 0;
    this.time = 0;
    this.runningTime = 0;
    this.msPerFrame = 1000 / GameUtils.FPS;
    this.currentSpeed = GameUtils.speed;
    this.obstacles = [];
    this.activated = false;
    this.playing = false;
    this.crashed = false;
    this.playCount = 0;
    this.eventListeners = {};
    this.level = this.config.level || 'hard';
  }

  on(name, fn) {
    if (!this.eventListeners[name]) {
      this.eventListeners[name] = [];
    }
    this.eventListeners[name].push(fn);
  }

  raise(name, event) {
    event.name = name;
    const result = [];
    if (this.eventListeners[name]) {
      this.eventListeners[name].forEach(fn => { result.push(fn(event)); });
    }
    return result;
  }

  async init() {
    await GameUtils.loadImageSprite();
    this.spriteDef = {
      CACTUS_LARGE: { x: 332, y: 2 },
      CACTUS_SMALL: { x: 228, y: 2 },
      CLOUD: { x: 86, y: 2 },
      HORIZON: { x: 2, y: 54 },
      PTERODACTYL: { x: 134, y: 2 },
      TEXT_SPRITE: { x: 655, y: 2 },
      TREX: { x: 848, y: 2 }
    };;

    this.adjustDimensions();
    this.setSpeed();

    this.containerEl = document.createElement('div');
    this.containerEl.className = 'game-container';
    this.containerEl.style.width = `${this.width}px`;

    this.canvas = createCanvas(this.containerEl, this.width, this.height);

    this.canvasCtx = this.canvas.getContext('2d');
    this.canvasCtx.fillStyle = '#f7f7f7';
    this.canvasCtx.fill();

    this.horizon = new Horizon(this.canvas, this.spriteDef, this.width, this.height,
      GameUtils.gapCoefficient, this.level);

    this.distanceMeter = new DistanceMeter(this.canvas, this.spriteDef.TEXT_SPRITE, this.width);

    this.trexGroup = new TrexGroup(this.config.trexCount, this.canvas, this.spriteDef.TREX, this);
    this.trexGroup.onRunning = this.raise.bind(this, 'running');
    this.trexGroup.onCrash = this.raise.bind(this, 'crash');
    [this.trex] = this.trexGroup.trexes;

    this.outerContainerEl.appendChild(this.containerEl);

    this.update();
  }

  adjustDimensions() {
    const boxStyles = window.getComputedStyle(this.outerContainerEl);
    const padding = Number(
      boxStyles.paddingLeft.substr(0, boxStyles.paddingLeft.length - 2)
    );
    this.width = this.outerContainerEl.offsetWidth - padding * 2;
  }

  setSpeed(speed) {
    this.currentSpeed = speed || this.currentSpeed;
  }

  startGame() {
    this.runningTime = 0;
    this.playCount += 1;
  }

  clearCanvas() {
    this.canvasCtx.clearRect(0, 0, this.width, this.height);
  }

  update() {
    this.updatePending = false;
    const now = GameUtils.getTimeStamp();
    const deltaTime = now - (this.time || now);
    this.time = now;
    if (this.playing) {
      this.clearCanvas();
      this.trexGroup.updateJump(deltaTime);
      this.runningTime += deltaTime;
      if (this.isFirstTime) {
        if (!this.activated && !this.crashed) {
          this.playing = true;
          this.activated = true;
          this.startGame();
        }
      }
      this.horizon.update(deltaTime, this.currentSpeed);
      let gameOver = false;
      gameOver = this.trexGroup.checkForCollision(this.horizon.obstacles[0]);
      if (!gameOver) {
        this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
        if (this.currentSpeed < GameUtils.maxSpeed && this.level !== 'easy') {
          this.currentSpeed += GameUtils.acceleration;
        }
      } else {
        this.gameOver();
      }
      this.distanceMeter.update(deltaTime, Math.ceil(this.distanceRan));
    }

    if (this.playing || (!this.activated)) {
      this.trexGroup.update(deltaTime);
      this.scheduleNextUpdate();
    }

    const lives = this.trexGroup.lives();
    if (lives > 0) {
      this.generationEl.innerText = `${this.config.title}\nGENERATION #${this.generation} | LIVE x ${this.trexGroup.lives()}`;
    } else {
      this.generationEl.innerHTML = `${this.config.title}\n<div style="color: red;">GENERATION #${this.generation}  |  GAME OVER</div>`;
    }
  }

  scheduleNextUpdate() {
    if (!this.updatePending) {
      this.updatePending = true;
      this.raqId = requestAnimationFrame(this.update.bind(this));
    }
  }

  isRunning() {
    return !!this.raqId;
  }

  gameOver() {
    this.stop();
    this.crashed = true;
    this.distanceMeter.achievement = false;
    this.trexGroup.update(10, Trex.status.CRASHED);
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }
    this.time = GameUtils.getTimeStamp();
    this.raise.bind(this, 'gameover')({ trexes: this.trexGroup.trexes });
    setTimeout(() => {
      this.restart();
    }, 500);
  }

  stop() {
    this.playing = false;
    cancelAnimationFrame(this.raqId);
    this.raqId = 0;
  }

  play() {
    if (!this.crashed) {
      this.playing = true;
      this.trexGroup.update(0, Trex.status.RUNNING);
      this.time = GameUtils.getTimeStamp();
      this.update();
    }
  }

  restart() {
    if (!this.raqId) {
      this.playCount += 1;
      this.runningTime = 0;
      this.playing = true;
      this.crashed = false;
      this.distanceRan = 0;
      this.setSpeed(GameUtils.speed);
      this.time = GameUtils.getTimeStamp();
      this.clearCanvas();
      this.distanceMeter.reset(this.highestScore);
      this.horizon.reset();
    } else {
      this.isFirstTime = true;
    }
    this.trexGroup.reset();
    this.raise.bind(this, 'reset')({ trexes: this.trexGroup.trexes });
    if (this.isFirstTime || !this.playing) {
      this.playing = true;
      this.update();
    }
  this.generation += 1;
  }
}

module.exports = Runner;
