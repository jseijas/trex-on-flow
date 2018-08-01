const GameUtils = require('../game/game-utils');
const { Runner } = require('../game');

/**
 * Base Class for a T-Rex resolutor. It implements the basic operations.
 * There are some things that you can change/implement in child:
 * - resolvePrediciton(trex, state, prediction, resolve)
 *   Is the method to resolve a prediction into an action, and call resolve
 *   with the action to be executed. By default, the action equals the 
 *   prediction.
 * - initModel(trexes)
 *   Method that happen when there is a game reset for the first time.
 * - initTrex(trex)
 *   Method that happen when there is a game reset for the first time, but
 *   for each trex. 
 * - reset(trexes)
 *   Method that happen when there is a reset, except the first time.
 * - resetTrex(trex, i)
 *   Method that happen when there is a reset, except the first time, and
 *   executed for every single trex.
 * - afterCrash(trex, state, distance)
 *   Happens every time a trex crash.
 * - afterGameOver(trexes)
 *   Happens when all the trexes crashed.
 */
class BaseApp {
  /**
   * Constructor of the class.
   * @param {Object} settings - Settings for the instance.
   */
  constructor(settings) {
    this.settings = settings || {};
    this.trexCount = this.settings.trexCount || 1;
    this.containerId = this.settings.containerId || '.game';
    this.firstTime = true;
    this.title = 'BaseApp';
    this.level = this.settings.level || 'hard';
    this.numVariables = this.getNumVariables();
  }

  /**
   * Returns the number of variables based on the difficulty level.
   * @returns {number} Number of variables of the state vector.
   */
  getNumVariables() {
    switch (this.level) {
      case 'easy': return 1;
      case 'medium': return 3;
      default: return 5;
    }
  }

  /**
   * Initializes the runner of the game for this app.
   */
  async init() {
    this.runner = new Runner(this.containerId, {
      trexCount: this.trexCount,
      onRunning: this.handleRunning.bind(this),
      title: this.title,
      level: this.level
    });
    this.runner.on('running', this.handleRunning.bind(this));
    this.runner.on('reset', this.handleReset.bind(this));
    this.runner.on('crash', this.handleCrash.bind(this));
    this.runner.on('gameover', this.handleGameOver.bind(this));
    await this.runner.init();
    this.runner.restart();
  }

  /**
   * Does a prediction based on a trex and a vector with the state.
   * @param {Object} trex - TRex instance
   * @param {number[]} vector - Vector representing the state.
   * @returns {number} Returns 0 if the trex should run, 1 if should jump.
   */
  predict(trex, vector) {
    const inputX = vector[0];
    let y = trex.model.biases[0];
    for (let i = 0; i < this.numVariables; i += 1) {
      y += trex.model.weights[i] * inputX[i];
    }
    if (y >= 0) {
      return 1;
    }
    return 0;
  }

  /**
   * Converts a state object to a normalized vector of values representing the state.
   * @param {Object} state State object. 
   * @returns {number[]} Normalized vector representing the state.
   */
  stateToVector(state) {
    let result;
    if (!state) {
      result = [0, 0, 0, 0, 0];
    } else {
      result = [
        state.obstacleX / GameUtils.canvasWidth,
        state.obstacleWidth / GameUtils.canvasWidth,
        state.speed / 100,
        state.obstacleY / GameUtils.canvasHeight,
        state.obstacleHeight / GameUtils.canvasHeight
      ]
    }
    return result.slice(0, this.numVariables);
  }

  /**
   * Method to resolve a prediction into an action, and then is responsible
   * of calling the callback function resolve with the action.
   * @param {Object} trex - TRex instance. 
   * @param {Object} state - Current state object.
   * @param {Object} prediction - Prediction object or value of the system. 
   * @param {Function} resolve - Callback function to resolve the action.
   */
  resolvePrediction(trex, state, prediction, resolve) {
    return resolve(prediction);
  }

  /**
   * Method that happen when there is a game reset for the first time.
   */
  initModel() {
  }

  /**
   * Method that happen when there is a game reset for the first time,
   * receiving each trex.
   */
  initTrex() {
  }

  /**
   * Method that happen when there is a reset, except the first time.
   */
  reset() {
  }

  /**
   * Method that happen when there is a reset, except the first time, and
   * executed for every single trex.
   */
  resetTrex() {
  }

  /**
   * Happens every time a trex crash.
   */
  afterCrash() {
  }

  /**
   * Happens when all the trexes crashed.
   */
  afterGameOver() {
  }

  /**
   * Handler of the crash.
   * @param {Object} event - Event of the crash. 
   */
  handleCrash(event) {
    const { trex, state, distance } = event;
    this.afterCrash(trex, state, distance);
  }

  /**
   * Handler of a reset.
   * @param {Object} event - Event of the reset. 
   */
  handleReset(event) {
    const { trexes } = event;
    if (this.firstTime) {
      this.firstTime = false;
      this.initModel(trexes);
      trexes.forEach((trex, i) => {
        this.initTrex(trex, i);
      });
    } else {
      this.reset(trexes);
      trexes.forEach((trex, i) => {
        this.resetTrex(trex, i);
      });
    }
  }

  /**
   * Handler for the running event. Should return a promise that resolve the action.
   * @param {Object} event - Event of the running.
   * @returns {Promise<number>} Promise to resolve the action. 
   */
  handleRunning(event) {
    const { trex, state } = event;
    const result = new Promise((resolve) => {
      if (!trex.jumping) {
        const prediction = this.predict(trex, [this.stateToVector(state)]);
        return this.resolvePrediction(trex, state, prediction, resolve);
      }
      return resolve(0);
    });
    return result;
  }

  /**
   * Handler for the Game Over event.
   * @param {Object} event - Event of the game over.
   */
  handleGameOver(event) {
    this.afterGameOver(event.trexes);
  }

  /**
   * Static method to get a random number between -1 and 1.
   * @returns {number} Random number between -1 and 1.
   */
  static random() {
    return (Math.random() - 0.5) * 2;
  }
}

module.exports = BaseApp;
