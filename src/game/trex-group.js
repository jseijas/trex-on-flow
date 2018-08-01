const Trex = require('./trex');

class TrexGroup {
  constructor(count, canvas, spriteDef, runner) {
    this.runner = runner;
    this.trexes = [];
    this.onRunning = () => {};
    this.onCrash = () => {};
      for (let i = 0; i < count; i += 1) {
      const trex = new Trex(canvas, spriteDef, this.runner);
      trex.id = i;
      this.trexes.push(trex);
    }
    this.eventListeners = {};
  }

  on(name, fn) {
    if (!this.eventListeners[name]) {
      this.eventListeners[name] = [];
    }
    this.eventListeners[name].push(fn);
  }

  raise(name, event) {
    if (this.eventListeners[name]) {
      event.name = name;
      this.eventListeners[name].forEach(fn => { fn(event); });
    }
  }

  update(deltaTime, status) {
    this.trexes.forEach((trex) => {
      if (!trex.crashed) {
        trex.update(deltaTime, status);
      }
    });
  }

  draw(x, y) {
    this.trexes.forEach((trex) => {
      if (!trex.crashed) {
        trex.draw(x, y);
      }
    });
  }

  updateJump(deltaTime, speed) {
    this.trexes.forEach((trex) => {
      if (!trex.crashed && trex.jumping) {
        trex.updateJump(deltaTime, speed);
      }
    });
  }

  reset() {
    this.trexes.forEach((trex) => {
      trex.reset();
    });
  }

  lives() {
    return this.trexes.reduce((count, trex) => trex.crashed ? count : count + 1, 0);
  }

  checkForCollision(obstacle) {
    let crashes = 0;
    const state = {
      obstacleX: obstacle.xPos,
      obstacleY: obstacle.yPos,
      obstacleWidth: obstacle.width,
      obstacleHeight: obstacle.typeConfig.height,
      speed: this.runner.currentSpeed
    };
    this.trexes.forEach(async (trex) => {
      if (!trex.crashed) {
        const result = Trex.checkForCollision(obstacle, trex);
        if (result) {
          crashes += 1;
          trex.crashed = true;
          const distance = this.runner.distanceRan;
          this.onCrash({ trex, state, distance });
        } else {
          const actions = this.onRunning({ trex, state });
          const actionPromise = Array.isArray(actions) ? actions[0] : actions;
          const action = await actionPromise;
          if (action === 1) {
            trex.startJump();
          } else if (action === -1) {
            if (trex.jumping) {
              trex.setSpeedDrop();
            } else if (!trex.jumping && !trex.ducking) {
              trex.setDuck(true);
            }
          }
        }
      } else {
        crashes += 1;
      }
    });
    return crashes === this.trexes.length;
  }
}

module.exports = TrexGroup;