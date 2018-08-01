const BaseApp = require('./base-app');

/**
 * Random resolver
 */
class RandomApp extends BaseApp {
  /**
   * Constructor of the class.
   * @param {Object} settings - Settings for the instance.
   */
  constructor(settings) {
    super(settings);
    this.title = 'Random';
  }

  /**
   * Method that happen when there is a game reset for the first time,
   * receiving each trex.
   * @param {Object} trex - TRex instance.
   */
  initTrex(trex) {
    trex.model = {};
    trex.model.weights = [];
    trex.model.biases = [];
    this.fillModel(trex);
  }

  /**
   * Fills the model weights and bias at random.
   * @param {Object} trex 
   */
  fillModel(trex) {
    for (let i = 0; i < this.numVariables; i += 1) {
      trex.model.weights[i] = BaseApp.random();
    }
    trex.model.biases[0] = BaseApp.random();
  }

  /**
   * Trex crashed, so the model must be recalculated.
   * @param {Object} trex - TRex instance. 
   */
  afterCrash(trex) {
    this.fillModel(trex);
  }
}

module.exports = RandomApp;